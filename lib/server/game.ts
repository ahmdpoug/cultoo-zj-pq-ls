import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import type {
  ActivityItem,
  Archetype,
  BattleRecord,
  CultCard,
  GameState,
  Guild,
  LeaderboardEntry,
  Listing,
  QuestAction,
  Rarity,
  SeasonInfo,
  Tournament,
  TxReceipt,
} from '@/lib/types'
import { db, type Tx } from '@/lib/db'
import { activity, battles, cards, listings, players, tournamentEntries, type CardRow, type PlayerRow } from '@/lib/db/schema'
import { applyXp } from '@/lib/game/progression'
import { randomId } from '@/lib/game/rng'
import { buildCard, cultPower, normalizeHandle } from '@/lib/game/scoring'
import { RARITY_META, nextRarity } from '@/lib/game/rarity'
import { BATTLE_REWARDS, resolveBattle } from '@/lib/game/battle'
import {
  GUILD_DEFINITIONS,
  QUESTS,
  SEASON,
  TOURNAMENT_PAYOUT_RATIO,
  TOURNAMENT_TEMPLATES,
  UPGRADE_COST,
  WEEK_MS,
  parseTournamentId,
  tournamentId,
  weekStart,
} from '@/lib/game/config'
import { HttpError } from './http'
import { fetchIdentity } from './auth'
import { lookupXProfile } from './x'

/** Sentinel owner for house cards that seed the market, leaderboard and guilds. */
export const SYSTEM_ID = 'system'
const STARTER = { balance: 12_500, fragments: 240, materials: 36 }
const SEASON_PRIZE_POOL = 2_500_000
const BASE_PRICE: Record<Rarity, number> = { common: 900, rare: 3200, epic: 9500, legendary: 25_000, mythic: 88_000 }

const GUILD_BY_ARCHETYPE: Record<Archetype, string> = {
  alpha: 'alpha-order',
  researcher: 'alpha-order',
  trader: 'trader-cult',
  builder: 'builders',
  meme: 'meme-army',
  og: 'meme-army',
}

/* ---------- Mappers ---------- */

function toCard(row: CardRow, ownerHandle?: string | null): CultCard {
  return {
    id: row.id,
    number: row.number,
    handle: row.handle,
    displayName: row.displayName,
    archetype: row.archetype as Archetype,
    rarity: row.rarity as Rarity,
    level: row.level,
    xp: row.xp,
    stats: row.stats,
    followers: row.followers,
    following: row.following,
    accountAgeYears: row.accountAgeYears,
    wins: row.wins,
    losses: row.losses,
    season: row.season,
    edition: row.edition,
    owner: ownerHandle ?? row.ownerId,
    minted: row.minted,
    createdAt: row.createdAt.getTime(),
    avatarUrl: row.avatarUrl,
    verified: row.verified,
    liveData: row.liveData,
  }
}

function cardValues(card: CultCard, ownerId: string) {
  return {
    id: card.id,
    ownerId,
    handle: card.handle,
    displayName: card.displayName,
    archetype: card.archetype,
    rarity: card.rarity,
    level: card.level,
    xp: card.xp,
    stats: card.stats,
    followers: card.followers,
    following: card.following,
    accountAgeYears: card.accountAgeYears,
    wins: card.wins,
    losses: card.losses,
    season: card.season,
    edition: card.edition,
    minted: card.minted,
    avatarUrl: card.avatarUrl ?? null,
    verified: card.verified ?? false,
    liveData: card.liveData ?? true,
  }
}

function toBattle(row: typeof battles.$inferSelect): BattleRecord {
  return {
    id: row.id,
    playerCardId: row.cardId,
    opponentHandle: row.opponentHandle,
    opponentRarity: row.opponentRarity as Rarity,
    result: row.result as 'victory' | 'defeat',
    xp: row.xp,
    reward: row.reward,
    rounds: row.rounds,
    at: row.at.getTime(),
  }
}

function toActivity(row: typeof activity.$inferSelect): ActivityItem {
  return { id: String(row.id), type: row.type as ActivityItem['type'], label: row.label, at: row.at.getTime() }
}

function receipt(): TxReceipt {
  const hex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  return { hash: `0x${hex}`, at: Date.now(), explorerUrl: null }
}

function isToday(d: Date) {
  const now = new Date()
  return d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth() && d.getUTCDate() === now.getUTCDate()
}

/* ---------- Reducer helpers (DB-backed) ---------- */

async function logActivity(tx: Tx, playerId: string, type: ActivityItem['type'], label: string) {
  await tx.insert(activity).values({ playerId, type, label })
}

async function progressQuest(tx: Tx, playerId: string, action: QuestAction, amount = 1) {
  const [player] = await tx.select().from(players).where(eq(players.id, playerId)).limit(1)
  if (!player) return
  const quests = { ...player.quests }
  for (const q of QUESTS) {
    if (q.action === action) quests[q.id] = Math.min(q.target, (quests[q.id] ?? 0) + amount)
  }
  await tx.update(players).set({ quests }).where(eq(players.id, playerId))
}

async function unlockAchievement(tx: Tx, playerId: string, ...ids: string[]) {
  const [player] = await tx.select().from(players).where(eq(players.id, playerId)).limit(1)
  if (!player) return
  const next = ids.filter((id) => !player.achievements.includes(id))
  if (next.length) await tx.update(players).set({ achievements: [...player.achievements, ...next] }).where(eq(players.id, playerId))
}

async function grantXp(tx: Tx, playerId: string, cardId: string, xp: number) {
  const [card] = await tx.select().from(cards).where(and(eq(cards.id, cardId), eq(cards.ownerId, playerId))).limit(1)
  if (!card) return { levelsGained: 0 }
  const r = applyXp(card.level, card.xp, xp)
  await tx.update(cards).set({ level: r.level, xp: r.xp }).where(eq(cards.id, cardId))
  await tx.update(players).set({ seasonXp: sql`${players.seasonXp} + ${xp}` }).where(eq(players.id, playerId))
  if (r.levelsGained > 0) await logActivity(tx, playerId, 'level', `Reached level ${r.level}`)
  if (r.level >= 100) await unlockAchievement(tx, playerId, 'cult-legend')
  return { levelsGained: r.levelsGained }
}

/* ---------- Player ---------- */

export async function getOrCreatePlayer(userId: string): Promise<PlayerRow> {
  const [existing] = await db.select().from(players).where(eq(players.id, userId)).limit(1)
  if (existing?.xHandle && existing.walletAddress) return existing

  const identity = await fetchIdentity(userId).catch(() => null)

  if (!existing) {
    const [inserted] = await db
      .insert(players)
      .values({
        id: userId,
        xId: identity?.xId ?? null,
        xHandle: identity?.xHandle ?? null,
        displayName: identity?.displayName ?? null,
        avatarUrl: identity?.avatarUrl ?? null,
        walletAddress: identity?.walletAddress ?? null,
      })
      .onConflictDoNothing()
      .returning()
    if (inserted) return inserted
    const [again] = await db.select().from(players).where(eq(players.id, userId)).limit(1)
    return again
  }

  if (!identity) return existing
  const [updated] = await db
    .update(players)
    .set({
      xId: identity.xId ?? existing.xId,
      xHandle: identity.xHandle ?? existing.xHandle,
      displayName: identity.displayName ?? existing.displayName,
      avatarUrl: identity.avatarUrl ?? existing.avatarUrl,
      walletAddress: identity.walletAddress ?? existing.walletAddress,
    })
    .where(eq(players.id, userId))
    .returning()
  return updated
}

export async function loadGameState(playerId: string): Promise<GameState> {
  const [player] = await db.select().from(players).where(eq(players.id, playerId)).limit(1)
  if (!player) throw new HttpError(404, 'Player not found.')

  const [cardRows, battleRows, activityRows, entryRows, listingRows] = await Promise.all([
    db.select().from(cards).where(eq(cards.ownerId, playerId)).orderBy(desc(cards.createdAt)),
    db.select().from(battles).where(eq(battles.playerId, playerId)).orderBy(desc(battles.at)).limit(30),
    db.select().from(activity).where(eq(activity.playerId, playerId)).orderBy(desc(activity.at)).limit(40),
    db.select().from(tournamentEntries).where(eq(tournamentEntries.playerId, playerId)),
    db.select().from(listings).where(and(eq(listings.sellerId, playerId), eq(listings.status, 'active'))),
  ])

  return {
    version: 2,
    mainCardId: player.mainCardId,
    cards: cardRows.map((c) => toCard(c, player.xHandle)),
    wallet: { address: player.walletAddress },
    economy: {
      balance: player.balance,
      pendingCult: player.pendingCult,
      fragments: player.fragments,
      materials: player.materials,
      seasonXp: player.seasonXp,
    },
    battles: battleRows.map(toBattle),
    achievements: player.achievements,
    quests: player.quests,
    claimedQuests: player.claimedQuests,
    tournaments: entryRows.map((e) => e.tournamentId),
    guildId: player.guildId,
    listings: listingRows.map((l) => ({ id: l.id, cardId: l.cardId, price: l.price })),
    rewardedBattlesToday: battleRows.filter((b) => isToday(b.at)).length,
    activity: activityRows.map(toActivity),
  }
}

/* ---------- Mutations ---------- */

async function grantStarterInventory(tx: Tx, playerId: string) {
  const pool = await tx.select().from(cards).where(eq(cards.ownerId, SYSTEM_ID)).orderBy(cards.number)
  if (pool.length === 0) return
  const byRarity = new Map<Rarity, CardRow[]>()
  for (const c of pool) {
    const r = c.rarity as Rarity
    const arr = byRarity.get(r) ?? []
    if (arr.length < 3) arr.push(c)
    byRarity.set(r, arr)
  }
  const picks: CardRow[] = []
  for (const r of ['common', 'rare', 'epic', 'legendary', 'mythic'] as Rarity[]) picks.push(...(byRarity.get(r) ?? []))
  const chosen = picks.slice(0, 9)
  if (chosen.length === 0) return
  await tx.insert(cards).values(chosen.map((c) => ({ ...cardValues(toCard(c), playerId), id: randomId('card') })))
}

export async function scanProfile(playerId: string, handleRaw: string) {
  const handle = normalizeHandle(handleRaw)
  if (!handle) throw new HttpError(400, 'Enter a valid X username (letters, numbers, underscore).')

  const profile = await lookupXProfile(handle)
  const player = await getOrCreatePlayer(playerId)
  const owner = player.xHandle ?? handle
  const card = buildCard(profile, { owner, id: randomId('card') })
  const isFirst = !player.mainCardId

  const inserted = await db.transaction(async (tx) => {
    const [row] = await tx.insert(cards).values(cardValues(card, playerId)).returning()
    if (isFirst) {
      await grantStarterInventory(tx, playerId)
      await tx
        .update(players)
        .set({
          mainCardId: row.id,
          balance: STARTER.balance,
          fragments: STARTER.fragments,
          materials: STARTER.materials,
          guildId: GUILD_BY_ARCHETYPE[card.archetype],
        })
        .where(eq(players.id, playerId))
    }
    await logActivity(tx, playerId, 'scan', `Scanned @${profile.handle} — ${RARITY_META[card.rarity].label} pulled`)
    await progressQuest(tx, playerId, 'scan')
    await unlockAchievement(tx, playerId, 'first-scan')
    return row
  })

  return { card: toCard(inserted, owner), profile }
}

export async function forgeCards(playerId: string, cardIds: string[]) {
  if (cardIds.length !== 3) throw new HttpError(400, 'Select 3 cards of the same rarity.')
  const player = await getOrCreatePlayer(playerId)
  const inputs = await db.select().from(cards).where(and(eq(cards.ownerId, playerId), inArray(cards.id, cardIds)))
  if (inputs.length !== 3) throw new HttpError(400, 'Select 3 cards of the same rarity.')
  const rarity = inputs[0].rarity as Rarity
  if (inputs.some((c) => c.rarity !== rarity)) throw new HttpError(400, 'Select 3 cards of the same rarity.')
  const out = nextRarity(rarity)
  if (!out) throw new HttpError(400, 'Mythic cards cannot be forged further.')
  const cost = RARITY_META[out].forgeCost
  if (player.balance < cost) throw new HttpError(402, `Forging requires ${cost} $CULT.`)

  const best = [...inputs].sort((a, b) => b.stats.ctScore - a.stats.ctScore)[0]
  const bump = (v: number) => Math.min(99, v + 3)
  const card: CultCard = {
    ...toCard(best, player.xHandle),
    id: randomId('card'),
    rarity: out,
    level: Math.max(...inputs.map((c) => c.level)),
    stats: {
      ctScore: bump(best.stats.ctScore),
      reputation: bump(best.stats.reputation),
      influence: bump(best.stats.influence),
      engagement: bump(best.stats.engagement),
      consistency: bump(best.stats.consistency),
      alpha: bump(best.stats.alpha),
    },
    minted: false,
    createdAt: Date.now(),
  }

  const inserted = await db.transaction(async (tx) => {
    await tx.delete(cards).where(and(eq(cards.ownerId, playerId), inArray(cards.id, cardIds)))
    const [row] = await tx.insert(cards).values(cardValues(card, playerId)).returning()
    await tx
      .update(players)
      .set({
        balance: player.balance - cost,
        materials: player.materials + 4,
        ...(cardIds.includes(player.mainCardId ?? '') ? { mainCardId: row.id } : {}),
      })
      .where(eq(players.id, playerId))
    await logActivity(tx, playerId, 'forge', `Forged a ${RARITY_META[out].label} card`)
    await progressQuest(tx, playerId, 'upgrade')
    await unlockAchievement(tx, playerId, 'forge-master')
    return row
  })

  return { card: toCard(inserted, player.xHandle) }
}

export async function upgradeCard(playerId: string, cardId: string) {
  const player = await getOrCreatePlayer(playerId)
  if (player.balance < UPGRADE_COST.cult) throw new HttpError(402, 'Not enough $CULT for an upgrade.')
  if (player.materials < UPGRADE_COST.materials) throw new HttpError(400, 'Not enough forge materials.')

  return db.transaction(async (tx) => {
    await tx
      .update(players)
      .set({ balance: player.balance - UPGRADE_COST.cult, materials: player.materials - UPGRADE_COST.materials })
      .where(eq(players.id, playerId))
    const { levelsGained } = await grantXp(tx, playerId, cardId, UPGRADE_COST.xp)
    await logActivity(tx, playerId, 'level', `Upgraded card (+${UPGRADE_COST.xp} XP)`)
    await progressQuest(tx, playerId, 'upgrade')
    return { levelsGained }
  })
}

export async function runBattle(playerId: string, cardId: string, opponentCardId: string) {
  const player = await getOrCreatePlayer(playerId)
  const [mine] = await db.select().from(cards).where(and(eq(cards.id, cardId), eq(cards.ownerId, playerId))).limit(1)
  if (!mine) throw new HttpError(404, 'Card not found.')
  const [opponent] = await db.select().from(cards).where(eq(cards.id, opponentCardId)).limit(1)
  if (!opponent) throw new HttpError(404, 'Opponent not found.')

  const { rounds, result } = resolveBattle(toCard(mine, player.xHandle), toCard(opponent))
  const reward = BATTLE_REWARDS[result]

  const levelsGained = await db.transaction(async (tx) => {
    await tx.insert(battles).values({
      id: randomId('battle'),
      playerId,
      cardId,
      opponentCardId,
      opponentHandle: opponent.handle,
      opponentRarity: opponent.rarity,
      result,
      xp: reward.xp,
      reward: reward.cult,
      rounds,
    })
    await tx
      .update(cards)
      .set(result === 'victory' ? { wins: sql`${cards.wins} + 1` } : { losses: sql`${cards.losses} + 1` })
      .where(eq(cards.id, cardId))
    const xp = await grantXp(tx, playerId, cardId, reward.xp)
    await tx
      .update(players)
      .set({ balance: player.balance + reward.cult, fragments: player.fragments + (result === 'victory' ? 12 : 3) })
      .where(eq(players.id, playerId))
    await logActivity(tx, playerId, 'battle', `${result === 'victory' ? 'Defeated' : 'Lost to'} @${opponent.handle}`)
    await unlockAchievement(tx, playerId, 'first-battle')
    if (result === 'victory') await unlockAchievement(tx, playerId, 'first-win')
    await progressQuest(tx, playerId, 'battle')
    if (result === 'victory') await progressQuest(tx, playerId, 'win')
    return xp.levelsGained
  })

  return {
    id: randomId('battle'),
    playerCardId: cardId,
    opponentHandle: opponent.handle,
    opponentRarity: opponent.rarity as Rarity,
    result,
    xp: reward.xp,
    reward: reward.cult,
    rounds,
    at: Date.now(),
    levelsGained,
  }
}

export async function buyListing(playerId: string, listingId: string) {
  const player = await getOrCreatePlayer(playerId)
  const [listing] = await db.select().from(listings).where(and(eq(listings.id, listingId), eq(listings.status, 'active'))).limit(1)
  if (!listing) throw new HttpError(404, 'This listing is no longer available.')
  if (player.balance < listing.price) throw new HttpError(402, `You need ${listing.price} $CULT.`)
  const [source] = await db.select().from(cards).where(eq(cards.id, listing.cardId)).limit(1)
  if (!source) throw new HttpError(404, 'Card not found.')

  const card: CultCard = { ...toCard(source, player.xHandle), id: randomId('card'), owner: player.xHandle ?? playerId, createdAt: Date.now() }

  const inserted = await db.transaction(async (tx) => {
    await tx.update(listings).set({ status: 'sold', buyerId: playerId, soldAt: new Date() }).where(eq(listings.id, listingId))
    const [row] = await tx.insert(cards).values(cardValues(card, playerId)).returning()
    await tx.update(players).set({ balance: player.balance - listing.price }).where(eq(players.id, playerId))
    await logActivity(tx, playerId, 'buy', `Bought @${source.handle} for ${listing.price} $CULT`)
    return row
  })

  return { receipt: receipt(), card: toCard(inserted, player.xHandle) }
}

export async function enterTournament(playerId: string, tid: string) {
  const parsed = parseTournamentId(tid)
  if (!parsed) throw new HttpError(400, 'Unknown tournament.')
  const player = await getOrCreatePlayer(playerId)
  if (player.balance < parsed.template.entry) throw new HttpError(402, 'Not enough $CULT.')
  const [main] = player.mainCardId ? await db.select().from(cards).where(eq(cards.id, player.mainCardId)).limit(1) : []
  if (!main) throw new HttpError(400, 'You need a main card to enter.')

  return db.transaction(async (tx) => {
    await tx
      .insert(tournamentEntries)
      .values({ tournamentId: tid, playerId, cardId: main.id, txHash: receipt().hash })
      .onConflictDoNothing()
    await tx.update(players).set({ balance: player.balance - parsed.template.entry }).where(eq(players.id, playerId))
    await logActivity(tx, playerId, 'tournament', `Entered ${parsed.template.name}`)
    await progressQuest(tx, playerId, 'tournament')
    return receipt()
  })
}

export async function mintCard(playerId: string, cardId: string) {
  const [card] = await db.select().from(cards).where(and(eq(cards.id, cardId), eq(cards.ownerId, playerId))).limit(1)
  if (!card) throw new HttpError(404, 'Card not found.')
  await db.transaction(async (tx) => {
    await tx.update(cards).set({ minted: true, mintedAt: new Date() }).where(eq(cards.id, cardId))
    await logActivity(tx, playerId, 'mint', 'Minted card')
  })
  return receipt()
}

export async function claimQuest(playerId: string, questId: string) {
  const quest = QUESTS.find((q) => q.id === questId)
  if (!quest) throw new HttpError(400, 'Unknown quest.')
  const player = await getOrCreatePlayer(playerId)
  if (!player.mainCardId) throw new HttpError(400, 'You need a card first.')
  if (player.claimedQuests.includes(questId)) throw new HttpError(400, 'Quest already claimed.')
  if ((player.quests[questId] ?? 0) < quest.target) throw new HttpError(400, 'Quest not complete yet.')

  await db.transaction(async (tx) => {
    await tx.update(players).set({ claimedQuests: [...player.claimedQuests, questId] }).where(eq(players.id, playerId))
    await grantXp(tx, playerId, player.mainCardId as string, quest.xp)
    await logActivity(tx, playerId, 'quest', `Quest complete: ${quest.title} (+${quest.xp} XP)`)
  })
  return { ok: true }
}

export async function recordShare(playerId: string) {
  await db.transaction(async (tx) => {
    await logActivity(tx, playerId, 'share', 'Shared card to X')
    await progressQuest(tx, playerId, 'share')
  })
  return { ok: true }
}

export async function setMainCard(playerId: string, cardId: string) {
  const [card] = await db.select().from(cards).where(and(eq(cards.id, cardId), eq(cards.ownerId, playerId))).limit(1)
  if (!card) throw new HttpError(404, 'Card not found.')
  await db.update(players).set({ mainCardId: cardId }).where(eq(players.id, playerId))
  return { ok: true }
}

export async function syncMainCard(playerId: string) {
  const player = await getOrCreatePlayer(playerId)
  if (!player.mainCardId || !player.xHandle) return { synced: false }
  const [main] = await db.select().from(cards).where(eq(cards.id, player.mainCardId)).limit(1)
  if (!main || main.handle.toLowerCase() !== player.xHandle.toLowerCase()) return { synced: false }

  const profile = await lookupXProfile(player.xHandle)
  const fresh = buildCard(profile, { owner: player.xHandle, id: main.id })
  await db
    .update(cards)
    .set({
      displayName: fresh.displayName,
      archetype: fresh.archetype,
      rarity: fresh.rarity,
      stats: fresh.stats,
      followers: fresh.followers,
      following: fresh.following,
      accountAgeYears: fresh.accountAgeYears,
      avatarUrl: fresh.avatarUrl ?? null,
      verified: fresh.verified ?? false,
      liveData: true,
      level: Math.max(main.level, fresh.level),
    })
    .where(eq(cards.id, main.id))
  return { synced: true }
}

export async function resetPlayer(playerId: string) {
  await db.transaction(async (tx) => {
    await tx.delete(cards).where(eq(cards.ownerId, playerId))
    await tx.delete(battles).where(eq(battles.playerId, playerId))
    await tx.delete(activity).where(eq(activity.playerId, playerId))
    await tx.delete(tournamentEntries).where(eq(tournamentEntries.playerId, playerId))
    await tx
      .update(players)
      .set({
        mainCardId: null,
        balance: 0,
        materials: 0,
        fragments: 0,
        seasonXp: 0,
        pendingCult: 0,
        achievements: [],
        quests: {},
        claimedQuests: [],
        guildId: null,
      })
      .where(eq(players.id, playerId))
  })
  return { ok: true }
}

/* ---------- Public reads ---------- */

/** One entry per X handle — the strongest card wins the slot. */
function bestCardPerHandle(rows: CardRow[]): CultCard[] {
  const best = new Map<string, CultCard>()
  for (const row of rows) {
    const card = toCard(row)
    const key = card.handle.toLowerCase()
    const existing = best.get(key)
    if (!existing || cultPower(card) > cultPower(existing)) best.set(key, card)
  }
  return [...best.values()]
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const rows = await db.select().from(cards).limit(1000)
  return bestCardPerHandle(rows)
    .map((card) => {
      const power = cultPower(card)
      return {
        rank: 0,
        handle: card.handle,
        displayName: card.displayName,
        avatarUrl: card.avatarUrl,
        archetype: card.archetype,
        rarity: card.rarity,
        cultPower: power,
        ctScore: card.stats.ctScore,
        wins: card.wins,
        losses: card.losses,
        seasonPoints: Math.round(power * 1.6 + card.wins * 22),
        cardNumber: card.number,
      }
    })
    .sort((a, b) => b.cultPower - a.cultPower)
    .slice(0, 100)
    .map((e, i) => ({ ...e, rank: i + 1 }))
}

export async function getSeason(): Promise<SeasonInfo> {
  const [row] = await db.select({ count: sql<number>`count(distinct lower(handle))::int` }).from(cards)
  return { ...SEASON, players: row?.count ?? 0, prizePool: SEASON_PRIZE_POOL }
}

export async function getPlayerRank(playerId: string): Promise<number | null> {
  const [player] = await db.select().from(players).where(eq(players.id, playerId)).limit(1)
  if (!player?.mainCardId) return null
  const [main] = await db.select().from(cards).where(eq(cards.id, player.mainCardId)).limit(1)
  if (!main) return null
  const power = cultPower(toCard(main))
  const rows = await db.select().from(cards).limit(1000)
  return bestCardPerHandle(rows).filter((c) => cultPower(c) > power).length + 1
}

export async function getActiveListings(): Promise<Listing[]> {
  const rows = await db
    .select({ listing: listings, card: cards, seller: players })
    .from(listings)
    .innerJoin(cards, eq(cards.id, listings.cardId))
    .leftJoin(players, eq(players.id, listings.sellerId))
    .where(eq(listings.status, 'active'))
    .orderBy(desc(listings.listedAt))
  return rows.map(({ listing, card, seller }) => ({
    id: listing.id,
    card: toCard(card, seller?.xHandle ?? card.handle),
    seller: seller?.xHandle ?? card.handle,
    price: listing.price,
    listedAt: listing.listedAt.getTime(),
  }))
}

export async function getListingById(id: string): Promise<Listing | null> {
  const rows = await db
    .select({ listing: listings, card: cards, seller: players })
    .from(listings)
    .innerJoin(cards, eq(cards.id, listings.cardId))
    .leftJoin(players, eq(players.id, listings.sellerId))
    .where(eq(listings.id, id))
    .limit(1)
  const row = rows[0]
  if (!row) return null
  return {
    id: row.listing.id,
    card: toCard(row.card, row.seller?.xHandle ?? row.card.handle),
    seller: row.seller?.xHandle ?? row.card.handle,
    price: row.listing.price,
    listedAt: row.listing.listedAt.getTime(),
  }
}

export type GuildView = Guild & { memberHandles: string[]; leaderCtScore: number | null }

export async function getGuilds(): Promise<GuildView[]> {
  const rows = await db.select().from(cards).limit(2000)
  const byGuild = new Map<string, CultCard[]>()
  for (const card of bestCardPerHandle(rows)) {
    const gid = GUILD_BY_ARCHETYPE[card.archetype]
    const arr = byGuild.get(gid) ?? []
    arr.push(card)
    byGuild.set(gid, arr)
  }
  const guilds = GUILD_DEFINITIONS.map((def) => {
    const members = [...(byGuild.get(def.id) ?? [])].sort((a, b) => cultPower(b) - cultPower(a))
    const leader = members[0]
    const xp = members.reduce((sum, c) => sum + cultPower(c), 0)
    const wins = members.reduce((sum, c) => sum + c.wins, 0)
    return {
      id: def.id,
      name: def.name,
      tag: def.tag,
      motto: def.motto,
      archetype: def.archetype,
      members: members.length,
      xp,
      rank: 0,
      wins,
      seasonPoints: Math.round(xp * 1.6 + wins * 22),
      leader: leader?.handle ?? '—',
      leaderCtScore: leader?.stats.ctScore ?? null,
      memberHandles: members.slice(0, 5).map((c) => c.handle),
    }
  })
  return guilds.sort((a, b) => b.seasonPoints - a.seasonPoints).map((g, i) => ({ ...g, rank: i + 1 }))
}

export async function getTournaments(): Promise<Tournament[]> {
  const start = weekStart()
  const end = start + WEEK_MS
  const now = Date.now()
  const counts = await db
    .select({ tournamentId: tournamentEntries.tournamentId, count: sql<number>`count(*)::int` })
    .from(tournamentEntries)
    .groupBy(tournamentEntries.tournamentId)
  const countMap = new Map(counts.map((c) => [c.tournamentId, c.count]))
  const startsInHours = Math.max(0, Math.round((end - now) / 3_600_000))
  const status: Tournament['status'] = now >= end ? 'completed' : startsInHours <= 24 ? 'live' : 'registering'

  return TOURNAMENT_TEMPLATES.map((t) => {
    const id = tournamentId(t.slug, start)
    return {
      id,
      name: t.name,
      tagline: t.tagline,
      players: countMap.get(id) ?? 0,
      maxPlayers: t.maxPlayers,
      entry: t.entry,
      prize: Math.round(t.entry * t.maxPlayers * TOURNAMENT_PAYOUT_RATIO),
      startsInHours,
      status,
      minRarity: t.minRarity,
    }
  })
}

export async function getPool(limit = 60): Promise<CultCard[]> {
  const rows = await db.select().from(cards).where(eq(cards.ownerId, SYSTEM_ID)).orderBy(desc(cards.number)).limit(limit)
  return rows.map((c) => toCard(c))
}

/* ---------- Seeding ---------- */

/** Well-known public crypto-Twitter accounts used to seed the house card pool. */
const SEED_HANDLES = [
  'vitalikbuterin',
  'cz_binance',
  'balajis',
  'naval',
  'aeyakovenko',
  'cobie',
  'hasufl',
  '0xMert_',
  'pentosh1',
  'CryptoHayes',
  'APompliano',
  'TheCryptoLark',
  'scottmelker',
  'RaoulGMI',
  'punk6529',
  'Zeneca',
  'farokh',
  'beaniemaxi',
  'Loopifyyy',
  '0xSisyphus',
  'CL207',
  'DegenSpartan',
  'sassal0x',
  'RyanSAdams',
  'laurashin',
  'AnthonySassano',
  'TrustlessState',
  'rossshneider',
  'gmoneynft',
  'CryptoCobain',
]

export async function seedSystemCards() {
  const [existing] = await db.select({ count: sql<number>`count(*)::int` }).from(cards).where(eq(cards.ownerId, SYSTEM_ID))
  if ((existing?.count ?? 0) > 0) return { seeded: false, count: existing?.count ?? 0 }

  await db.insert(players).values({ id: SYSTEM_ID, xHandle: 'cult', displayName: 'CULT Treasury' }).onConflictDoNothing()

  let inserted = 0
  let listed = 0
  for (const handle of SEED_HANDLES) {
    try {
      const profile = await lookupXProfile(handle)
      const card = buildCard(profile, { owner: 'cult', id: randomId('card') })
      const [row] = await db.insert(cards).values(cardValues(card, SYSTEM_ID)).returning()
      inserted++
      if (inserted % 2 === 0) {
        const price = Math.round((BASE_PRICE[card.rarity] * (0.85 + Math.random() * 0.5) + card.level * 40) / 50) * 50
        await db.insert(listings).values({ id: `L${String(row.number).padStart(5, '0')}`, cardId: row.id, sellerId: SYSTEM_ID, price })
        listed++
      }
    } catch {
      /* skip handles that can't be resolved */
    }
  }
  return { seeded: true, count: inserted, listed }
}
