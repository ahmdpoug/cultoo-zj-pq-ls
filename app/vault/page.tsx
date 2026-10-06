'use client'

import { PageHeader } from '@/components/ui-kit/primitives'
import { PlayerGate } from '@/components/cards/player-gate'
import { EconomyDashboard } from '@/components/economy/economy-dashboard'

export default function VaultPage() {
  return (
    <>
      <PageHeader eyebrow="Sector 05 · The Vault" title="Cult Economy" subtitle="Your balance, materials and daily quests, tracked in the CULT database." />
      <PlayerGate>{() => <EconomyDashboard />}</PlayerGate>
    </>
  )
}
