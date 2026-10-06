'use client'

import { ScanLine, Swords } from 'lucide-react'
import { CultLink } from '@/components/ui-kit/cult-button'
import { Particles } from '@/components/ui-kit/particles'
import { CultCardView } from '@/components/cards/cult-card'
import { useLeaderboard, usePool } from '@/hooks/use-data'
import { compact } from '@/lib/game/format'

export function Hero() {
  const { data: pool } = usePool()
  const { data: board } = useLeaderboard()
  const heroCard = pool?.find((c) => c.rarity === 'legendary') ?? pool?.find((c) => c.rarity === 'epic') ?? pool?.[0] ?? null
  const season = board?.season

  return (
    <section className="relative -mt-8 grid items-center gap-12 overflow-hidden pb-16 pt-8 md:-mt-12 md:pt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-6 lg:pb-24">
      <div aria-hidden className="absolute inset-0 -z-10 grid-bg opacity-60" />

      <div className="relative z-10 text-center lg:text-left">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground">
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative size-2 rounded-full bg-primary" />
          </span>
          {season?.label ?? 'Genesis — Season 01'} · Live
        </p>

        <h1 className="mt-6 font-display font-bold leading-[0.85] tracking-tight">
          <span className="block text-[5.5rem] metal-text sm:text-[8rem] lg:text-[9.5rem]">$CULT</span>
          <span className="mt-3 block text-2xl tracking-[0.35em] text-foreground sm:text-3xl">CT IS THE GAME.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
          Turn your CT identity into a collectible card, compete with the community, and ascend through the CULT.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
          <CultLink href="/scan" size="lg" icon={<ScanLine className="size-4" />} className="w-full sm:w-auto">
            Scan Your CT
          </CultLink>
          <CultLink href="/arena" size="lg" variant="outline" icon={<Swords className="size-4" />} className="w-full sm:w-auto">
            Enter The Arena
          </CultLink>
        </div>

        <dl className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.06] lg:mx-0">
          {[
            ['Players', season ? compact(season.players) : '—'],
            ['Prize pool', season ? compact(season.prizePool) : '—'],
            ['Qualify', season ? `Top ${season.qualifyTop}` : '—'],
          ].map(([k, v]) => (
            <div key={k} className="bg-background/80 px-4 py-3">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{k}</dt>
              <dd className="mt-1 font-display text-xl font-bold tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="relative flex min-h-[26rem] items-center justify-center sm:min-h-[30rem]">
        <div aria-hidden className="absolute size-[18rem] rounded-full bg-primary/20 blur-3xl sm:size-[26rem] md:blur-[100px]" />
        <div aria-hidden className="absolute size-[22rem] rounded-full border border-white/[0.05] sm:size-[30rem]" />
        <div aria-hidden className="absolute size-[16rem] rounded-full border border-primary/15 sm:size-[22rem]" />
        <Particles count={20} seed="hero" />
        {heroCard ? (
          <div className="animate-float">
            <CultCardView card={heroCard} size="xl" />
          </div>
        ) : (
          <div className="aspect-[5/7] w-72 animate-pulse rounded-2xl border border-white/10 bg-card sm:w-80" aria-hidden />
        )}
        <div aria-hidden className="absolute bottom-6 h-6 w-56 rounded-full bg-black/80 blur-xl" />
      </div>
    </section>
  )
}
