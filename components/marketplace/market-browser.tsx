'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, SearchX } from 'lucide-react'
import type { Listing, Rarity } from '@/lib/types'
import { useListings } from '@/hooks/use-data'
import { RARITIES, RARITY_META, compareRarity } from '@/lib/game/rarity'
import { winRate } from '@/lib/game/scoring'
import { cardNo, num } from '@/lib/game/format'
import { CultCardView } from '@/components/cards/cult-card'
import { EmptyState, RarityBadge, Skeleton } from '@/components/ui-kit/primitives'
import { cn } from '@/lib/utils'

const SORTS = {
  newest: { label: 'Newest', fn: (a: Listing, b: Listing) => b.listedAt - a.listedAt },
  price: { label: 'Price', fn: (a: Listing, b: Listing) => a.price - b.price },
  rarity: { label: 'Rarity', fn: (a: Listing, b: Listing) => compareRarity(b.card.rarity, a.card.rarity) },
  level: { label: 'Level', fn: (a: Listing, b: Listing) => b.card.level - a.card.level },
  wins: { label: 'Wins', fn: (a: Listing, b: Listing) => b.card.wins - a.card.wins },
} as const

type SortKey = keyof typeof SORTS

export function MarketBrowser() {
  const [filter, setFilter] = useState<Rarity | 'all'>('all')
  const [sort, setSort] = useState<SortKey>('newest')
  const { data, isLoading } = useListings()

  const listings = useMemo(
    () => (data ?? []).filter((l) => filter === 'all' || l.card.rarity === filter).sort(SORTS[sort].fn),
    [data, filter, sort],
  )

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-4 flex flex-col gap-3 border-b border-white/[0.06] bg-background/80 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border md:flex-row md:items-center md:justify-between">
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1" role="tablist" aria-label="Filter by rarity">
          {(['all', ...RARITIES] as const).map((r) => (
            <button
              key={r}
              role="tab"
              aria-selected={filter === r}
              onClick={() => setFilter(r)}
              data-rarity={r === 'all' ? undefined : r}
              className={cn(
                'h-9 shrink-0 rounded-lg border px-3.5 text-xs font-semibold uppercase tracking-[0.15em] transition-colors',
                filter === r
                  ? r === 'all'
                    ? 'border-primary/50 bg-primary/15 text-foreground'
                    : 'rarity-border rarity-bg rarity-text'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {r === 'all' ? 'All' : RARITY_META[r].label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-9 rounded-lg border border-white/10 bg-card px-3 text-sm normal-case tracking-normal text-foreground outline-none focus:border-primary/60"
          >
            {Object.entries(SORTS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground tabular-nums">{listings.length}</span> listings
      </p>

      {isLoading && listings.length === 0 ? (
        <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <li key={i}>
              <Skeleton className="h-80" />
            </li>
          ))}
        </ul>
      ) : listings.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={<SearchX className="size-6" />} title="No listings" description="No cards of this rarity are listed right now. Check back after the next forge cycle." />
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {listings.map((l) => (
            <li key={l.id}>
              <Link
                href={`/market/${l.id}`}
                className="group glass flex h-full flex-col rounded-2xl p-3 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-4"
              >
                <div className="flex justify-center rounded-xl bg-black/30 py-4">
                  <CultCardView card={l.card} size="sm" tilt={false} className="w-[85%] max-w-44 transition-transform duration-500 group-hover:scale-[1.03]" />
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <RarityBadge rarity={l.card.rarity} />
                  <span className="text-xs tabular-nums text-muted-foreground">{cardNo(l.card.number)}</span>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-y-1 text-xs">
                  <dt className="text-muted-foreground">Level</dt>
                  <dd className="text-right font-semibold tabular-nums">{l.card.level}</dd>
                  <dt className="text-muted-foreground">Record</dt>
                  <dd className="text-right font-semibold tabular-nums">
                    {l.card.wins}W / {l.card.losses}L
                  </dd>
                  <dt className="text-muted-foreground">Win rate</dt>
                  <dd className="text-right font-semibold tabular-nums">{winRate(l.card)}%</dd>
                  <dt className="text-muted-foreground">Seller</dt>
                  <dd className="truncate text-right">@{l.seller}</dd>
                </dl>
                <div className="mt-auto flex items-center justify-between border-t border-white/[0.06] pt-3 mt-4">
                  <p className="font-display text-base font-bold tabular-nums sm:text-lg">
                    {num(l.price)} <span className="text-xs text-muted-foreground">$CULT</span>
                  </p>
                  <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                    <span className="hidden sm:inline">View Card</span>
                    <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
