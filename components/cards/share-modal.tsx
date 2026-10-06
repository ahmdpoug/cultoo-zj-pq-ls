'use client'

import { useState } from 'react'
import { Check, Copy, ExternalLink } from 'lucide-react'
import type { CultCard } from '@/lib/types'
import { Modal } from '@/components/ui-kit/modal'
import { CultButton } from '@/components/ui-kit/cult-button'
import { RARITY_META } from '@/lib/game/rarity'
import { cultPower } from '@/lib/game/scoring'
import { num } from '@/lib/game/format'
import { recordShare, services } from '@/lib/services'
import { CultCardView } from './cult-card'

export function shareText(card: CultCard) {
  return `I just pulled a ${RARITY_META[card.rarity].label.toUpperCase()} CULT Card.\n\nCT Score: ${card.stats.ctScore}\nCult Power: ${num(cultPower(card))}\n\nScan yours.`
}

function markShared() {
  void recordShare().catch(() => {})
}

export function ShareModal({ card, open, onClose }: { card: CultCard; open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const text = shareText(card)
  const url = typeof window !== 'undefined' ? window.location.origin : undefined

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${text}\n${url ?? ''}`)
      setCopied(true)
      markShared()
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  function openX() {
    markShared()
    window.open(services.social.shareUrl(text, url), '_blank', 'noopener,noreferrer')
  }

  return (
    <Modal open={open} onClose={onClose} title="Share to X">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
        <div className="flex items-center justify-center bg-[radial-gradient(circle_at_50%_30%,oklch(0.4_0.16_296/0.35),transparent_70%)] py-6">
          <CultCardView card={card} size="sm" tilt={false} />
        </div>
        <p className="whitespace-pre-line border-t border-white/10 p-4 text-sm leading-relaxed text-foreground">{text}</p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <CultButton variant="outline" onClick={copy} icon={copied ? <Check className="size-4" /> : <Copy className="size-4" />}>
          {copied ? 'Copied' : 'Copy Text'}
        </CultButton>
        <CultButton onClick={openX} icon={<ExternalLink className="size-4" />}>
          Post on X
        </CultButton>
      </div>
    </Modal>
  )
}
