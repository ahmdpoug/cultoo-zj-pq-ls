'use client'

import { PageHeader } from '@/components/ui-kit/primitives'
import { PlayerGate } from '@/components/cards/player-gate'
import { MyCardDashboard } from '@/components/my-card/my-card-dashboard'

export default function MyCardPage() {
  return (
    <>
      <PageHeader eyebrow="Identity" title="My Card" subtitle="Your reputation, forged into stats. Level it up, battle it, mint it." />
      <PlayerGate>{(card) => <MyCardDashboard card={card} />}</PlayerGate>
    </>
  )
}
