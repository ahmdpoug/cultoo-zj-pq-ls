'use client'

import { useMemo, useState } from 'react'
import { Crown } from 'lucide-react'
import type { Archetype } from '@/lib/types'
import { useLeaderboard } from '@/hooks/use-data'
import { useGame, useMounted } from '@/hooks/use-game'
import { cardNo, num } from '@/lib/game/format'
import { CardAvatar } from '@/components/cards/card-avatar'
import { EmptyState, RarityBadge, Skeleton } from '@/components/ui-kit/primitives'
import { cn } from '@/lib/utils'

const TABS: { id: string; label: string; match: Archetype[] | null }[] = [
  { id: 'global', label: 'Global', match: null },
  { id: 'traders', label: 'Traders', match: ['trader'] },
  { id: 'builders', label: 'Builders', match: ['builder'] },
  { id: 'memes', label: 'Memes', match: ['meme'] },
  { id: 'alpha', label: 'Alpha', match: ['alpha', 'researcher'] },
  { id: 'og', label: 'OG', match: ['og'] },
]

export function Leaderboard() {
  const [tab, setTab] = useState('global')
  const mounted = useMounted()
  const { mainCard, totalPower, state } = useGame()
  const { data, isLoading } = useLeaderboard()
  const match = TABS.find((t) => t.id === tab)!.match
  const rows = useMemo(() => (data?.entries ?? []).filter((e) => !match || match.includes(e.archetype)), [data, match])
  const podium = rows.slice(0, 3)
  const myRank = data?.myRank ?? null

  return (
    <div>
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1" role="tablist" aria-label="Leaderboard category">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'h-10 shrink-0 rounded-lg px-4 font-display text-xs font-bold uppercase tracking-[0.2em] transition-colors',
              tab === t.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading && rows.length === 0 ? (
        <div className="mt-8 space-y-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-64" />
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={<Crown className="size-6" />} title="No ranked cards yet" description="Scan an X profile to strike the first card and open the CULT 100." />
        </div>
      ) : (
        <>
          <ol className="mt-8 grid grid-cols-3 items-end gap-3 sm:gap-6" aria-label="Top three">
            {[podium[1], podium[0], podium[2]].filter(Boolean).map((e) => {
              const first = e.rank === podium[0].rank
              return (
                <li key={e.handle} data-rarity={e.rarity} className={cn('glass flex flex-col items-center rounded-2xl px-2 text-center sm:px-4', first ? 'rarity-border pb-6 pt-8' : 'pb-5 pt-6')}>
                  {first && <Crown className="mb-2 size-5 rarity-text" aria-hidden />}
                  <CardAvatar handle={e.handle} src={e.avatarUrl} className={first ? 'w-16 sm:w-20' : 'w-12 sm:w-16'} />
                  <p className="mt-3 w-full truncate text-sm font-semibold sm:text-base">@{e.handle}</p>
                  <p className="font-display text-lg font-bold tabular-nums sm:text-2xl">{num(e.cultPower)}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Cult Power</p>
                  <span className="mt-3 font-display text-3xl font-bold metal-text">{rows.indexOf(e) + 1}</span>
                </li>
              )
            })}
          </ol>

          {mounted && mainCard && myRank && (
            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3">
              <span className="font-display text-xl font-bold tabular-nums">#{num(myRank)}</span>
              <CardAvatar handle={mainCard.handle} src={mainCard.avatarUrl} className="w-9" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  @{mainCard.handle} <span className="text-xs text-primary">(You)</span>
                </p>
                <p className="text-xs text-muted-foreground">Global season rank</p>
              </div>
              <div className="text-right">
                <p className="font-display font-bold tabular-nums">{num(totalPower)}</p>
                <p className="text-xs text-muted-foreground">{num(state.economy.seasonXp)} season XP</p>
              </div>
            </div>
          )}

          <div className="glass mt-6 overflow-hidden rounded-2xl">
            <table className="w-full text-sm">
              <caption className="sr-only">CULT 100 rankings</caption>
              <thead className="border-b border-white/[0.06] text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Rank</th>
                  <th scope="col" className="px-2 py-3 font-semibold">Player</th>
                  <th scope="col" className="hidden px-2 py-3 font-semibold md:table-cell">Card</th>
                  <th scope="col" className="hidden px-2 py-3 font-semibold sm:table-cell">Rarity</th>
                  <th scope="col" className="px-2 py-3 text-right font-semibold">Cult Power</th>
                  <th scope="col" className="hidden px-2 py-3 text-right font-semibold lg:table-cell">Wins</th>
                  <th scope="col" className="hidden px-4 py-3 text-right font-semibold md:table-cell">Season Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {rows.map((e, i) => (
                  <tr key={e.handle} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <span className={cn('font-display text-base font-bold tabular-nums', i < 3 ? 'text-primary' : i < 10 ? 'text-foreground' : 'text-muted-foreground')}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-3">
                        <CardAvatar handle={e.handle} src={e.avatarUrl} className="w-8 shrink-0" />
                        <span className="truncate font-semibold">@{e.handle}</span>
                      </div>
                    </td>
                    <td className="hidden px-2 py-3 tabular-nums text-muted-foreground md:table-cell">{cardNo(e.cardNumber)}</td>
                    <td className="hidden px-2 py-3 sm:table-cell">
                      <RarityBadge rarity={e.rarity} />
                    </td>
                    <td className="px-2 py-3 text-right font-display font-bold tabular-nums">{num(e.cultPower)}</td>
                    <td className="hidden px-2 py-3 text-right tabular-nums lg:table-cell">{e.wins}</td>
                    <td className="hidden px-4 py-3 text-right tabular-nums text-muted-foreground md:table-cell">{num(e.seasonPoints)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
