import type { CultCard } from '@/lib/types'
import { RANKS, nextRank, rankForLevel, xpForLevel } from '@/lib/game/progression'
import { num } from '@/lib/game/format'
import { cn } from '@/lib/utils'

export function LevelProgress({ card, showTrack = true }: { card: CultCard; showTrack?: boolean }) {
  const needed = xpForLevel(card.level)
  const pct = card.level >= 100 ? 100 : (card.xp / needed) * 100
  const rank = rankForLevel(card.level)
  const next = nextRank(card.level)

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Level</p>
          <p className="font-display text-5xl font-bold tabular-nums leading-none metal-text">{card.level}</p>
          <p className="mt-1 font-display text-sm font-semibold uppercase tracking-[0.2em] text-primary">{rank.title}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">XP</p>
          <p className="font-display text-lg font-bold tabular-nums">
            {num(card.xp)} <span className="text-muted-foreground">/ {num(needed)}</span>
          </p>
          {next && (
            <p className="text-xs text-muted-foreground">
              Next rank: <span className="font-semibold uppercase text-foreground">{next.title}</span> at LV {next.level}
            </p>
          )}
        </div>
      </div>
      <div
        className="relative mt-4 h-3 overflow-hidden rounded-full border border-white/[0.06] bg-black/40"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="XP to next level"
      >
        <div
          className="relative h-full rounded-full bg-gradient-to-r from-primary/70 via-primary to-silver transition-[width] duration-1000 ease-out"
          style={{ width: `${pct}%` }}
        >
          <span className="absolute inset-y-0 right-0 w-8 bg-white/40 blur-md" />
        </div>
      </div>

      {showTrack && (
        <ol className="mt-6 grid grid-cols-6 gap-1.5" aria-label="Rank evolution">
          {RANKS.map((r) => {
            const reached = card.level >= r.level
            const current = r.title === rank.title
            return (
              <li key={r.title} className="flex flex-col gap-1.5">
                <span className={cn('h-1 rounded-full', reached ? 'bg-primary' : 'bg-white/10', current && 'shadow-[0_0_10px_oklch(0.66_0.21_296)]')} />
                <span className={cn('text-[10px] font-semibold uppercase leading-tight tracking-wide', reached ? 'text-foreground' : 'text-muted-foreground/70')}>
                  {r.title}
                </span>
                <span className="text-[10px] tabular-nums text-muted-foreground">LV {r.level}</span>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

export function LevelUpBurst({ level }: { level: number }) {
  return (
    <div role="status" className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center animate-hold-fade">
      <div className="absolute size-80 rounded-full border-2 border-primary animate-burst" />
      <div className="flex flex-col items-center animate-in zoom-in-50 fade-in duration-500">
        <p className="font-display text-sm font-semibold tracking-[0.5em] text-primary">LEVEL UP</p>
        <p className="font-display text-8xl font-bold tabular-nums metal-text drop-shadow-[0_0_30px_oklch(0.66_0.21_296/0.8)]">{level}</p>
        <p className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-foreground">{rankForLevel(level).title}</p>
      </div>
    </div>
  )
}
