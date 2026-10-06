export interface RankTier {
  level: number
  title: string
  tier: number
}

export const RANKS: readonly RankTier[] = [
  { level: 1, title: 'Initiate', tier: 0 },
  { level: 10, title: 'Cultist', tier: 1 },
  { level: 25, title: 'Disciple', tier: 2 },
  { level: 50, title: 'Priest', tier: 3 },
  { level: 75, title: 'High Priest', tier: 4 },
  { level: 100, title: 'Cult Legend', tier: 5 },
]

export const MAX_LEVEL = 100

export function xpForLevel(level: number) {
  return 2000 + level * 170
}

export function rankForLevel(level: number): RankTier {
  let current = RANKS[0]
  for (const r of RANKS) if (level >= r.level) current = r
  return current
}

export function nextRank(level: number): RankTier | null {
  return RANKS.find((r) => r.level > level) ?? null
}

/** Applies XP and returns the new level/xp with the number of levels gained. */
export function applyXp(level: number, xp: number, gained: number) {
  let lvl = level
  let pool = xp + gained
  let levelsGained = 0
  while (lvl < MAX_LEVEL && pool >= xpForLevel(lvl)) {
    pool -= xpForLevel(lvl)
    lvl++
    levelsGained++
  }
  if (lvl >= MAX_LEVEL) pool = 0
  return { level: lvl, xp: pool, levelsGained }
}
