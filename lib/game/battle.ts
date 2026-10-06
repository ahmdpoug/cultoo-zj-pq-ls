import type { BattleRound, CardStats, CultCard } from '@/lib/types'
import { cultPower } from './scoring'

export const BATTLE_STATS: { key: keyof CardStats | 'cultPower'; label: string }[] = [
  { key: 'ctScore', label: 'CT Score' },
  { key: 'reputation', label: 'Reputation' },
  { key: 'influence', label: 'Influence' },
  { key: 'engagement', label: 'Engagement' },
  { key: 'alpha', label: 'Alpha' },
  { key: 'cultPower', label: 'Cult Power' },
]

export const BATTLE_REWARDS = {
  victory: { xp: 250 },
  defeat: { xp: 80 },
}

function statValue(card: CultCard, key: keyof CardStats | 'cultPower') {
  if (key === 'cultPower') return cultPower(card) / 100
  return card.stats[key]
}

/** Best-of-3 resolution. Each round draws a stat; variance keeps underdogs in the fight. */
export function resolveBattle(player: CultCard, opponent: CultCard) {
  const pool = [...BATTLE_STATS].sort(() => Math.random() - 0.5).slice(0, 3)
  const rounds: BattleRound[] = pool.map(({ key, label }) => {
    const p = statValue(player, key) * (0.85 + Math.random() * 0.3) + player.level * 0.08
    const o = statValue(opponent, key) * (0.85 + Math.random() * 0.3) + opponent.level * 0.08
    const winner = p >= o ? 'player' : 'opponent'
    return {
      stat: key,
      label,
      player: Math.round(p * 10),
      opponent: Math.round(o * 10),
      delta: Math.round(Math.abs(p - o) * 40 + 120),
      winner,
    }
  })
  const playerWins = rounds.filter((r) => r.winner === 'player').length
  return { rounds, result: playerWins >= 2 ? ('victory' as const) : ('defeat' as const) }
}
