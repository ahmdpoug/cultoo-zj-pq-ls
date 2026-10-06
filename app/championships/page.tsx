import type { Metadata } from 'next'
import { PageHeader } from '@/components/ui-kit/primitives'
import { ChampionshipHero } from '@/components/tournaments/championship-hero'
import { TournamentBoard } from '@/components/tournaments/tournament-board'

export const metadata: Metadata = { title: 'Championships' }

export default function ChampionshipsPage() {
  return (
    <>
      <PageHeader eyebrow="Sector 07 · Stadium" title="Championships" subtitle="Seasonal glory and weekly brackets. Enter, climb, qualify." />
      <ChampionshipHero />
      <div className="mt-16">
        <h2 className="mb-6 font-display text-3xl font-bold uppercase tracking-tight metal-text">Cult Arena Tournaments</h2>
        <TournamentBoard />
      </div>
    </>
  )
}
