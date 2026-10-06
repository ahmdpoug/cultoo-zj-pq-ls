import type { Metadata } from 'next'
import { PageHeader } from '@/components/ui-kit/primitives'
import { MarketBrowser } from '@/components/marketplace/market-browser'

export const metadata: Metadata = { title: 'Cult Market' }

export default function MarketPage() {
  return (
    <>
      <PageHeader eyebrow="Sector 04" title="Cult Market" subtitle="Trade cards across the cult. Every listing is a living record of reputation, level and battle history." />
      <MarketBrowser />
    </>
  )
}
