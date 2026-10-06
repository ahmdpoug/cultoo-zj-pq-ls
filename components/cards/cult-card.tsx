'use client'

import { useRef, type PointerEvent } from 'react'
import { Crown } from 'lucide-react'
import type { CultCard } from '@/lib/types'
import { cn } from '@/lib/utils'
import { RARITY_META } from '@/lib/game/rarity'
import { rankForLevel } from '@/lib/game/progression'
import { ARCHETYPE_LABEL } from '@/lib/game/scoring'
import { cardNo } from '@/lib/game/format'
import { CardAvatar } from './card-avatar'

const SIZES = {
  xs: 'w-28',
  sm: 'w-40',
  md: 'w-56',
  lg: 'w-64 sm:w-72',
  xl: 'w-72 sm:w-80',
} as const

interface CultCardViewProps {
  card: CultCard
  size?: keyof typeof SIZES
  tilt?: boolean
  flipped?: boolean
  onClick?: () => void
  className?: string
}

export function CultCardView({ card, size = 'md', tilt = true, flipped = false, onClick, className }: CultCardViewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const meta = RARITY_META[card.rarity]
  const rank = rankForLevel(card.level)

  function handleMove(e: PointerEvent<HTMLDivElement>) {
    if (!tilt || e.pointerType === 'touch' || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const el = ref.current
    el.dataset.tilting = 'true'
    el.style.setProperty('--ry', `${(x - 0.5) * 18}deg`)
    el.style.setProperty('--rx', `${(0.5 - y) * 18}deg`)
    el.style.setProperty('--mx', `${x * 100}%`)
    el.style.setProperty('--my', `${y * 100}%`)
  }

  function handleLeave() {
    const el = ref.current
    if (!el) return
    el.dataset.tilting = 'false'
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  const Wrapper = onClick ? 'button' : 'div'

  return (
    <div
      ref={ref}
      data-rarity={card.rarity}
      data-flipped={flipped}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={cn('cult-card @container shrink-0', SIZES[size], className)}
    >
      <Wrapper
        type={onClick ? 'button' : undefined}
        onClick={onClick}
        aria-label={`${meta.label} CULT card for @${card.handle}, CT score ${card.stats.ctScore}`}
        className="cult-card__inner block aspect-[5/7] w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
      >
        <div className="cult-card__face cult-card__frame">
          <div className="cult-card__surface flex flex-col p-[5cqw]">
            {rank.tier >= 1 && <CornerOrnaments strong={rank.tier >= 3} />}
            {rank.tier >= 3 && (
              <div aria-hidden className="pointer-events-none absolute inset-[2.5cqw] rounded-[3cqw] border rarity-border opacity-40" />
            )}

            <div className="relative flex items-center justify-between">
              <span className="font-display text-[length:4cqw] font-bold tracking-[0.2em] metal-text">$CULT</span>
              <span className="font-display text-[length:3.4cqw] font-semibold uppercase tracking-[0.25em] rarity-text">
                {meta.label}
              </span>
            </div>

            <div className="relative mt-[3cqw] aspect-[1/0.8] overflow-hidden rounded-[3cqw] border rarity-border bg-black/40">
              <div aria-hidden className="absolute inset-0 grid-bg opacity-60" />
              <div className="absolute inset-0 flex items-center justify-center">
                <CardAvatar handle={card.handle} src={card.avatarUrl} className="w-[40cqw]" />
              </div>
              <div className="absolute right-[3cqw] top-[3cqw] flex flex-col items-end rounded-[2cqw] border rarity-border bg-black/60 px-[2.4cqw] py-[1.2cqw] backdrop-blur">
                <span className="text-[length:2.4cqw] font-semibold tracking-[0.2em] text-muted-foreground">CT SCORE</span>
                <span className="font-display text-[length:9cqw] font-bold leading-none rarity-text tabular-nums">
                  {card.stats.ctScore}
                </span>
              </div>
              <span className="absolute bottom-[3cqw] left-[3cqw] rounded-full border border-white/10 bg-black/60 px-[2.4cqw] py-[0.8cqw] text-[length:2.6cqw] font-semibold uppercase tracking-[0.18em] text-silver">
                {ARCHETYPE_LABEL[card.archetype]}
              </span>
            </div>

            <div className="relative mt-[3.5cqw]">
              <p className="truncate font-display text-[length:6.4cqw] font-bold leading-tight text-foreground">
                {card.displayName}
              </p>
              <p className="flex items-center gap-[1.5cqw] text-[length:3.2cqw] text-muted-foreground">
                <span className="truncate">@{card.handle}</span>
                <span aria-hidden>·</span>
                <span className="flex items-center gap-[1cqw] font-semibold uppercase tracking-wider rarity-text">
                  {rank.tier >= 5 && <Crown className="size-[3.4cqw]" aria-hidden />}
                  {rank.title}
                </span>
              </p>
            </div>

            <dl className="relative mt-auto grid grid-cols-4 gap-[1.5cqw] border-t border-white/10 pt-[3cqw]">
              {(
                [
                  ['REP', card.stats.reputation],
                  ['INF', card.stats.influence],
                  ['ALPHA', card.stats.alpha],
                  ['ENG', card.stats.engagement],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="flex flex-col items-center">
                  <dt className="text-[length:2.5cqw] font-semibold tracking-[0.15em] text-muted-foreground">{label}</dt>
                  <dd className="font-display text-[length:5.4cqw] font-bold tabular-nums text-foreground">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="relative mt-[2.5cqw] flex items-center justify-between text-[length:2.8cqw] font-medium tracking-[0.15em] text-muted-foreground">
              <span className="tabular-nums">{cardNo(card.number)}</span>
              <span className="text-foreground tabular-nums">LV {card.level}</span>
              <span className="uppercase">{card.season}</span>
            </div>

            {meta.effects.holo && <div aria-hidden className="cult-card__holo" />}
            {meta.effects.sheen && <div aria-hidden className="cult-card__sheen" />}
          </div>
          {meta.effects.energy && <div aria-hidden className="cult-card__energy" />}
        </div>

        <div className="cult-card__face cult-card__back cult-card__frame" aria-hidden>
          <div className="cult-card__surface flex flex-col items-center justify-center">
            <div className="absolute inset-0 grid-bg opacity-70" />
            <div className="relative flex aspect-square w-[60cqw] items-center justify-center rounded-full border rarity-border">
              <div className="absolute inset-[6cqw] rounded-full border border-white/10" />
              <div className="absolute inset-[12cqw] rounded-full border rarity-border opacity-60" />
              <span className="font-display text-[length:11cqw] font-bold tracking-[0.12em] metal-text">$CULT</span>
            </div>
            <p className="relative mt-[6cqw] text-[length:3cqw] font-semibold tracking-[0.4em] text-muted-foreground">
              CT IS THE GAME
            </p>
            <p className="relative mt-[2cqw] text-[length:2.8cqw] tracking-[0.2em] rarity-text tabular-nums">
              {cardNo(card.number)} · {card.edition}
            </p>
            {meta.effects.holo && <div className="cult-card__holo" />}
          </div>
        </div>
      </Wrapper>
    </div>
  )
}

function CornerOrnaments({ strong }: { strong: boolean }) {
  const base = cn('pointer-events-none absolute size-[7cqw] border-[var(--r-1)]', strong ? 'opacity-90' : 'opacity-50')
  return (
    <div aria-hidden>
      <span className={cn(base, 'left-[1.5cqw] top-[1.5cqw] rounded-tl-[2cqw] border-l-2 border-t-2')} />
      <span className={cn(base, 'right-[1.5cqw] top-[1.5cqw] rounded-tr-[2cqw] border-r-2 border-t-2')} />
      <span className={cn(base, 'bottom-[1.5cqw] left-[1.5cqw] rounded-bl-[2cqw] border-b-2 border-l-2')} />
      <span className={cn(base, 'bottom-[1.5cqw] right-[1.5cqw] rounded-br-[2cqw] border-b-2 border-r-2')} />
    </div>
  )
}
