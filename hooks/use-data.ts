'use client'

import useSWR from 'swr'
import type { CultCard, GuildView, LeaderboardEntry, Listing, SeasonInfo, Tournament } from '@/lib/types'
import { apiFetch } from '@/lib/services/api'

export interface LeaderboardData {
  entries: LeaderboardEntry[]
  season: SeasonInfo
  myRank: number | null
}

export function useLeaderboard() {
  return useSWR<LeaderboardData>('/api/game/leaderboard', (url: string) => apiFetch<LeaderboardData>(url))
}

export function useListings() {
  return useSWR<Listing[]>('/api/game/market', (url: string) => apiFetch<Listing[]>(url))
}

export function useGuilds() {
  return useSWR<GuildView[]>('/api/game/guilds', (url: string) => apiFetch<GuildView[]>(url))
}

export function useTournaments() {
  return useSWR<Tournament[]>('/api/game/tournaments', (url: string) => apiFetch<Tournament[]>(url))
}

export function usePool() {
  return useSWR<CultCard[]>('/api/game/pool', (url: string) => apiFetch<CultCard[]>(url))
}
