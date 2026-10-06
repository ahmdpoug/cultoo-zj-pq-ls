'use client'

import { useMemo, useState } from 'react'
import { Flame, Hammer, Plus, Equal, PackageOpen } from 'lucide-react'
import type { CultCard, Rarity } from '@/lib/types'
import { useGame } from '@/hooks/use-game'
import { services, InsufficientBalanceError } from '@/lib/services'
import { RARITIES, RARITY_META, nextRarity } from '@/lib/game/rarity'
import { num } from '@/lib/game/format'
import { CultCardView } from '@/components/cards/cult-card'
import { CultButton, CultLink } from '@/components/ui-kit/cult-button'
import { Modal } from '@/components/ui-kit/modal'
import { EmptyState, Panel, RarityBadge } from '@/components/ui-kit/primitives'
import { Particles } from '@/components/ui-kit/particles'
import { cn } from '@/lib/utils'

const FORGEABLE = RARITIES.filter((r) => nextRarity(r)) as Rarity[]
const CONVERGE = ['[animation:converge-left_1.6s_ease-in_forwards]', '[animation:converge-center_1.6s_ease-in_forwards]', '[animation:converge-right_1.6s_ease-in_forwards]']

export function Forge() {
  const { state } = useGame()
  const [input, setInput] = useState<Rarity>('rare')
  const [selected, setSelected] = useState<string[]>([])
  const [forging, setForging] = useState(false)
  const [result, setResult] = useState<CultCard | null>(null)
  const [error, setError] = useState<string | null>(null)

  const output = nextRarity(input)!
  const cost = RARITY_META[output].forgeCost
  const pool = useMemo(() => state.cards.filter((c) => c.rarity === input), [state.cards, input])
  const chosen = selected.map((id) => state.cards.find((c) => c.id === id)).filter(Boolean) as CultCard[]
  const ready = chosen.length === 3 && state.economy.balance >= cost

  function toggle(id: string) {
    setError(null)
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 3 ? [...s, id] : s))
  }

  function switchRarity(r: Rarity) {
    setInput(r)
    setSelected([])
    setError(null)
  }

  async function forge() {
    setForging(true)
    setError(null)
    try {
      const { card } = await services.forge.forge(selected)
      setResult(card)
      setSelected([])
    } catch (e) {
      setError(e instanceof InsufficientBalanceError ? `Forging requires ${num(cost)} $CULT.` : (e as Error).message)
    } finally {
      setForging(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1" role="tablist" aria-label="Recipe">
        {FORGEABLE.map((r) => {
          const count = state.cards.filter((c) => c.rarity === r).length
          return (
            <button
              key={r}
              role="tab"
              aria-selected={input === r}
              onClick={() => switchRarity(r)}
              data-rarity={r}
              className={cn(
                'flex shrink-0 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                input === r ? 'rarity-border rarity-bg' : 'border-white/[0.07] hover:border-white/15',
              )}
            >
              <span className="font-display text-sm font-bold uppercase">
                3 <span className="rarity-text">{RARITY_META[r].label}</span> → 1{' '}
                <span data-rarity={nextRarity(r)!} className="rarity-text">
                  {RARITY_META[nextRarity(r)!].label}
                </span>
              </span>
              <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-xs tabular-nums text-muted-foreground">{count}</span>
            </button>
          )
        })}
      </div>

      <Panel className="relative overflow-hidden p-6 sm:p-10">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(50%_70%_at_50%_100%,oklch(0.55_0.2_40/0.18),transparent_70%)]" />
        {forging && <Particles count={40} seed="forge" />}
        <div className="relative flex flex-col items-center gap-6 lg:flex-row lg:justify-center">
          <div className="flex items-center gap-2 sm:gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-4">
                <div className={cn(forging && CONVERGE[i])}>
                  {chosen[i] ? (
                    <CultCardView card={chosen[i]} size="xs" tilt={false} onClick={() => toggle(chosen[i].id)} className="sm:w-32" />
                  ) : (
                    <div data-rarity={input} className="flex aspect-[5/7] w-28 items-center justify-center rounded-2xl border border-dashed rarity-border bg-black/30 sm:w-32">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] rarity-text">Slot {i + 1}</span>
                    </div>
                  )}
                </div>
                {i < 2 && <Plus className="hidden size-4 text-muted-foreground sm:block" aria-hidden />}
              </div>
            ))}
          </div>
          <Equal className="size-6 rotate-90 text-muted-foreground lg:rotate-0" aria-hidden />
          <div data-rarity={output} className="relative">
            <div aria-hidden className={cn('absolute inset-0 rounded-2xl bg-[var(--r-1)] blur-2xl transition-opacity duration-700', forging ? 'opacity-60' : 'opacity-15')} />
            <div className={cn('relative flex aspect-[5/7] w-36 flex-col items-center justify-center rounded-2xl border-2 rarity-border bg-black/50 sm:w-40', forging && 'animate-pulse')}>
              <Flame className="size-8 rarity-text" aria-hidden />
              <span className="mt-3 font-display text-sm font-bold uppercase tracking-[0.2em] rarity-text">{RARITY_META[output].label}</span>
              <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Result</span>
            </div>
          </div>
        </div>

        <div className="relative mt-10 flex flex-col items-center gap-4 border-t border-white/[0.06] pt-6 sm:flex-row sm:justify-between">
          <dl className="flex gap-8 text-sm">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Forge cost</dt>
              <dd className="font-display text-xl font-bold tabular-nums">{num(cost)} $CULT</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Balance</dt>
              <dd className={cn('font-display text-xl font-bold tabular-nums', state.economy.balance < cost && 'text-destructive')}>{num(state.economy.balance)}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Selected</dt>
              <dd className="font-display text-xl font-bold tabular-nums">{chosen.length} / 3</dd>
            </div>
          </dl>
          <CultButton size="lg" onClick={forge} disabled={!ready} loading={forging} icon={<Hammer className="size-4" />} className="w-full sm:w-auto">
            {forging ? 'Forging' : 'Forge'}
          </CultButton>
        </div>
        {error && <p role="alert" className="relative mt-3 text-center text-sm text-destructive sm:text-right">{error}</p>}
      </Panel>

      <section aria-labelledby="inventory">
        <div className="flex items-center justify-between">
          <h2 id="inventory" className="font-display text-xl font-bold uppercase tracking-wide">
            Inventory · <span data-rarity={input} className="rarity-text">{RARITY_META[input].label}</span>
          </h2>
        </div>
        {pool.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={<PackageOpen className="size-6" />}
              title={`No ${RARITY_META[input].label} cards`}
              description="Scan more profiles, buy from the Cult Market, or forge lower tiers to fill this shelf."
              action={<CultLink href="/market" variant="outline">Browse Market</CultLink>}
            />
          </div>
        ) : (
          <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {pool.map((c) => {
              const isSel = selected.includes(c.id)
              return (
                <li key={c.id} className="relative">
                  <CultCardView
                    card={c}
                    size="sm"
                    tilt={false}
                    onClick={() => toggle(c.id)}
                    className={cn('w-full transition-all duration-300', isSel ? '-translate-y-1.5 drop-shadow-[0_0_18px_oklch(0.66_0.21_296/0.6)]' : 'opacity-80 hover:opacity-100')}
                  />
                  {isSel && (
                    <span className="pointer-events-none absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-primary font-display text-xs font-bold text-primary-foreground">
                      {selected.indexOf(c.id) + 1}
                    </span>
                  )}
                  {c.id === state.mainCardId && <p className="mt-1 text-center text-[10px] uppercase tracking-[0.2em] text-primary">Main card</p>}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <Modal open={Boolean(result)} onClose={() => setResult(null)} title="Forge Complete">
        {result && (
          <div className="flex flex-col items-center text-center">
            <div className="relative py-4">
              <div data-rarity={result.rarity} aria-hidden className="absolute inset-0 m-auto size-56 rounded-full bg-[var(--r-1)] opacity-30 blur-3xl" />
              <div className="animate-reveal">
                <CultCardView card={result} size="md" />
              </div>
            </div>
            <RarityBadge rarity={result.rarity} className="mt-2" />
            <p className="mt-3 text-sm text-muted-foreground">Three became one. Stats +3 across the board.</p>
            <div className="mt-5 grid w-full grid-cols-2 gap-3">
              <CultButton variant="outline" onClick={() => setResult(null)}>
                Forge Again
              </CultButton>
              <CultLink href="/profile">Collection</CultLink>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
