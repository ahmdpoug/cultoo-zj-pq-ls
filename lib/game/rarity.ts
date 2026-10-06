import type { Rarity } from '@/lib/types'

/**
 * Rarity rules live here; rarity visuals live in globals.css under [data-rarity].
 * Swap the CSS tokens to re-theme every card, badge and listing at once.
 */
export const RARITIES: readonly Rarity[] = ['common', 'rare', 'epic', 'legendary', 'mythic']

export interface RarityMeta {
  label: string
  tier: number
  minScore: number
  forgeCost: number
  description: string
  effects: { holo: boolean; energy: boolean; sheen: boolean; cinematic: boolean }
}

export const RARITY_META: Record<Rarity, RarityMeta> = {
  common: {
    label: 'Common',
    tier: 0,
    minScore: 0,
    forgeCost: 0,
    description: 'Simple metallic frame.',
    effects: { holo: false, energy: false, sheen: false, cinematic: false },
  },
  rare: {
    label: 'Rare',
    tier: 1,
    minScore: 74,
    forgeCost: 500,
    description: 'Enhanced frame with subtle holographic surface.',
    effects: { holo: true, energy: false, sheen: false, cinematic: false },
  },
  epic: {
    label: 'Epic',
    tier: 2,
    minScore: 83,
    forgeCost: 1500,
    description: 'Animated energy coursing around the frame.',
    effects: { holo: true, energy: true, sheen: false, cinematic: false },
  },
  legendary: {
    label: 'Legendary',
    tier: 3,
    minScore: 90,
    forgeCost: 5000,
    description: 'Premium animated holographic frame.',
    effects: { holo: true, energy: true, sheen: true, cinematic: false },
  },
  mythic: {
    label: 'Mythic',
    tier: 4,
    minScore: 96,
    forgeCost: 15000,
    description: 'Extremely rare cinematic treatment.',
    effects: { holo: true, energy: true, sheen: true, cinematic: true },
  },
}

export function rarityFromScore(score: number): Rarity {
  for (let i = RARITIES.length - 1; i >= 0; i--) {
    if (score >= RARITY_META[RARITIES[i]].minScore) return RARITIES[i]
  }
  return 'common'
}

export function nextRarity(r: Rarity): Rarity | null {
  const i = RARITIES.indexOf(r)
  return i < RARITIES.length - 1 ? RARITIES[i + 1] : null
}

export function compareRarity(a: Rarity, b: Rarity) {
  return RARITY_META[a].tier - RARITY_META[b].tier
}
