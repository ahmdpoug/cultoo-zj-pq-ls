import type { Achievement, Archetype, Quest, Rarity } from '@/lib/types'

export const SEASON = {
  id: 'genesis-s01',
  name: 'Genesis',
  label: 'Genesis — Season 01',
  endsAt: Date.UTC(2027, 3, 1, 18, 0, 0),
  qualifyTop: 100,
}

export const UPGRADE_COST = { cult: 400, materials: 6, xp: 1200 }

/** $CULT fee to strike a card, priced by the rarity pulled. */
export const SCAN_PRICE: Record<Rarity, number> = {
  common: 1000,
  rare: 2000,
  epic: 4000,
  legendary: 8000,
  mythic: 16000,
}

/** $CULT fee to put a card on the market. */
export const LISTING_FEE = 50
export const MAX_LISTING_PRICE = 1_000_000

export const STARTER_MATERIALS = 36

export const QUESTS: Quest[] = [
  { id: 'q-scan', title: 'Scan 3 CT profiles', target: 3, xp: 100, action: 'scan' },
  { id: 'q-win', title: 'Win 2 Arena battles', target: 2, xp: 250, action: 'win' },
  { id: 'q-upgrade', title: 'Upgrade a card', target: 1, xp: 150, action: 'upgrade' },
  { id: 'q-tournament', title: 'Enter a tournament', target: 1, xp: 200, action: 'tournament' },
  { id: 'q-share', title: 'Share your card', target: 1, xp: 100, action: 'share' },
]

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-scan', title: 'First Scan', description: 'Generated your first CT card.', tier: 'common' },
  { id: 'first-battle', title: 'First Battle', description: 'Entered the Arena.', tier: 'common' },
  { id: 'first-win', title: 'First Win', description: 'Claimed your first victory.', tier: 'rare' },
  { id: 'forge-master', title: 'Forge Master', description: 'Forged a card in The Forge.', tier: 'epic' },
  { id: 'tournament-winner', title: 'Tournament Winner', description: 'Won a CULT tournament.', tier: 'epic' },
  { id: 'top-100', title: 'Top 100', description: 'Entered the CULT 100.', tier: 'legendary' },
  { id: 'ct-champion', title: 'CT Champion', description: 'Won the seasonal championship.', tier: 'mythic' },
  { id: 'cult-legend', title: 'Cult Legend', description: 'Reached level 100.', tier: 'mythic' },
]

export interface GuildDefinition {
  id: string
  name: string
  tag: string
  motto: string
  archetype: Archetype
}

export const GUILD_DEFINITIONS: GuildDefinition[] = [
  { id: 'alpha-order', name: 'The Alpha Order', tag: 'ALPH', motto: 'First to know. First to move.', archetype: 'alpha' },
  { id: 'trader-cult', name: 'The Trader Cult', tag: 'TRDR', motto: 'Charts are scripture.', archetype: 'trader' },
  { id: 'builders', name: 'The Builders', tag: 'BLDR', motto: 'We ship while they sleep.', archetype: 'builder' },
  { id: 'meme-army', name: 'The Meme Army', tag: 'MEME', motto: 'Culture is the alpha.', archetype: 'meme' },
]

export interface TournamentTemplate {
  slug: string
  name: string
  tagline: string
  entry: number
  maxPlayers: number
  minRarity: Rarity
}

/** Every template runs once per UTC week (Monday 00:00 → next Monday). */
export const TOURNAMENT_TEMPLATES: TournamentTemplate[] = [
  { slug: 'weekly-clash', name: 'Weekly CT Clash', tagline: 'Every week. Every timeline.', entry: 150, maxPlayers: 512, minRarity: 'common' },
  { slug: 'alpha-masters', name: 'Alpha Masters', tagline: 'Only the sharpest calls survive.', entry: 1200, maxPlayers: 256, minRarity: 'epic' },
  { slug: 'meme-lords', name: 'Meme Lords', tagline: 'Engagement is the weapon.', entry: 100, maxPlayers: 512, minRarity: 'common' },
  { slug: 'genesis-cup', name: 'Genesis Cup', tagline: 'The first blood of the season.', entry: 500, maxPlayers: 1024, minRarity: 'rare' },
]

export const BRACKET_ROUNDS = [1024, 512, 256, 128, 64, 32, 16, 8, 4, 2]

/** Share of the entry pool paid out; the rest stays in the treasury. */
export const TOURNAMENT_PAYOUT_RATIO = 0.9
export const TOURNAMENT_SPLITS = [0.6, 0.3, 0.1]

const WEEK_MS = 7 * 24 * 3_600_000

export function weekStart(at = Date.now()) {
  const d = new Date(at)
  const day = (d.getUTCDay() + 6) % 7
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day)
}

export function tournamentId(slug: string, start: number) {
  return `${slug}-${new Date(start).toISOString().slice(0, 10)}`
}

export function parseTournamentId(id: string) {
  const m = /^(.+)-(\d{4}-\d{2}-\d{2})$/.exec(id)
  if (!m) return null
  const template = TOURNAMENT_TEMPLATES.find((t) => t.slug === m[1])
  const start = Date.parse(`${m[2]}T00:00:00Z`)
  if (!template || Number.isNaN(start) || start !== weekStart(start)) return null
  return { template, start, end: start + WEEK_MS }
}

export { WEEK_MS }
