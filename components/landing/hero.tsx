'use client'

import { useEffect, useMemo, useState } from 'react'
import { ScanLine, Swords } from 'lucide-react'
import type { CultCard, Rarity } from '@/lib/types'
import { CultLink } from '@/components/ui-kit/cult-button'
import { Particles } from '@/components/ui-kit/particles'
import { CultCardView } from '@/components/cards/cult-card'
import { useLeaderboard, usePool } from '@/hooks/use-data'
import { RARITIES, RARITY_META } from '@/lib/game/rarity'
import { compact } from '@/lib/game/format'
import { cn } from '@/lib/utils'

export function Hero() {
  const { data: pool } = usePool()
  const { data: board } = useLeaderboard()
  const season = board?.season

  const byRarity = useMemo(() => {
    const map = new Map<Rarity, CultCard>()
    for (const rarity of RARITIES) {
      const card = pool?.find((c) => c.rarity === rarity)
      if (card) map.set(rarity, card)
    }
    return map
  }, [pool])

  const available = useMemo(() => RARITIES.filter((r) => byRarity.has(r)), [byRarity])
  const [selected, setSelected] = useState<Rarity | null>(null)
  const [autoPlay, setAutoPlay] = useState(true)

  // Opens on the rarest card in the pool, then descends a tier every few seconds.
  const activeRarity = selected ?? available[available.length - 1] ?? null
  const active = activeRarity ? (byRarity.get(activeRarity) ?? null) : null

  useEffect(() => {
    if (!autoPlay || available.length < 2) return
    const id = setInterval(() => {
      setSelected((current) => {
        const base = current ?? available[available.length - 1]
        const i = available.indexOf(base)
        return available[(i - 1 + available.length) % available.length]
      })
    }, 5000)
    return () => clearInterval(id)
  }, [autoPlay, available])

  return (
    <section className="relative -mt-8 grid items-center gap-12 overflow-hidden pb-16 pt-8 md:-mt-12 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pb-24">
      <div aria-hidden className="absolute inset-0 -z-10 grid-bg opacity-60" />
      <div aria-hidden className="absolute -top-24 left-1/2 -z-10 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-primary/[0.07] blur-3xl" />

      <div className="relative z-10 text-center lg:text-left">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground">
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative size-2 rounded-full bg-primary" />
          </span>
          {season?.label ?? 'Genesis — Season 01'} · Live
        </p>

        <h1 className="mt-6 font-display font-bold leading-[0.85] tracking-tight">
          <span className="block text-[clamp(3.5rem,18vw,9.5rem)] metal-text">$CULT</span>
          <span className="mt-3 block text-[clamp(1.05rem,4.4vw,1.9rem)] tracking-[0.3em] text-foreground">CT IS THE GAME.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
          Turn your Crypto Twitter identity into a collectible card. Battle the community, forge legends, and ascend through the CULT.
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

      <div className="relative">
        <div className="relative flex min-h-[24rem] items-center justify-center sm:min-h-[30rem]">
          <div aria-hidden className="absolute size-[18rem] rounded-full bg-primary/20 blur-3xl sm:size-[26rem] md:blur-[100px]" />
          <div aria-hidden className="absolute size-[22rem] rounded-full border border-white/[0.05] sm:size-[30rem]" />
          <div aria-hidden className="absolute size-[16rem] rounded-full border border-primary/15 sm:size-[22rem]" />
          <Particles count={18} seed="hero" />
          {active ? (
            <div key={active.id} className="animate-float">
              <div className="animate-slide-up">
                <CultCardView card={active} size="xl" />
              </div>
            </div>
          ) : (
            <div className="aspect-[5/7] w-72 animate-pulse rounded-2xl border border-white/10 bg-card sm:w-80" aria-hidden />
          )}
          <div aria-hidden className="absolute bottom-6 h-6 w-56 rounded-full bg-black/80 blur-xl" />
        </div>

        {available.length > 0 && (
          <div className="mt-2 flex flex-col items-center gap-3">
            <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Featured rarity">
              {available.map((r) => (
                <button
                  key={r}
                  type="button"
                  data-rarity={r}
                  aria-pressed={activeRarity === r}
                  onClick={() => {
                    setSelected(r)
                    setAutoPlay(false)
                  }}
                  className={cn(
                    'rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300',
                    activeRarity === r
                      ? 'rarity-border rarity-bg rarity-text'
                      : 'border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground',
                  )}
                >
                  {RARITY_META[r].label}
                </button>
              ))}
            </div>
            {active && (
              <p className="text-xs text-muted-foreground">
                <span className="font-display font-bold text-foreground">@{active.handle}</span> · CT Score {active.stats.ctScore}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
