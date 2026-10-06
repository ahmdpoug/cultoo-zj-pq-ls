'use client'

import { useState } from 'react'
import { CheckCircle2, Clock, Crown, ExternalLink, Users } from 'lucide-react'
import type { Tournament, TxReceipt } from '@/lib/types'
import { BRACKET_ROUNDS } from '@/lib/game/config'
import { useChainInfo, useTournaments } from '@/hooks/use-data'
import { CULT_CHAIN_NAME, shortAddress } from '@/lib/config/cult'
import { useGame, useMounted } from '@/hooks/use-game'
import { services, InsufficientBalanceError } from '@/lib/services'
import { RARITY_META, compareRarity } from '@/lib/game/rarity'
import { compact, num } from '@/lib/game/format'
import { CultButton } from '@/components/ui-kit/cult-button'
import { EmptyState, Panel, RarityBadge, Skeleton } from '@/components/ui-kit/primitives'
import { cn } from '@/lib/utils'

const STATUS: Record<Tournament['status'], { label: string; cls: string }> = {
  live: { label: 'Live', cls: 'border-destructive/40 bg-destructive/15 text-destructive' },
  registering: { label: 'Registering', cls: 'border-primary/40 bg-primary/15 text-primary' },
  upcoming: { label: 'Upcoming', cls: 'border-white/15 bg-white/5 text-foreground' },
  completed: { label: 'Completed', cls: 'border-white/10 bg-white/[0.03] text-muted-foreground' },
}

function startLabel(h: number) {
  if (h < 0) return 'Ended'
  if (h === 0) return 'In progress'
  return h < 24 ? `Starts in ${h}h` : `Starts in ${Math.round(h / 24)}d`
}

export function TournamentBoard() {
  const mounted = useMounted()
  const { state, mainCard } = useGame()
  const { data, isLoading } = useTournaments()
  const tournaments = data ?? []
  const [active, setActive] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ id: string; text: string } | null>(null)
  const [tx, setTx] = useState<TxReceipt | null>(null)
  const { data: chain } = useChainInfo()
  const tournament = tournaments.find((t) => t.id === active) ?? tournaments[0]
  const onChain = Boolean(chain?.configured && chain.treasury)

  async function enter(t: Tournament) {
    setBusy(t.id)
    setMsg(null)
    setTx(null)
    try {
      const receipt = await services.tournament.enter(t.id, t.entry)
      setTx(receipt)
      setMsg({ id: t.id, text: 'Entry confirmed.' })
    } catch (e) {
      setMsg({ id: t.id, text: e instanceof InsufficientBalanceError ? 'Not enough $CULT.' : (e as Error).message })
    } finally {
      setBusy(null)
    }
  }

  if (isLoading && tournaments.length === 0) {
    return (
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  if (tournaments.length === 0) {
    return <EmptyState icon={<Crown className="size-6" />} title="No tournaments scheduled" description="Weekly brackets open every Monday. Check back soon." />
  }

  return (
    <div className="space-y-8">
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tournaments.map((t) => {
          const entered = mounted && state.tournaments.includes(t.id)
          const eligible = mainCard ? compareRarity(mainCard.rarity, t.minRarity) >= 0 : false
          const canEnter = (t.status === 'registering' || t.status === 'upcoming') && !entered
          return (
            <li key={t.id}>
              <Panel as="article" className={cn('flex h-full flex-col p-5 transition-colors', active === t.id && 'border-primary/40')}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-bold uppercase">{t.name}</h3>
                    <p className="text-sm text-muted-foreground">{t.tagline}</p>
                  </div>
                  <span className={cn('shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em]', STATUS[t.status].cls)}>
                    {t.status === 'live' && <span className="mr-1.5 inline-block size-1.5 animate-pulse rounded-full bg-current align-middle" />}
                    {STATUS[t.status].label}
                  </span>
                </div>
                <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <dt className="flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      <Users className="size-3" aria-hidden /> Players
                    </dt>
                    <dd className="mt-0.5 font-display font-bold tabular-nums">
                      {num(t.players)}/{num(t.maxPlayers)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Entry</dt>
                    <dd className="mt-0.5 font-display font-bold tabular-nums">{num(t.entry)}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Prize</dt>
                    <dd className="mt-0.5 font-display font-bold tabular-nums text-primary">{compact(t.prize)}</dd>
                  </div>
                </dl>
                <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-primary/80" style={{ width: `${Math.min(100, (t.players / t.maxPlayers) * 100)}%` }} />
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5" aria-hidden /> {startLabel(t.startsInHours)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    Min <RarityBadge rarity={t.minRarity} />
                  </span>
                </div>
                <div className="mt-5 flex gap-2 pt-1 mt-auto">
                  <CultButton variant="outline" size="sm" className="flex-1" onClick={() => setActive(t.id)}>
                    Bracket
                  </CultButton>
                  {entered ? (
                    <span className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-success/30 bg-success/10 text-xs font-semibold uppercase tracking-wider text-success">
                      <CheckCircle2 className="size-4" aria-hidden /> Entered
                    </span>
                  ) : (
                    <CultButton
                      size="sm"
                      className="flex-1"
                      disabled={!canEnter || !eligible}
                      loading={busy === t.id}
                      onClick={() => enter(t)}
                      title={!eligible ? `Requires ${RARITY_META[t.minRarity].label}+ main card` : undefined}
                    >
                      {!canEnter ? STATUS[t.status].label : !mainCard ? 'Need card' : !eligible ? 'Ineligible' : 'Enter'}
                    </CultButton>
                  )}
                </div>
                {msg?.id === t.id && <p role="status" className="mt-2 text-xs text-primary">{msg.text}</p>}
                {onChain && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Entry is paid on-chain in $CULT on {CULT_CHAIN_NAME}
                    {state.wallet.address ? ` from ${shortAddress(state.wallet.address)}` : ''}.
                  </p>
                )}
                {tx?.explorerUrl && (
                  <a
                    href={tx.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 flex items-center gap-1.5 break-all font-mono text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="size-3.5 shrink-0" aria-hidden />
                    {tx.hash}
                  </a>
                )}
              </Panel>
            </li>
          )
        })}
      </ul>

      {tournament && <Bracket tournament={tournament} />}
    </div>
  )
}

function Bracket({ tournament }: { tournament: Tournament }) {
  const rounds = BRACKET_ROUNDS.filter((r) => r <= tournament.maxPlayers)
  const currentIndex = tournament.status === 'completed' ? rounds.length : tournament.status === 'live' ? 3 : -1
  return (
    <Panel as="section" className="p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Bracket</p>
          <h2 className="font-display text-2xl font-bold uppercase">{tournament.name}</h2>
        </div>
        <p className="text-sm text-muted-foreground">Single elimination · Best of 3</p>
      </div>
      <ol className="mt-8 flex flex-col items-center gap-0">
        {rounds.map((r, i) => {
          const done = i < currentIndex
          const now = i === currentIndex
          const width = 100 - (i / rounds.length) * 70
          return (
            <li key={r} className="flex w-full flex-col items-center">
              <div
                className={cn(
                  'flex items-center justify-between rounded-xl border px-4 py-2.5 transition-colors',
                  now ? 'border-primary/60 bg-primary/15 shadow-[0_0_24px_-6px_oklch(0.66_0.21_296)]' : done ? 'border-white/10 bg-white/[0.04]' : 'border-white/[0.06] bg-black/30',
                )}
                style={{ width: `${width}%` }}
              >
                <span className="font-display text-lg font-bold tabular-nums">{r === 2 ? 'FINAL' : num(r)}</span>
                <span className={cn('text-[10px] font-semibold uppercase tracking-[0.2em]', now ? 'text-primary' : 'text-muted-foreground')}>
                  {done ? 'Complete' : now ? 'Live now' : r === 2 ? 'Championship' : `Round of ${r}`}
                </span>
              </div>
              <span aria-hidden className={cn('h-4 w-px', done ? 'bg-primary/50' : 'bg-white/10')} />
            </li>
          )
        })}
        <li className="mt-1 flex flex-col items-center">
          <span className="flex size-14 items-center justify-center rounded-2xl border border-primary/50 bg-primary/15">
            <Crown className="size-6 text-primary" aria-hidden />
          </span>
          <p className="mt-2 font-display text-sm font-bold uppercase tracking-[0.3em] metal-text">CT Champion</p>
        </li>
      </ol>
    </Panel>
  )
}
