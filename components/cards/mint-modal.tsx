'use client'

import { useState } from 'react'
import { CheckCircle2, Gem } from 'lucide-react'
import type { CultCard, TxReceipt } from '@/lib/types'
import { Modal } from '@/components/ui-kit/modal'
import { CultButton } from '@/components/ui-kit/cult-button'
import { RarityBadge } from '@/components/ui-kit/primitives'
import { services } from '@/lib/services'
import { cardNo } from '@/lib/game/format'
import { CultCardView } from './cult-card'

type Step = 'confirm' | 'pending' | 'done'

export function MintModal({ card, open, onClose }: { card: CultCard; open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<Step>('confirm')
  const [tx, setTx] = useState<TxReceipt | null>(null)

  async function mint() {
    setStep('pending')
    const r = await services.nft.mint(card.id)
    setTx(r)
    setStep('done')
  }

  function close() {
    onClose()
    setTimeout(() => setStep('confirm'), 200)
  }

  return (
    <Modal open={open} onClose={close} title={step === 'done' ? 'Card Minted' : 'Mint CULT Card'}>
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <div className={step === 'pending' ? 'animate-pulse' : step === 'done' ? 'animate-reveal' : ''}>
          <CultCardView card={card} size="sm" tilt={false} />
        </div>
        <div className="w-full flex-1 space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <RarityBadge rarity={card.rarity} />
          </div>
          <p className="font-display text-lg font-bold">CULT CARD {cardNo(card.number)}</p>
          <dl className="space-y-1.5 text-muted-foreground">
            <Row k="Season" v="Genesis" />
            <Row k="Edition" v={card.edition} />
            <Row k="Owner" v={`@${card.owner}`} />
            <Row k="Network fee" v="0" />
          </dl>
        </div>
      </div>

      {step === 'done' && tx ? (
        <div className="mt-6 rounded-xl border border-success/30 bg-success/10 p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold text-success">
            <CheckCircle2 className="size-4" aria-hidden /> Card minted
          </p>
          <p className="mt-2 break-all font-mono text-xs text-muted-foreground">Receipt: {tx.hash}</p>
        </div>
      ) : (
        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
          Minting records this card as a collectible in your CULT collection.
        </p>
      )}

      <div className="mt-5">
        {step === 'done' ? (
          <CultButton className="w-full" variant="outline" onClick={close}>
            Done
          </CultButton>
        ) : (
          <CultButton className="w-full" onClick={mint} loading={step === 'pending'} icon={<Gem className="size-4" />}>
            {step === 'pending' ? 'Minting' : 'Confirm Mint'}
          </CultButton>
        )}
      </div>
    </Modal>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/5 pb-1.5">
      <dt>{k}</dt>
      <dd className="text-foreground">{v}</dd>
    </div>
  )
}
