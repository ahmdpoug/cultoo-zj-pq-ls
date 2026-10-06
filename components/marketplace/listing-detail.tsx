'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, ShoppingBag } from 'lucide-react'
import type { Listing, TxReceipt } from '@/lib/types'
import { useGame } from '@/hooks/use-game'
import { services, InsufficientBalanceError } from '@/lib/services'
import { CultCardView } from '@/components/cards/cult-card'
import { NftDetails } from '@/components/cards/nft-details'
import { CultButton, CultLink } from '@/components/ui-kit/cult-button'
import { Modal } from '@/components/ui-kit/modal'
import { Panel, RarityBadge, StatBar } from '@/components/ui-kit/primitives'
import { cardNo, num } from '@/lib/game/format'
import { cultPower, winRate } from '@/lib/game/scoring'

export function ListingDetail({ listing }: { listing: Listing }) {
  const { state, hasPlayer } = useGame()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [tx, setTx] = useState<TxReceipt | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { card } = listing

  async function buy() {
    setBusy(true)
    setError(null)
    try {
      const { receipt } = await services.marketplace.buy(listing)
      setTx(receipt)
    } catch (e) {
      setError(e instanceof InsufficientBalanceError ? `You need ${num(listing.price)} $CULT. Win battles or complete quests to earn more.` : (e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <Link href="/market" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Back to Cult Market
      </Link>
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="relative flex justify-center rounded-3xl border border-white/[0.06] bg-[radial-gradient(60%_60%_at_50%_40%,oklch(0.32_0.14_296/0.4),transparent_70%)] py-12">
          <div aria-hidden className="absolute inset-0 grid-bg opacity-40" />
          <CultCardView card={card} size="xl" />
        </div>
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3">
              <RarityBadge rarity={card.rarity} />
              <span className="text-sm tabular-nums text-muted-foreground">{cardNo(card.number)}</span>
            </div>
            <h1 className="mt-3 font-display text-4xl font-bold uppercase metal-text">@{card.handle}</h1>
            <p className="mt-1 text-muted-foreground">Listed by @{listing.seller}</p>
          </div>

          <Panel className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Price</p>
              <p className="font-display text-3xl font-bold tabular-nums">
                {num(listing.price)} <span className="text-base text-muted-foreground">$CULT</span>
              </p>
            </div>
            {hasPlayer ? (
              <CultButton size="lg" onClick={() => setOpen(true)} icon={<ShoppingBag className="size-4" />}>
                Buy Card
              </CultButton>
            ) : (
              <CultLink href="/scan" size="lg">
                Scan to Buy
              </CultLink>
            )}
          </Panel>

          <Panel className="grid gap-5 p-6 sm:grid-cols-2">
            <StatBar label="CT Score" value={card.stats.ctScore} />
            <StatBar label="Reputation" value={card.stats.reputation} />
            <StatBar label="Influence" value={card.stats.influence} />
            <StatBar label="Alpha" value={card.stats.alpha} />
            <div className="sm:col-span-2 grid grid-cols-3 gap-3 border-t border-white/[0.06] pt-4 text-center">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Cult Power</p>
                <p className="font-display text-xl font-bold tabular-nums">{num(cultPower(card))}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Win Rate</p>
                <p className="font-display text-xl font-bold tabular-nums">{winRate(card)}%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Level</p>
                <p className="font-display text-xl font-bold tabular-nums">{card.level}</p>
              </div>
            </div>
          </Panel>

          <Panel className="p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em]">NFT Details</h2>
            <NftDetails card={card} className="mt-3" />
          </Panel>
        </div>
      </div>

      <Modal open={open} onClose={() => { setOpen(false); setTx(null); setError(null) }} title={tx ? 'Purchase Complete' : 'Confirm Purchase'}>
        {tx ? (
          <div className="space-y-4 text-sm">
            <p className="flex items-center gap-2 font-semibold text-success">
              <CheckCircle2 className="size-4" aria-hidden /> @{card.handle} added to your collection
            </p>
            <p className="break-all font-mono text-xs text-muted-foreground">Receipt: {tx.hash}</p>
            <CultLink href="/forge" variant="outline" className="w-full">
              Take it to The Forge
            </CultLink>
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Card</span>
              <span>@{card.handle} · {cardNo(card.number)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price</span>
              <span className="font-semibold tabular-nums">{num(listing.price)} $CULT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your balance</span>
              <span className="tabular-nums">{num(state.economy.balance)} $CULT</span>
            </div>
            {error && <p role="alert" className="text-destructive">{error}</p>}
            <CultButton className="w-full" onClick={buy} loading={busy}>
              {busy ? 'Processing' : 'Confirm Purchase'}
            </CultButton>
          </div>
        )}
      </Modal>
    </div>
  )
}
