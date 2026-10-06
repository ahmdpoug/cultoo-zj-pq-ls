import { NextResponse } from 'next/server'
import { chainInfo } from '@/lib/server/chain'
import { errorResponse } from '@/lib/server/http'

export const dynamic = 'force-dynamic'

/** Public on-chain config the client needs to build a $CULT payment. */
export async function GET() {
  try {
    return NextResponse.json(await chainInfo(), {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  } catch (err) {
    return errorResponse(err)
  }
}
