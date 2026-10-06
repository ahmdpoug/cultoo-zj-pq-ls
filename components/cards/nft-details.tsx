import type { CultCard } from '@/lib/types'
import { RarityBadge } from '@/components/ui-kit/primitives'
import { cardNo } from '@/lib/game/format'
import { cn } from '@/lib/utils'

export function NftDetails({ card, className }: { card: CultCard; className?: string }) {
  const rows: [string, React.ReactNode][] = [
    ['Card ID', cardNo(card.number)],
    ['Owner', `@${card.owner}`],
    ['Rarity', <RarityBadge key="r" rarity={card.rarity} />],
    ['Season', `${card.season} Season`],
    ['Edition', card.edition],
    ['Level', card.level],
    ['Wins', card.wins],
    ['Losses', card.losses],
    [
      'Mint Status',
      <span key="m" className={cn('font-semibold', card.minted ? 'text-success' : 'text-muted-foreground')}>
        {card.minted ? 'Minted' : 'Not minted'}
      </span>,
    ],
  ]
  return (
    <dl className={cn('divide-y divide-white/[0.06] text-sm', className)}>
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-center justify-between gap-4 py-2.5">
          <dt className="text-muted-foreground">{k}</dt>
          <dd className="font-medium tabular-nums text-foreground">{v}</dd>
        </div>
      ))}
    </dl>
  )
}
