import type { Metadata } from 'next'
import { PageHeader } from '@/components/ui-kit/primitives'
import { GuildHall } from '@/components/guilds/guild-hall'

export const metadata: Metadata = { title: 'Guilds — The Sanctum' }

export default function GuildsPage() {
  return (
    <>
      <PageHeader eyebrow="Sector 06 · The Sanctum" title="Guilds" subtitle="Four orders compete for season points. Guild XP is the sum of every member's battles, forges and tournaments." />
      <GuildHall />
    </>
  )
}
