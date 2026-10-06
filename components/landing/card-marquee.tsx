'use client'

import Link from 'next/link'
import { CultCardView } from '@/components/cards/cult-card'
import { usePool } from '@/hooks/use-data'

/** Endless strip of real cards from the pool. Pauses on hover and focus. */
export function CardMarquee() {
  const { data: pool } = usePool()
  const cards = (pool ?? []).slice(0, 10)
  if (cards.length < 4) return null
  const row = [...cards, ...cards]

  return (
    <section aria-label="Live cards from the pool" className="marquee relative -mx-4 overflow-hidden py-4 sm:mx-0">
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
      <div className="marquee-track gap-5">
        {row.map((card, i) => {
          const duplicate = i >= cards.length
          return (
            <Link
              key={`${card.id}-${i}`}
              href="/market"
              aria-hidden={duplicate}
              tabIndex={duplicate ? -1 : undefined}
              className="w-40 shrink-0"
            >
              <CultCardView card={card} size="sm" tilt={false} />
            </Link>
          )
        })}
      </div>
    </section>
  )
}
