import type { Archetype, CardStats, CultCard, Rarity, XProfile } from '@/lib/types'
import { createRng, hashString } from './rng'
import { rarityFromScore } from './rarity'

export const ARCHETYPE_LABEL: Record<Archetype, string> = {
  trader: 'Trader',
  builder: 'Builder',
  meme: 'Meme Lord',
  alpha: 'Alpha Hunter',
  og: 'OG',
  researcher: 'Researcher',
}

export function normalizeHandle(raw: string) {
  return raw.trim().replace(/^@+/, '').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 15)
}

export function computeStats(p: XProfile): CardStats {
  const rng = createRng(`${p.handle}:stats`)
  const reputation = Math.min(99, Math.round(p.influence * 0.45 + p.accountAgeYears * 2.2 + p.engagement * 0.3 + rng.int(0, 6)))
  const consistency = Math.min(99, Math.round(p.ctActivity * 0.7 + p.accountAgeYears * 1.8 + rng.int(0, 8)))
  const ctScore = Math.round(
    p.ctActivity * 0.18 + p.engagement * 0.18 + p.influence * 0.22 + p.alpha * 0.22 + reputation * 0.12 + consistency * 0.08,
  )
  return { ctScore, reputation, influence: p.influence, engagement: p.engagement, consistency, alpha: p.alpha }
}

export function cultPower(card: Pick<CultCard, 'stats' | 'level' | 'wins'>) {
  const s = card.stats
  const base = s.ctScore * 62 + (s.reputation + s.influence + s.alpha) * 6
  return Math.round(base + card.level * 18 + card.wins * 4)
}

export function cardNumberFor(handle: string) {
  return (hashString(handle.toLowerCase()) % 99000) + 1
}

export function buildCard(p: XProfile, opts: { owner?: string; rarity?: Rarity; level?: number; id?: string } = {}): CultCard {
  const stats = computeStats(p)
  const rng = createRng(`${p.handle}:card`)
  const level = opts.level ?? Math.max(1, Math.min(60, Math.round(p.accountAgeYears * 3 + stats.ctScore / 4 - 8)))
  const wins = rng.int(level, level * 3)
  const losses = rng.int(Math.round(level / 3), level)
  return {
    id: opts.id ?? `card_${p.handle.toLowerCase()}`,
    number: cardNumberFor(p.handle),
    handle: p.handle,
    displayName: p.displayName,
    archetype: p.archetype,
    rarity: opts.rarity ?? rarityFromScore(stats.ctScore),
    level,
    xp: rng.int(0, 1800),
    stats,
    followers: p.followers,
    following: p.following,
    accountAgeYears: p.accountAgeYears,
    wins,
    losses,
    season: 'Genesis',
    edition: `${rng.int(1, 250)}/250`,
    owner: opts.owner ?? p.handle,
    minted: false,
    createdAt: 0,
    avatarUrl: p.avatarUrl ?? null,
    verified: p.verified ?? false,
    liveData: p.source === 'x',
  }
}

export function winRate(c: Pick<CultCard, 'wins' | 'losses'>) {
  const total = c.wins + c.losses
  return total === 0 ? 0 : Math.round((c.wins / total) * 100)
}
