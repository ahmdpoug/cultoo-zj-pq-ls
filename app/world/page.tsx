import type { Metadata } from 'next'
import { PageHeader } from '@/components/ui-kit/primitives'
import { WorldMap } from '@/components/world/world-map'

export const metadata: Metadata = { title: 'Cult World' }

export default function WorldPage() {
  return (
    <>
      <PageHeader eyebrow="Explore" title="Cult World" subtitle="Eight destinations. One ascent. Choose where your card goes next." />
      <WorldMap />
    </>
  )
}
