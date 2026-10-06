'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, AtSign, RotateCcw, ScanLine, Share2, Swords } from 'lucide-react'
import type { CultCard, ScanQuote, XProfile } from '@/lib/types'
import { services, XLookupError } from '@/lib/services'
import { useCultAuth } from '@/lib/auth/cult-auth'
import { useChainInfo } from '@/hooks/use-data'
import { CULT_CHAIN_NAME } from '@/lib/config/cult'
import { CardAvatar } from '@/components/cards/card-avatar'
import { XLogo } from '@/components/layout/account-button'
import { useGame } from '@/hooks/use-game'
import { CultButton } from '@/components/ui-kit/cult-button'
import { Panel, RarityBadge } from '@/components/ui-kit/primitives'
import { Particles } from '@/components/ui-kit/particles'
import { CultCardView } from '@/components/cards/cult-card'
import { ShareModal } from '@/components/cards/share-modal'
import { compact, num } from '@/lib/game/format'
import { cultPower, normalizeHandle } from '@/lib/game/scoring'
import { RARITY_META } from '@/lib/game/rarity'
import { cn } from '@/lib/utils'

type Phase = 'idle' | 'scanning' | 'pay' | 'profile' | 'reveal'

const SCAN_STEPS = ['Reading timeline', 'Measuring influence', 'Weighing reputation', 'Calculating alpha', 'Striking card']

export function CTScanner() {
  const router = useRouter()
  const { state } = useGame()
  const [handle, setHandle] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [step, setStep] = useState(0)
  const [result, setResult] = useState<{ card: CultCard; profile: XProfile } | null>(null)
  const [quote, setQuote] = useState<ScanQuote | null>(null)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shareOpen, setShareOpen] = useState(false)
  const { data: chain } = useChainInfo()
  const isFirstCard = !state.mainCardId || state.mainCardId === result?.card.id

  async function run(raw: string) {
    const clean = normalizeHandle(raw)
    if (!clean) {
      setError('Enter a valid X username (letters, numbers, underscore).')
      return
    }
    setError(null)
    setHandle(clean)
    setPhase('scanning')
    setStep(0)
    const ticker = setInterval(() => setStep((s) => Math.min(s + 1, SCAN_STEPS.length - 1)), 480)
    let res: ScanQuote
    try {
      ;[res] = await Promise.all([services.onboarding.quote(clean), new Promise((r) => setTimeout(r, 2500))])
    } catch (err) {
      setError(err instanceof XLookupError ? err.message : 'Could not reach X right now. Try again.')
      setPhase('idle')
      return
    } finally {
      clearInterval(ticker)
    }
    setQuote(res)
    setPhase('pay')
  }

  async function pay() {
    if (!quote) return
    setPaying(true)
    setError(null)
    try {
      const res = await services.onboarding.createPlayer(quote.handle, quote.price)
      setResult(res)
      setPhase('profile')
      setTimeout(() => setPhase('reveal'), 1800)
    } catch (err) {
      setError(err instanceof XLookupError ? err.message : (err as Error).message)
    } finally {
      setPaying(false)
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void run(handle)
  }

  function reset() {
    setPhase('idle')
    setResult(null)
    setQuote(null)
    setHandle('')
    setError(null)
  }

  if (phase === 'idle') {
    return (
      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        <Panel className="relative overflow-hidden p-6 sm:p-10">
          <div aria-hidden className="absolute inset-0 grid-bg opacity-50" />
          <form onSubmit={onSubmit} className="relative">
            <ConnectedIdentity onScanSelf={(u) => void run(u)} />
            <label htmlFor="handle" className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              X Username
            </label>
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 transition-colors focus-within:border-primary/60 focus-within:shadow-[0_0_0_4px_oklch(0.66_0.21_296/0.15)]">
              <AtSign className="size-5 text-muted-foreground" aria-hidden />
              <input
                id="handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="Enter X username"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={16}
                className="h-14 w-full bg-transparent font-display text-lg font-semibold tracking-wide outline-none placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:text-muted-foreground"
              />
            </div>
            {error && (
              <p role="alert" className="mt-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="mt-5">
              <CultButton type="submit" size="lg" className="w-full" icon={<ScanLine className="size-4" />}>
                Generate Card
              </CultButton>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
              Scans pull live public metrics from X. Each scan is paid in $CULT, priced by the rarity you pull — your first
              card is free.
            </p>
          </form>
        </Panel>

        <ul className="grid grid-cols-2 gap-3">
          {[
            ['Followers', 'Reach across CT'],
            ['Account Age', 'Time in the trenches'],
            ['CT Activity', 'Posting cadence'],
            ['Engagement', 'Replies, quotes, reposts'],
            ['Influence', 'Weight of your voice'],
            ['Alpha', 'Signal before the crowd'],
          ].map(([k, v], i) => (
            <li key={k} className="glass rounded-xl p-4 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
              <p className="font-display text-sm font-bold uppercase tracking-wide">{k}</p>
              <p className="mt-1 text-xs text-muted-foreground">{v}</p>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (phase === 'scanning') {
    return (
      <div className="flex flex-col items-center py-10" aria-live="polite">
        <div className="relative flex aspect-[5/7] w-56 items-center justify-center overflow-hidden rounded-2xl border border-primary/30 bg-card">
          <div aria-hidden className="absolute inset-0 grid-bg opacity-80" />
          <div aria-hidden className="absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-primary/30 to-transparent [animation:scan-line_1.4s_linear_infinite]" />
          <div className="relative flex size-20 items-center justify-center rounded-full border border-primary/40 animate-pulse-ring">
            <ScanLine className="size-8 text-primary" aria-hidden />
          </div>
        </div>
        <p className="mt-8 font-display text-2xl font-bold tracking-wide">@{handle}</p>
        <ol className="mt-5 w-full max-w-xs space-y-2">
          {SCAN_STEPS.map((s, i) => (
            <li key={s} className={cn('flex items-center gap-3 text-sm transition-colors', i <= step ? 'text-foreground' : 'text-muted-foreground/50')}>
              <span className={cn('size-1.5 rounded-full', i < step ? 'bg-success' : i === step ? 'bg-primary animate-pulse' : 'bg-white/20')} />
              {s}
              {i < step && <span className="ml-auto text-xs text-success">OK</span>}
            </li>
          ))}
        </ol>
      </div>
    )
  }

  if (phase === 'pay' && quote) {
    const onChain = Boolean(chain?.configured && chain.treasury)
    return (
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <Panel className="p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Profile analyzed</p>
          <div className="mt-3 flex items-center gap-3">
            {quote.profile.avatarUrl && (
              <CardAvatar handle={quote.profile.handle} src={quote.profile.avatarUrl} className="size-12" />
            )}
            <div className="min-w-0">
              <p className="truncate font-display text-3xl font-bold">@{quote.profile.handle}</p>
              {quote.profile.displayName !== quote.profile.handle && (
                <p className="truncate text-sm text-muted-foreground">{quote.profile.displayName}</p>
              )}
            </div>
          </div>
          <div
            data-rarity={quote.rarity}
            className="mt-6 flex items-center justify-between rounded-xl border rarity-border rarity-bg p-4"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Rarity pulled</p>
              <RarityBadge rarity={quote.rarity} className="mt-2 px-3 py-1 text-xs" />
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Scan fee</p>
              <p className="font-display text-3xl font-bold tabular-nums">
                {quote.free ? 'Free' : `${num(quote.price)} $CULT`}
              </p>
            </div>
          </div>
          {error && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="mt-5 flex flex-col gap-3">
            <CultButton size="lg" className="w-full" onClick={pay} loading={paying} icon={<ScanLine className="size-4" />}>
              {quote.free ? 'Strike Card' : `Pay ${num(quote.price)} $CULT`}
            </CultButton>
            <CultButton variant="ghost" className="w-full" onClick={reset} icon={<RotateCcw className="size-4" />}>
              Scan another
            </CultButton>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            {quote.free
              ? 'Your first card is free. Later scans are paid in $CULT, priced by the rarity you pull.'
              : onChain
                ? `Paid on-chain in $CULT on ${CULT_CHAIN_NAME} from your wallet.`
                : 'Paid from your in-game $CULT balance.'}
          </p>
        </Panel>

        <div className="flex flex-col items-center">
          <div className="flex aspect-[5/7] w-72 items-center justify-center rounded-2xl border border-white/10 bg-card sm:w-80">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <ScanLine className="size-10 text-primary" aria-hidden />
              <span className="text-xs uppercase tracking-[0.3em]">Ready to strike</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!result) return null
  const { card, profile } = result
  const meta = RARITY_META[card.rarity]

  const profileRows: [string, string][] = [
    ['Followers', compact(profile.followers)],
    ['Following', num(profile.following)],
    ['Account Age', `${profile.accountAgeYears} Years`],
    ['CT Activity', String(profile.ctActivity)],
    ['Engagement', String(profile.engagement)],
    ['Influence', String(profile.influence)],
    ['Alpha', String(profile.alpha)],
  ]

  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div className="order-2 lg:order-1">
        <Panel className="p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Profile analyzed</p>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-success">
              <span aria-hidden className="size-1.5 rounded-full bg-success" /> Live X data
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            {profile.avatarUrl && <CardAvatar handle={profile.handle} src={profile.avatarUrl} className="size-12" />}
            <div className="min-w-0">
              <p className="truncate font-display text-3xl font-bold">@{profile.handle}</p>
              {profile.displayName !== profile.handle && <p className="truncate text-sm text-muted-foreground">{profile.displayName}</p>}
            </div>
          </div>
          <dl className="mt-6 divide-y divide-white/[0.06]">
            {profileRows.map(([k, v], i) => (
              <div key={k} className="flex items-center justify-between py-2.5 animate-slide-up" style={{ animationDelay: `${i * 120}ms` }}>
                <dt className="text-sm text-muted-foreground">{k}</dt>
                <dd className="font-display text-lg font-semibold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <div data-rarity={card.rarity} className="mt-6 flex items-center justify-between rounded-xl border rarity-border rarity-bg p-4 animate-slide-up" style={{ animationDelay: '900ms' }}>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">CT Score</p>
              <p className="font-display text-5xl font-bold rarity-text tabular-nums">{card.stats.ctScore}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Cult Power</p>
              <p className="font-display text-2xl font-bold tabular-nums">{num(cultPower(card))}</p>
            </div>
          </div>
        </Panel>
      </div>

      <div className="order-1 flex flex-col items-center lg:order-2" aria-live="polite">
        {phase === 'reveal' ? (
          <>
            <div className="relative flex items-center justify-center py-6">
              <div data-rarity={card.rarity} aria-hidden className="absolute size-72 rounded-full bg-[var(--r-1)] opacity-40 blur-3xl" />
              <div data-rarity={card.rarity} aria-hidden className="absolute size-64 rounded-full border-2 border-[var(--r-1)] animate-burst" />
              {meta.tier >= 2 && <Particles count={30} seed={card.handle} />}
              <div className="animate-reveal">
                <CultCardView card={card} size="xl" />
              </div>
            </div>
            <div className="mt-4 flex flex-col items-center gap-2 animate-slide-up" style={{ animationDelay: '1.2s' }}>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">You pulled</p>
              <RarityBadge rarity={card.rarity} className="px-4 py-1 text-xs" />
            </div>
            <div className="mt-6 grid w-full max-w-md grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: '1.4s' }}>
              {isFirstCard ? (
                <CultButton className="col-span-2" onClick={() => router.push('/card')} icon={<ArrowRight className="size-4" />}>
                  View My Card
                </CultButton>
              ) : (
                <CultButton className="col-span-2" onClick={() => router.push('/profile')} icon={<ArrowRight className="size-4" />}>
                  Added to Collection
                </CultButton>
              )}
              <CultButton variant="outline" onClick={() => setShareOpen(true)} icon={<Share2 className="size-4" />}>
                Share to X
              </CultButton>
              <CultButton variant="outline" onClick={() => router.push('/arena')} icon={<Swords className="size-4" />}>
                Arena
              </CultButton>
              <CultButton variant="ghost" className="col-span-2" onClick={reset} icon={<RotateCcw className="size-4" />}>
                Scan another
              </CultButton>
            </div>
            <ShareModal card={card} open={shareOpen} onClose={() => setShareOpen(false)} />
          </>
        ) : (
          <div className="flex aspect-[5/7] w-72 items-center justify-center rounded-2xl border border-white/10 bg-card sm:w-80">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="size-12 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
              <span className="text-xs uppercase tracking-[0.3em]">Striking card</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ConnectedIdentity({ onScanSelf }: { onScanSelf: (username: string) => void }) {
  const auth = useCultAuth()
  if (!auth.configured || !auth.ready) return null

  if (!auth.authenticated || !auth.x) {
    return (
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="font-display font-bold">Strike your real card</p>
          <p className="text-sm text-muted-foreground">Connect X to mint a card from your actual account.</p>
        </div>
        <CultButton type="button" onClick={auth.authenticated ? auth.linkX : auth.login} icon={<XLogo className="size-3.5" />}>
          {auth.authenticated ? 'Link X' : 'Connect X'}
        </CultButton>
      </div>
    )
  }

  const x = auth.x
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <CardAvatar handle={x.username} src={x.avatarUrl} className="size-11 shrink-0" />
        <div className="min-w-0">
          <p className="truncate font-display font-bold">{x.name ?? x.username}</p>
          <p className="truncate text-sm text-muted-foreground">Connected as @{x.username}</p>
        </div>
      </div>
      <CultButton type="button" onClick={() => onScanSelf(x.username)} icon={<ScanLine className="size-4" />}>
        Scan My X
      </CultButton>
    </div>
  )
}
