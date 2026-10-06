'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Crosshair, RotateCcw, Shield, Swords, Trophy } from 'lucide-react'
import type { BattleRecord, CultCard } from '@/lib/types'
import { useGame } from '@/hooks/use-game'
import { usePool } from '@/hooks/use-data'
import { services } from '@/lib/services'
import { BATTLE_REWARDS, BATTLE_STATS } from '@/lib/game/battle'
import { cultPower } from '@/lib/game/scoring'
import { num, timeAgo } from '@/lib/game/format'
import { RARITY_META } from '@/lib/game/rarity'
import { CultCardView } from '@/components/cards/cult-card'
import { LevelUpBurst } from '@/components/cards/level-progress'
import { CultButton, CultLink } from '@/components/ui-kit/cult-button'
import { Panel, RarityBadge } from '@/components/ui-kit/primitives'
import { Particles } from '@/components/ui-kit/particles'
import { cn } from '@/lib/utils'

type Phase = 'select' | 'battle' | 'result'
type Outcome = BattleRecord & { levelsGained: number }

export function Arena({ mainCard }: { mainCard: CultCard }) {
  const { state } = useGame()
  const { data: pool } = usePool()
  const [playerId, setPlayerId] = useState(mainCard.id)
  const [opponent, setOpponent] = useState<CultCard | null>(null)
  const [phase, setPhase] = useState<Phase>('select')
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [revealed, setRevealed] = useState(0)

  const player = state.cards.find((c) => c.id === playerId) ?? mainCard
  const playerPower = cultPower(player)

  const opponents = useMemo(
    () =>
      [...(pool ?? [])]
        .sort((a, b) => Math.abs(cultPower(a) - playerPower) - Math.abs(cultPower(b) - playerPower))
        .slice(0, 8)
        .sort((a, b) => cultPower(a) - cultPower(b)),
    [pool, playerPower],
  )

  async function fight() {
    if (!opponent) return
    setPhase('battle')
    setRevealed(0)
    const result = await services.arena.battle(player.id, opponent)
    setOutcome(result)
    result.rounds.forEach((_, i) => setTimeout(() => setRevealed(i + 1), 1100 * (i + 1)))
    setTimeout(() => setPhase('result'), 1100 * result.rounds.length + 900)
  }

  function rematch() {
    setPhase('select')
    setOutcome(null)
  }

  if (phase !== 'select' && opponent && outcome) {
    const pScore = outcome.rounds.slice(0, revealed).filter((r) => r.winner === 'player').length
    const oScore = revealed - pScore
    const victory = outcome.result === 'victory'
    return (
      <div className="relative">
        <div className="relative grid items-center gap-6 overflow-hidden rounded-3xl border border-white/[0.06] bg-[radial-gradient(60%_80%_at_50%_50%,oklch(0.3_0.14_296/0.4),transparent_70%)] p-4 py-10 sm:p-10 md:grid-cols-[1fr_auto_1fr]">
          <div aria-hidden className="absolute inset-0 grid-bg opacity-50" />
          <Combatant label="Player 1" card={player} score={pScore} winner={phase === 'result' && victory} loser={phase === 'result' && !victory} />
          <div className="relative flex flex-col items-center gap-4">
            <span className="font-display text-5xl font-bold italic metal-text sm:text-6xl">VS</span>
            <ol className="w-full min-w-64 space-y-2">
              {outcome.rounds.map((r, i) => (
                <li
                  key={i}
                  className={cn(
                    'rounded-xl border px-4 py-3 transition-all duration-500',
                    i < revealed ? 'border-white/10 bg-black/50 opacity-100' : 'translate-y-2 border-transparent opacity-0',
                  )}
                >
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    <span>Round {i + 1}</span>
                    <span className={r.winner === 'player' ? 'text-success' : 'text-destructive'}>{r.winner === 'player' ? 'P1' : 'P2'}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-display font-bold uppercase">{r.label}</span>
                    <span className={cn('font-display text-lg font-bold tabular-nums', r.winner === 'player' ? 'text-success' : 'text-destructive')}>
                      {r.winner === 'player' ? '+' : '−'}
                      {r.delta}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <Combatant label="Player 2" card={opponent} score={oScore} winner={phase === 'result' && !victory} loser={phase === 'result' && victory} />
        </div>

        {phase === 'result' && (
          <div className="mt-8 flex flex-col items-center text-center animate-slide-up">
            <p
              className={cn(
                'font-display text-6xl font-bold tracking-[0.15em] sm:text-8xl',
                victory ? 'metal-text drop-shadow-[0_0_40px_oklch(0.66_0.21_296/0.6)]' : 'text-muted-foreground',
              )}
            >
              {victory ? 'VICTORY' : 'DEFEAT'}
            </p>
            <div className="mt-4 flex gap-3">
              <span className="rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 font-display text-sm font-bold">+{outcome.xp} XP</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-display text-sm font-bold">+{outcome.reward} $CULT</span>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <CultButton onClick={fight} icon={<RotateCcw className="size-4" />}>
                Rematch
              </CultButton>
              <CultButton variant="outline" onClick={rematch} icon={<Crosshair className="size-4" />}>
                New Opponent
              </CultButton>
              <CultLink href="/card" variant="ghost">
                My Card
              </CultLink>
            </div>
            {outcome.levelsGained > 0 && <LevelUpBurst level={player.level} />}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
        <Panel className="p-5 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Player 1 — Your card</p>
          <div className="mt-5 flex justify-center">
            <CultCardView card={player} size="lg" />
          </div>
          <div className="-mx-1 mt-5 flex gap-2 overflow-x-auto px-1 pb-1" role="listbox" aria-label="Choose your card">
            {state.cards.map((c) => (
              <button
                key={c.id}
                role="option"
                aria-selected={c.id === player.id}
                onClick={() => setPlayerId(c.id)}
                data-rarity={c.rarity}
                className={cn(
                  'shrink-0 rounded-lg border px-3 py-2 text-left text-xs transition-colors',
                  c.id === player.id ? 'rarity-border rarity-bg' : 'border-white/10 hover:border-white/20',
                )}
              >
                <span className="block font-semibold">@{c.handle}</span>
                <span className="rarity-text">{RARITY_META[c.rarity].label}</span> · LV {c.level}
              </button>
            ))}
          </div>
        </Panel>

        <div className="flex flex-col items-center justify-center gap-4 lg:pt-40">
          <span className="font-display text-4xl font-bold italic metal-text">VS</span>
          <CultButton size="lg" disabled={!opponent} onClick={fight} icon={<Swords className="size-4" />} className="w-full lg:w-auto">
            Battle
          </CultButton>
          <p className="max-w-48 text-center text-xs text-muted-foreground">
            Best of 3. Win +{BATTLE_REWARDS.victory.xp} XP · Loss +{BATTLE_REWARDS.defeat.xp} XP
          </p>
        </div>

        <Panel className="p-5 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Player 2 — Choose a challenger</p>
          <ul className="mt-5 space-y-2">
            {opponents.map((o) => {
              const diff = cultPower(o) - playerPower
              const odds = Math.max(8, Math.min(92, Math.round(50 - diff / 60)))
              const selected = opponent?.id === o.id
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => setOpponent(o)}
                    aria-pressed={selected}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all',
                      selected ? 'border-primary/60 bg-primary/10' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15',
                    )}
                  >
                    <div data-rarity={o.rarity} className="flex size-10 shrink-0 items-center justify-center rounded-lg border rarity-border rarity-bg font-display font-bold rarity-text">
                      {o.stats.ctScore}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">@{o.handle}</p>
                      <p className="text-xs text-muted-foreground">
                        LV {o.level} · {num(cultPower(o))} CP
                      </p>
                    </div>
                    <div className="text-right">
                      <RarityBadge rarity={o.rarity} />
                      <p className={cn('mt-1 text-xs font-semibold tabular-nums', odds >= 50 ? 'text-success' : 'text-muted-foreground')}>{odds}% odds</p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </Panel>
      </div>

      <section aria-labelledby="history">
        <h2 id="history" className="font-display text-xl font-bold uppercase tracking-wide">
          Battle History
        </h2>
        {state.battles.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-muted-foreground">
            No battles yet. Choose a challenger above to enter the Arena.
          </p>
        ) : (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {state.battles.slice(0, 8).map((b) => (
              <li key={b.id} className="glass flex items-center justify-between rounded-xl px-4 py-3 text-sm">
                <span className="flex items-center gap-3">
                  {b.result === 'victory' ? <Trophy className="size-4 text-success" aria-hidden /> : <Shield className="size-4 text-muted-foreground" aria-hidden />}
                  <span>
                    <span className={cn('font-display font-bold uppercase', b.result === 'victory' ? 'text-success' : 'text-muted-foreground')}>{b.result}</span>{' '}
                    vs @{b.opponentHandle}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  +{b.xp} XP · {timeAgo(b.at)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-6 text-xs text-muted-foreground">
          Compared stats: {BATTLE_STATS.map((s) => s.label).join(' · ')}.{' '}
          <Link href="/championships" className="text-foreground underline-offset-4 hover:underline">
            Enter a tournament
          </Link>
        </p>
      </section>
    </div>
  )
}

function Combatant({ label, card, score, winner, loser }: { label: string; card: CultCard; score: number; winner: boolean; loser: boolean }) {
  return (
    <div className={cn('relative flex flex-col items-center gap-4 transition-all duration-700', loser && 'scale-95 opacity-50 grayscale')}>
      {winner && <Particles count={20} seed={card.handle} />}
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
      <CultCardView card={card} size="md" tilt={false} />
      <p className="font-display text-4xl font-bold tabular-nums">{score}</p>
    </div>
  )
}
