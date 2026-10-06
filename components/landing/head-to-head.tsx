'use client'

import { useMemo, useState } from 'react'
import { Shuffle, Swords } from 'lucide-react'
import type { CardStats } from '@/lib/types'
import { CardAvatar } from '@/components/cards/card-avatar'
import { CultLink } from '@/components/ui-kit/cult-button'
import { Eyebrow, RarityBadge } from '@/components/ui-kit/primitives'
import { Reveal } from '@/components/ui-kit/reveal'
import { usePool } from '@/hooks/use-data'
import { cultPower } from '@/lib/game/scoring'
import { num } from '@/lib/game/format'
import { cn } from '@/lib/utils'

const ROWS: { key: keyof CardStats; label: string }[] = [
  { key: 'ctScore', label: 'CT Score' },
  { key: 'influence', label: 'Influence' },
  { key: 'engagement', label: 'Engagement' },
  { key: 'alpha', label: 'Alpha' },
  { key: 'consistency', label: 'Consistency' },
]

export function HeadToHead() {
  const { data: pool } = usePool()
  const cards = useMemo(() => (pool ?? []).slice(0, 12), [pool])
  const [leftId, setLeftId] = useState<string | null>(null)
  const [rightId, setRightId] = useState<string | null>(null)

  const left = cards.find((c) => c.id === leftId) ?? cards[0] ?? null
  const right = cards.find((c) => c.id === rightId) ?? cards.find((c) => c.id !== left?.id) ?? null

  function shuffleRival() {
    const others = cards.filter((c) => c.id !== left?.id)
    if (others.length === 0) return
    setRightId(others[Math.floor(Math.random() * others.length)].id)
  }

  const wins = left && right ? ROWS.filter((r) => left.stats[r.key] > right.stats[r.key]).length : 0
  const losses = left && right ? ROWS.filter((r) => left.stats[r.key] < right.stats[r.key]).length : 0
  const powerDelta = left && right ? cultPower(left) - cultPower(right) : 0

  return (
    <section className="py-16 md:py-24">
      <Reveal>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow>Head to Head</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight metal-text sm:text-4xl">
              Compare any two cards
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Pick a card, shuffle a rival, and read the stat duel. Real battles run in the Arena.
          </p>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="glass min-w-0 self-start rounded-2xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Your card</p>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
              {cards.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setLeftId(c.id)}
                  aria-pressed={left?.id === c.id}
                  className={cn(
                    'flex w-24 shrink-0 flex-col items-center gap-2 rounded-xl border p-2 transition-all duration-300',
                    left?.id === c.id ? 'border-primary/50 bg-primary/10' : 'border-white/[0.07] hover:border-white/20',
                  )}
                >
                  <CardAvatar handle={c.handle} src={c.avatarUrl} className="size-10" />
                  <span className="w-full truncate text-center text-[11px] font-semibold">@{c.handle}</span>
                </button>
              ))}
              {cards.length === 0 && <p className="py-6 text-sm text-muted-foreground">Loading cards…</p>}
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Rival</p>
                <p className="mt-1 truncate font-display font-bold">{right ? `@${right.handle}` : '—'}</p>
              </div>
              <button
                type="button"
                onClick={shuffleRival}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-white/25 hover:text-foreground"
              >
                <Shuffle className="size-3.5" aria-hidden /> Shuffle
              </button>
            </div>
          </div>

          <div className="glass min-w-0 rounded-2xl p-5 sm:p-6">
            {left && right ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <CardAvatar handle={left.handle} src={left.avatarUrl} className="size-11 shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate font-display font-bold">@{left.handle}</p>
                      <RarityBadge rarity={left.rarity} />
                    </div>
                  </div>
                  <Swords className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                  <div className="flex min-w-0 items-center gap-3 text-right">
                    <div className="min-w-0">
                      <p className="truncate font-display font-bold">@{right.handle}</p>
                      <RarityBadge rarity={right.rarity} />
                    </div>
                    <CardAvatar handle={right.handle} src={right.avatarUrl} className="size-11 shrink-0" />
                  </div>
                </div>

                <ul className="mt-6 space-y-4">
                  {ROWS.map((row) => {
                    const l = left.stats[row.key]
                    const r = right.stats[row.key]
                    const max = Math.max(l, r, 1)
                    return (
                      <li key={row.key}>
                        <div className="flex items-center justify-between text-xs">
                          <span className={cn('font-display font-bold tabular-nums', l > r && 'text-primary')}>{l}</span>
                          <span className="uppercase tracking-[0.2em] text-muted-foreground">{row.label}</span>
                          <span className={cn('font-display font-bold tabular-nums', r > l && 'text-primary')}>{r}</span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex h-1.5 flex-1 justify-end overflow-hidden rounded-full bg-white/[0.06]">
                            <span
                              className={cn('h-full rounded-full transition-all duration-700', l > r ? 'bg-primary' : 'bg-white/25')}
                              style={{ width: `${(l / max) * 100}%` }}
                            />
                          </div>
                          <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                            <span
                              className={cn('h-full rounded-full transition-all duration-700', r > l ? 'bg-primary' : 'bg-white/25')}
                              style={{ width: `${(r / max) * 100}%` }}
                            />
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-black/40 p-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Stat edge</p>
                    <p className="mt-1 font-display text-xl font-bold tabular-nums">
                      {wins === losses ? 'Dead even' : wins > losses ? `You lead ${wins}–${losses}` : `Rival leads ${losses}–${wins}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Cult power</p>
                    <p
                      className={cn(
                        'mt-1 font-display text-xl font-bold tabular-nums',
                        powerDelta > 0 ? 'text-success' : powerDelta < 0 ? 'text-destructive' : '',
                      )}
                    >
                      {powerDelta > 0 ? '+' : ''}
                      {num(powerDelta)}
                    </p>
                  </div>
                  <CultLink href="/arena" size="sm" icon={<Swords className="size-3.5" />}>
                    Fight for real
                  </CultLink>
                </div>
              </>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">Loading cards…</p>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
