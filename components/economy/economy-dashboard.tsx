'use client'

import { Boxes, Brush, CalendarDays, Coins, Hammer, Puzzle, Shield, Sparkles, Ticket, TrendingUp, Zap } from 'lucide-react'
import { useGame } from '@/hooks/use-game'
import { num, timeAgo } from '@/lib/game/format'
import { CultMark } from '@/components/layout/cult-logo'
import { Panel } from '@/components/ui-kit/primitives'
import { DailyQuests } from './daily-quests'

const USES = [
  { icon: TrendingUp, label: 'Card upgrades' },
  { icon: Hammer, label: 'Forge' },
  { icon: Ticket, label: 'Tournament entry' },
  { icon: Brush, label: 'Cosmetics' },
  { icon: CalendarDays, label: 'Special events' },
  { icon: Shield, label: 'Guild creation' },
  { icon: Boxes, label: 'Game items' },
]

export function EconomyDashboard() {
  const { state, mainCard, totalPower } = useGame()
  const e = state.economy
  const txTypes = new Set(['buy', 'forge', 'mint', 'tournament', 'battle', 'quest'])
  const ledger = state.activity.filter((a) => txTypes.has(a.type)).slice(0, 10)

  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Panel className="relative overflow-hidden p-6 sm:p-8">
          <div aria-hidden className="absolute -right-16 -top-16 size-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">$CULT Balance</p>
          </div>
          <p className="relative mt-3 flex items-center gap-3 font-display text-5xl font-bold tabular-nums metal-text sm:text-6xl">
            <CultMark className="size-10" />
            {num(e.balance)}
          </p>
          <p className="relative mt-3 max-w-md text-sm text-muted-foreground">
            $CULT is the utility currency of the CULT world. It is earned and spent in-game and has no monetary value.
          </p>
        </Panel>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Zap, label: 'Cult Power', value: num(totalPower) },
            { icon: Sparkles, label: 'Card XP', value: mainCard ? num(mainCard.xp) : '—' },
            { icon: Puzzle, label: 'Card Fragments', value: num(e.fragments) },
            { icon: Coins, label: 'Forge Materials', value: num(e.materials) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="glass rounded-2xl p-4">
              <Icon className="size-4 text-primary" aria-hidden />
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
              <p className="mt-1 font-display text-2xl font-bold tabular-nums">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <Panel className="p-6">
          <h2 className="font-display text-lg font-bold uppercase tracking-wide">Uses of $CULT</h2>
          <ul className="mt-4 grid grid-cols-2 gap-2">
            {USES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-sm">
                <Icon className="size-4 text-primary" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel className="p-6">
          <h2 className="font-display text-lg font-bold uppercase tracking-wide">Ledger</h2>
          {ledger.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No transactions yet. Battle, forge or trade to fill your ledger.</p>
          ) : (
            <ul className="mt-3">
              {ledger.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 border-b border-white/[0.05] py-2.5 text-sm">
                  <span className="truncate">{a.label}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(a.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel className="p-6">
        <DailyQuests embedded />
      </Panel>
    </div>
  )
}
