'use client'

import { useSyncExternalStore } from 'react'
import useSWR from 'swr'
import type { GameState } from '@/lib/types'
import { useCultAuth } from '@/lib/auth/cult-auth'
import { apiFetch, STATE_KEY } from '@/lib/services/api'
import { resetPlayer, setMainCard } from '@/lib/services'
import { cultPower } from '@/lib/game/scoring'

export const EMPTY_STATE: GameState = {
  version: 2,
  mainCardId: null,
  cards: [],
  wallet: { address: null },
  economy: { balance: 0, pendingCult: 0, fragments: 0, materials: 0, seasonXp: 0 },
  battles: [],
  achievements: [],
  quests: {},
  claimedQuests: [],
  tournaments: [],
  guildId: null,
  listings: [],
  rewardedBattlesToday: 0,
  activity: [],
}

/** Server-authoritative game state for the signed-in player. */
export function useGame() {
  const auth = useCultAuth()
  const { data, isLoading, mutate } = useSWR<GameState>(auth.authenticated ? STATE_KEY : null, (url: string) => apiFetch<GameState>(url), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  })

  const state = data ?? EMPTY_STATE
  const mainCard = state.cards.find((c) => c.id === state.mainCardId) ?? null

  return {
    state,
    mainCard,
    hasPlayer: Boolean(mainCard),
    totalPower: mainCard ? cultPower(mainCard) : 0,
    isLoading: auth.authenticated && isLoading,
    reset: resetPlayer,
    setMainCard,
    mutate,
  }
}

const noop = () => () => {}
/** True after hydration; use to gate client-only values like countdowns. */
export function useMounted() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )
}
