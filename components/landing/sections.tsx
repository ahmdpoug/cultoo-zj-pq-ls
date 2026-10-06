'use client'

import { AtSign, Gem, Hammer, ScanLine, Swords, Trophy, ArrowRight } from 'lucide-react'
import { CultCardView } from '@/components/cards/cult-card'
import { CultLink } from '@/components/ui-kit/cult-button'
import { Eyebrow } from '@/components/ui-kit/primitives'
import { RARITIES, RARITY_META } from '@/lib/game/rarity'
import { useLeaderboard, usePool } from '@/hooks/use-data'
import { compact } from '@/lib/game/format'

const MANIFESTO = [
  ['Your profile', 'is your character.'],
  ['Your reputation', 'is your stats.'],
  ['Your card', 'is your identity.'],
  ['$CULT', 'powers the world.'],
] as const

export function Manifesto() {
  return (
    <section aria-label="Manifesto" className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4">
      {MANIFESTO.map(([a, b], i) => (
        <div key={a} className="bg-background/90 p-6 transition-colors hover:bg-card">
          <p className="text-xs font-semibold tabular-nums tracking-[0.3em] text-primary">0{i + 1}</p>
          <p className="mt-4 font-display text-xl font-bold uppercase text-foreground">{a}</p>
          <p className="text-muted-foreground">{b}</p>
        </div>
      ))}
    </section>
  )
}

const STEPS = [
  { icon: AtSign, title: 'Connect your X', body: 'Your CT footprint — followers, age, activity, alpha — becomes raw stats.' },
  { icon: ScanLine, title: 'Generate your card', body: 'A unique card is struck with a rarity earned by reputation, not luck.' },
  { icon: Swords, title: 'Battle & level up', body: 'Stat duels in the Arena earn XP. Cards evolve visually as they rank up.' },
  { icon: Hammer, title: 'Forge & collect', body: 'Combine cards into higher rarities and mint them as collectible NFTs.' },
  { icon: Trophy, title: 'Compete for the crown', body: 'Climb the CULT 100 and qualify for the seasonal CT Championship.' },
]

export function HowItWorks() {
  return (
    <section className="defer-render py-20 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <Eyebrow className="justify-center">The Loop</Eyebrow>
        <h2 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight text-balance metal-text sm:text-5xl">
          Your reputation. Your card. Your cult.
        </h2>
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
          Connect your X identity, generate your CT card, level it up, battle other players, collect NFTs, and compete for seasonal championships.
        </p>
      </div>
      <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STEPS.map(({ icon: Icon, title, body }, i) => (
          <li key={title} className="glass group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30">
            <div className="flex items-center justify-between">
              <span className="flex size-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="font-display text-sm font-bold text-muted-foreground tabular-nums">0{i + 1}</span>
            </div>
            <h3 className="mt-5 font-display text-lg font-bold uppercase">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function RarityShowcase() {
  const { data: pool } = usePool()
  const samples = RARITIES.map((r) => pool?.find((c) => c.rarity === r)).filter((c): c is NonNullable<typeof c> => Boolean(c))
  return (
    <section className="defer-render py-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Eyebrow>Rarity System</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight metal-text sm:text-4xl">Five tiers. One ascent.</h2>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Rarity is earned from your CT Score and upgraded in The Forge. Every tier carries its own frame, surface and energy.
        </p>
      </div>
      {samples.length === 0 ? (
        <div className="-mx-4 mt-10 flex gap-5 overflow-hidden px-4 lg:mx-0 lg:grid lg:grid-cols-5 lg:px-0">
          {RARITIES.map((r) => (
            <div key={r} className="aspect-[5/7] w-56 shrink-0 animate-pulse rounded-2xl border border-white/10 bg-card lg:w-auto" aria-hidden />
          ))}
        </div>
      ) : (
        <div className="-mx-4 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-6 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
          {samples.map((card) => (
            <div key={card.rarity} className="snap-center">
              <CultCardView card={card} size="md" className="lg:w-full" />
              <p data-rarity={card.rarity} className="mt-4 font-display text-sm font-bold uppercase tracking-[0.25em] rarity-text">
                {RARITY_META[card.rarity].label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{RARITY_META[card.rarity].description}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export function ChampionshipTeaser() {
  const { data } = useLeaderboard()
  const season = data?.season
  return (
    <section className="relative mt-20 overflow-hidden rounded-3xl border border-primary/20 bg-[radial-gradient(80%_120%_at_80%_50%,oklch(0.35_0.16_296/0.45),transparent_70%)] p-6 defer-render sm:p-12">
      <div aria-hidden className="absolute inset-0 grid-bg opacity-40" />
      <div className="relative max-w-xl">
        <Eyebrow>Flagship Event</Eyebrow>
        <h2 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight metal-text sm:text-5xl">CULT CT Championship</h2>
        <p className="mt-3 text-muted-foreground">
          {season?.label ?? 'Genesis — Season 01'}. {season ? compact(season.players) : '—'} players chasing {season?.qualifyTop ?? 100} final seats. Only one becomes CT Champion.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <CultLink href="/championships" icon={<Trophy className="size-4" />}>
            View Championship
          </CultLink>
          <CultLink href="/leaderboard" variant="outline" icon={<ArrowRight className="size-4" />}>
            CULT 100
          </CultLink>
          <CultLink href="/market" variant="ghost" icon={<Gem className="size-4" />}>
            Cult Market
          </CultLink>
        </div>
      </div>
    </section>
  )
}
