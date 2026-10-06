'use client'

import { PageHeader } from '@/components/ui-kit/primitives'
import { PlayerGate } from '@/components/cards/player-gate'
import { Forge } from '@/components/forge/forge'

export default function ForgePage() {
  return (
    <>
      <PageHeader eyebrow="Sector 03" title="The Forge" subtitle="Turn cards into legends. Combine three of a kind to strike one of a higher tier." />
      <PlayerGate message="The Forge needs cards to burn. Scan your CT to receive a starter inventory.">{() => <Forge />}</PlayerGate>
    </>
  )
}
