import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getListingById } from '@/lib/server/game'
import { ListingDetail } from '@/components/marketplace/listing-detail'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const listing = await getListingById(id)
  return { title: listing ? `@${listing.card.handle} — Cult Market` : 'Listing not found' }
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const listing = await getListingById(id)
  if (!listing) notFound()
  return <ListingDetail listing={listing} />
}
