'use client'

import useSWR, { type SWRConfiguration } from 'swr'
import type { CultCard, GuildView, LeaderboardEntry, Listing, SeasonInfo, Tournament } from '@/lib/types'
import { apiFetch } from '@/lib/services/api'

export interface LeaderboardData {
  entries: LeaderboardEntry[]
  season: SeasonInfo
  myRank: number | null
}

/** Shared public data changes slowly; dedupe across components and avoid retry storms on failure. */
const PUBLIC_DATA: SWRConfiguration = {
  dedupingInterval: 30_000,
  revalidateOnFocus: false,
  keepPreviousData: true,
  errorRetryCount: 2,
  errorRetryInterval: 8_000,
}

const fetcher = <T,>(url: string) => apiFetch<T>(url)

export function useLeaderboard() {
  return useSWR<LeaderboardData>('/api/game/leaderboard', fetcher<LeaderboardData>, PUBLIC_DATA)
}

export function useListings() {
  return useSWR<Listing[]>('/api/game/market', fetcher<Listing[]>, PUBLIC_DATA)
}

export function useGuilds() {
  return useSWR<GuildView[]>('/api/game/guilds', fetcher<GuildView[]>, PUBLIC_DATA)
}

export function useTournaments() {
  return useSWR<Tournament[]>('/api/game/tournaments', fetcher<Tournament[]>, PUBLIC_DATA)
}

export function usePool() {
  return useSWR<CultCard[]>('/api/game/pool', fetcher<CultCard[]>, { ...PUBLIC_DATA, dedupingInterval: 120_000 })
}
