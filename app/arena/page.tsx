'use client'

import { PageHeader } from '@/components/ui-kit/primitives'
import { PlayerGate } from '@/components/cards/player-gate'
import { Arena } from '@/components/arena/arena'

export default function ArenaPage() {
  return (
    <>
      <PageHeader eyebrow="Sector 02" title="The Arena" subtitle="Select your card. Challenge another. Three rounds of stats decide who walks out." />
      <PlayerGate message="You need a card to fight. Scan your CT to strike one.">{(card) => <Arena mainCard={card} />}</PlayerGate>
    </>
  )
}
