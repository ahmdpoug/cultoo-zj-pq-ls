'use client'

import { Check, Eye, Repeat, Share2, Swords, Trophy, Hammer, ScanLine } from 'lucide-react'
import type { QuestAction } from '@/lib/types'
import { QUESTS } from '@/lib/game/config'
import { useGame, useMounted } from '@/hooks/use-game'
import { claimQuest } from '@/lib/services'
import { Eyebrow } from '@/components/ui-kit/primitives'
import { cn } from '@/lib/utils'

const ICONS: Record<QuestAction, typeof Eye> = {
  scan: ScanLine,
  win: Swords,
  upgrade: Hammer,
  tournament: Trophy,
  share: Share2,
  battle: Repeat,
}

export function DailyQuests({ embedded = false }: { embedded?: boolean }) {
  const mounted = useMounted()
  const { state, hasPlayer } = useGame()
  const completed = QUESTS.filter((q) => (state.quests[q.id] ?? 0) >= q.target).length

  return (
    <section className={cn(!embedded && 'py-8')} aria-labelledby="quests-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {!embedded && <Eyebrow>Resets in 24h</Eyebrow>}
          <h2 id="quests-title" className={cn('font-display font-bold uppercase tracking-tight', embedded ? 'text-xl' : 'mt-4 text-3xl metal-text sm:text-4xl')}>
            Daily Cult Quests
          </h2>
        </div>
        <p className="font-display text-sm font-semibold tracking-[0.15em] text-muted-foreground">
          <span className="text-foreground tabular-nums">{mounted ? completed : 0}</span> / {QUESTS.length} COMPLETED
        </p>
      </div>

      <ul className={cn('mt-6 grid gap-3', !embedded && 'sm:grid-cols-2 lg:grid-cols-5')}>
        {QUESTS.map((q) => {
          const Icon = ICONS[q.action]
          const progress = mounted ? (state.quests[q.id] ?? 0) : 0
          const done = progress >= q.target
          const claimed = mounted && state.claimedQuests.includes(q.id)
          return (
            <li key={q.id} className={cn('glass flex flex-col rounded-2xl p-4 transition-colors', done && !claimed && 'border-primary/40', claimed && 'opacity-60')}>
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-lg bg-white/5 text-primary">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="font-display text-sm font-bold text-primary">+{q.xp} XP</span>
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-wide">{q.title}</p>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-primary transition-[width] duration-700" style={{ width: `${(progress / q.target) * 100}%` }} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span className="tabular-nums">
                  {progress} / {q.target}
                </span>
                {claimed ? (
                  <span className="flex items-center gap-1 text-success">
                    <Check className="size-3.5" aria-hidden /> Claimed
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={!done || !hasPlayer}
                    onClick={() => void claimQuest(q.id).catch(() => {})}
                    className="rounded-md px-2 py-1 font-semibold uppercase tracking-wider text-foreground transition-colors enabled:bg-primary enabled:hover:brightness-110 disabled:text-muted-foreground"
                  >
                    {done ? 'Claim' : 'In progress'}
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
