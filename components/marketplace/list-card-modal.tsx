'use client'

import { useState } from 'react'
import { ExternalLink, Tag } from 'lucide-react'
import type { CultCard, TxReceipt } from '@/lib/types'
import { useChainInfo } from '@/hooks/use-data'
import { CULT_CHAIN_NAME } from '@/lib/config/cult'
import { services, InsufficientBalanceError } from '@/lib/services'
import { LISTING_FEE, MAX_LISTING_PRICE } from '@/lib/game/config'
import { CultButton, CultLink } from '@/components/ui-kit/cult-button'
import { Modal } from '@/components/ui-kit/modal'
import { num } from '@/lib/game/format'

export function ListCardModal({ card, open, onClose }: { card: CultCard; open: boolean; onClose: () => void }) {
  const { data: chain } = useChainInfo()
  const [price, setPrice] = useState('')
  const [busy, setBusy] = useState(false)
  const [tx, setTx] = useState<TxReceipt | null>(null)
  const [error, setError] = useState<string | null>(null)
  const onChain = Boolean(chain?.configured && chain.treasury)

  const value = Number(price)
  const valid = Number.isInteger(value) && value > 0 && value <= MAX_LISTING_PRICE

  async function submit() {
    if (!valid) return
    setBusy(true)
    setError(null)
    try {
      const { receipt } = await services.marketplace.list(card.id, value)
      setTx(receipt)
    } catch (e) {
      setError(e instanceof InsufficientBalanceError ? `You need ${num(LISTING_FEE)} $CULT to list a card.` : (e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  function close() {
    setPrice('')
    setTx(null)
    setError(null)
    onClose()
  }

  return (
    <Modal open={open} onClose={close} title={tx ? 'Card Listed' : 'List Card for Sale'}>
      {tx ? (
        <div className="space-y-4 text-sm">
          <p className="font-semibold text-success">@{card.handle} is live on the Cult Market.</p>
          {tx.explorerUrl ? (
            <a
              href={tx.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 break-all font-mono text-xs text-primary hover:underline"
            >
              <ExternalLink className="size-3.5 shrink-0" aria-hidden />
              {tx.hash}
            </a>
          ) : (
            <p className="break-all font-mono text-xs text-muted-foreground">Receipt: {tx.hash}</p>
          )}
          <CultLink href="/market" variant="outline" className="w-full">
            View the Market
          </CultLink>
        </div>
      ) : (
        <form
          className="space-y-4 text-sm"
          onSubmit={(e) => {
            e.preventDefault()
            void submit()
          }}
        >
          <label className="block">
            <span className="text-muted-foreground">Asking price ($CULT)</span>
            <input
              type="number"
              min={1}
              max={MAX_LISTING_PRICE}
              step={1}
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="1000"
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-display text-lg tabular-nums outline-none focus:border-primary/60"
            />
          </label>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Listing fee</span>
            <span className="tabular-nums">{num(LISTING_FEE)} $CULT</span>
          </div>
          {onChain && (
            <p className="text-xs text-muted-foreground">
              The fee is paid on-chain in $CULT on {CULT_CHAIN_NAME}. Buyers pay your wallet directly when the card sells.
            </p>
          )}
          {error && (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          )}
          <CultButton type="submit" className="w-full" loading={busy} disabled={!valid} icon={<Tag className="size-4" />}>
            {busy ? 'Listing' : `List for ${valid ? num(value) : '—'} $CULT`}
          </CultButton>
        </form>
      )}
    </Modal>
  )
}
