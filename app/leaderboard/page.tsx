import type { Metadata } from 'next'
import { PageHeader } from '@/components/ui-kit/primitives'
import { Leaderboard } from '@/components/leaderboard/leaderboard'

export const metadata: Metadata = { title: 'CULT 100 Leaderboard' }

export default function LeaderboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Sector 01 · CT City"
        title="CULT 100"
        subtitle="Ranked by Cult Power, CT Score, tournament wins, season XP and win rate. The top 100 qualify for the CT Championship."
      />
      <Leaderboard />
    </>
  )
}
