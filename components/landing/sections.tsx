'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, AtSign, Check, Gem, Hammer, ScanLine, Swords, Trophy } from 'lucide-react'
import type { Rarity } from '@/lib/types'
import { CardAvatar } from '@/components/cards/card-avatar'
import { CultCardView } from '@/components/cards/cult-card'
import { CultLink } from '@/components/ui-kit/cult-button'
import { Eyebrow } from '@/components/ui-kit/primitives'
import { Reveal } from '@/components/ui-kit/reveal'
import { RARITIES, RARITY_META } from '@/lib/game/rarity'
import { useLeaderboard, usePool } from '@/hooks/use-data'
import { useMounted } from '@/hooks/use-game'
import { compact } from '@/lib/game/format'
import { cn } from '@/lib/utils'

const MANIFESTO = [
  ['Your profile', 'is your character.'],
  ['Your reputation', 'is your stats.'],
  ['Your card', 'is your identity.'],
  ['$CULT', 'powers the world.'],
] as const

export function Manifesto() {
  return (
    <Reveal>
      <section
        aria-label="Manifesto"
        className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4"
      >
        {MANIFESTO.map(([a, b], i) => (
          <div key={a} className="bg-background/90 p-6 transition-colors duration-300 hover:bg-card">
            <p className="text-xs font-semibold tabular-nums tracking-[0.3em] text-primary">0{i + 1}</p>
            <p className="mt-4 font-display text-xl font-bold uppercase text-foreground">{a}</p>
            <p className="text-muted-foreground">{b}</p>
          </div>
        ))}
      </section>
    </Reveal>
  )
}

const STEPS = [
  {
    icon: AtSign,
    title: 'Connect your X',
    short: 'Identity in',
    body: 'Your CT footprint — followers, account age, posting cadence and alpha — becomes the raw material for your card.',
    points: ['Live public metrics from X', 'No wallet needed to start', 'One card per identity'],
  },
  {
    icon: ScanLine,
    title: 'Generate your card',
    short: 'Card struck',
    body: 'A unique card is struck with a rarity earned by reputation, not luck. Every card carries its own frame, surface and energy.',
    points: ['Rarity derived from your CT Score', 'Five tiers, one ascent', 'Shareable in one tap'],
  },
  {
    icon: Swords,
    title: 'Battle & level up',
    short: 'Stat duels',
    body: 'Stat duels in the Arena earn XP. Cards evolve visually as they rank up, and every win feeds your season points.',
    points: ['Best-of-three stat duels', 'XP and $CULT rewards', 'Visual evolution per rank'],
  },
  {
    icon: Hammer,
    title: 'Forge & collect',
    short: 'Ascend',
    body: 'Combine cards into higher rarities and mint them as collectible NFTs that live on-chain.',
    points: ['Merge duplicates upward', 'Mint to own on-chain', 'Trade on the Cult Market'],
  },
  {
    icon: Trophy,
    title: 'Compete for the crown',
    short: 'The crown',
    body: 'Climb the CULT 100 and qualify for the seasonal CT Championship, where one card leaves as CT Champion.',
    points: ['Season-long leaderboard', 'Top 100 qualify', 'Prize pool paid in $CULT'],
  },
]

export function HowItWorks() {
  const [active, setActive] = useState(0)
  const step = STEPS[active]

  return (
    <section className="py-20 md:py-28">
      <Reveal>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow className="justify-center">The Loop</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight text-balance metal-text sm:text-5xl">
            Your reputation. Your card. Your cult.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Connect your X identity, generate your CT card, level it up, battle other players, collect NFTs, and compete for
            seasonal championships.
          </p>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <ol className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] lg:flex-col lg:overflow-visible lg:pb-0">
            {STEPS.map((s, i) => (
              <li key={s.title} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-current={i === active}
                  className={cn(
                    'flex w-64 items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 lg:w-full',
                    i === active
                      ? 'border-primary/40 bg-primary/[0.07]'
                      : 'border-white/[0.07] bg-card/60 hover:border-white/20',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300',
                      i === active ? 'border-primary/40 bg-primary/15 text-primary' : 'border-white/10 text-muted-foreground',
                    )}
                  >
                    <s.icon className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-sm font-bold uppercase tracking-wide">{s.title}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">{s.short}</span>
                  </span>
                  <span className="ml-auto font-display text-xs font-bold tabular-nums text-muted-foreground">0{i + 1}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="glass relative overflow-hidden rounded-2xl p-6 sm:p-8">
            <div aria-hidden className="absolute inset-0 grid-bg opacity-40" />
            <div key={active} className="relative animate-slide-up">
              <span className="flex size-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                <step.icon className="size-7" aria-hidden />
              </span>
              <h3 className="mt-6 font-display text-2xl font-bold uppercase">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{step.body}</p>
              <ul className="mt-6 space-y-2">
                {step.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

export function RarityShowcase() {
  const { data: pool } = usePool()
  const [rarity, setRarity] = useState<Rarity>('legendary')
  const card = pool?.find((c) => c.rarity === rarity) ?? null
  const meta = RARITY_META[rarity]
  const effects = [
    ['Holographic surface', meta.effects.holo],
    ['Animated energy frame', meta.effects.energy],
    ['Sheen sweep', meta.effects.sheen],
    ['Cinematic treatment', meta.effects.cinematic],
  ] as const

  return (
    <section className="py-16 md:py-24">
      <Reveal>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow>Rarity System</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight metal-text sm:text-4xl">
              Five tiers. One ascent.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Rarity is earned from your CT Score and upgraded in The Forge. Pick a tier to see how it renders.
          </p>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center">
          <div className="flex justify-center">
            {card ? (
              <div key={card.id} className="animate-slide-up">
                <CultCardView card={card} size="lg" />
              </div>
            ) : (
              <div className="aspect-[5/7] w-64 animate-pulse rounded-2xl border border-white/10 bg-card sm:w-72" aria-hidden />
            )}
          </div>

          <div>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Rarity tiers">
              {RARITIES.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="tab"
                  data-rarity={r}
                  aria-selected={rarity === r}
                  onClick={() => setRarity(r)}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300',
                    rarity === r
                      ? 'rarity-border rarity-bg rarity-text'
                      : 'border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground',
                  )}
                >
                  {RARITY_META[r].label}
                </button>
              ))}
            </div>

            <div key={rarity} className="mt-6 animate-slide-up">
              <p data-rarity={rarity} className="font-display text-2xl font-bold uppercase tracking-wide rarity-text">
                {meta.label}
              </p>
              <p className="mt-2 leading-relaxed text-muted-foreground">{meta.description}</p>

              <dl className="mt-6 grid grid-cols-2 gap-4">
                <div className="glass rounded-xl p-4">
                  <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Min CT Score</dt>
                  <dd className="mt-1 font-display text-2xl font-bold tabular-nums">{meta.minScore}</dd>
                </div>
                <div className="glass rounded-xl p-4">
                  <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Forge cost</dt>
                  <dd className="mt-1 font-display text-2xl font-bold tabular-nums">
                    {meta.forgeCost ? compact(meta.forgeCost) : '—'}
                  </dd>
                </div>
              </dl>

              <ul className="mt-6 space-y-2">
                {effects.map(([label, on]) => (
                  <li
                    key={label}
                    className={cn('flex items-center gap-2 text-sm', on ? 'text-foreground' : 'text-muted-foreground/50')}
                  >
                    <span
                      className={cn(
                        'flex size-4 items-center justify-center rounded-full border',
                        on ? 'border-primary/40 bg-primary/15 text-primary' : 'border-white/10',
                      )}
                    >
                      {on && <Check className="size-3" aria-hidden />}
                    </span>
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function useCountdown(target: number) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const diff = Math.max(0, target - now)
  return {
    days: Math.floor(diff / 86_400_000),
    hrs: Math.floor(diff / 3_600_000) % 24,
    min: Math.floor(diff / 60_000) % 60,
    sec: Math.floor(diff / 1000) % 60,
  }
}

export function ChampionshipTeaser() {
  const { data } = useLeaderboard()
  const season = data?.season
  const mounted = useMounted()
  const time = useCountdown(season?.endsAt ?? 0)
  const top = (data?.entries ?? []).slice(0, 3)

  return (
    <Reveal>
      <section className="relative mt-20 overflow-hidden rounded-3xl border border-primary/20 bg-[radial-gradient(80%_120%_at_80%_50%,oklch(0.35_0.16_296/0.45),transparent_70%)] p-6 sm:p-12">
        <div aria-hidden className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <Eyebrow>Flagship Event</Eyebrow>
            <h2 className="mt-4 font-display text-[clamp(1.75rem,6vw,3rem)] font-bold uppercase leading-none tracking-tight metal-text text-balance">
              CULT CT Championship
            </h2>
            <p className="mt-3 max-w-lg text-muted-foreground">
              {season?.label ?? 'Genesis — Season 01'}. The top {season?.qualifyTop ?? 100} of the CULT 100 qualify for the
              final. Only one becomes CT Champion.
            </p>

            <div className="mt-8 grid max-w-md grid-cols-4 gap-2" role="timer" aria-label="Time remaining">
              {(['days', 'hrs', 'min', 'sec'] as const).map((k) => (
                <div key={k} className="rounded-xl border border-white/10 bg-black/50 px-2 py-3 text-center">
                  <p className="font-display text-2xl font-bold tabular-nums sm:text-3xl">
                    {mounted ? String(time[k]).padStart(2, '0') : '--'}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{k}</p>
                </div>
              ))}
            </div>

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

          <ol className="space-y-2">
            {top.map((e, i) => (
              <li
                key={e.handle}
                className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/40 px-4 py-3"
              >
                <span className="font-display text-lg font-bold tabular-nums text-muted-foreground">{i + 1}</span>
                <CardAvatar handle={e.handle} src={e.avatarUrl} className="size-9 shrink-0" />
                <span className="min-w-0 flex-1 truncate font-semibold">@{e.handle}</span>
                <span className="font-display font-bold tabular-nums">{compact(e.seasonPoints)}</span>
              </li>
            ))}
            {top.length === 0 && (
              <li className="rounded-xl border border-white/[0.07] bg-black/40 px-4 py-6 text-center text-sm text-muted-foreground">
                Leaderboard loading…
              </li>
            )}
          </ol>
        </div>
      </section>
    </Reveal>
  )
}
