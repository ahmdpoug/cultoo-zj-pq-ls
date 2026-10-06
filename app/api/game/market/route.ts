import { NextResponse } from 'next/server'
import { getActiveListings } from '@/lib/server/game'
import { errorResponse } from '@/lib/server/http'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json(await getActiveListings())
  } catch (err) {
    return errorResponse(err)
  }
}
