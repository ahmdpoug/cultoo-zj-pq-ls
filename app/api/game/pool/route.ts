import { NextResponse } from 'next/server'
import { getPool } from '@/lib/server/game'
import { errorResponse } from '@/lib/server/http'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json(await getPool(), {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (err) {
    return errorResponse(err)
  }
}
