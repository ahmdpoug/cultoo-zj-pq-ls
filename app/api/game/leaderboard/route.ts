import { NextResponse, type NextRequest } from 'next/server'
import { requireUserId } from '@/lib/server/auth'
import { getLeaderboard, getPlayerRank, getSeason } from '@/lib/server/game'
import { errorResponse } from '@/lib/server/http'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const [entries, season] = await Promise.all([getLeaderboard(), getSeason()])
    if (!req.headers.get('authorization')) {
      return NextResponse.json(
        { entries, season, myRank: null },
        { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120', Vary: 'Authorization' } },
      )
    }
    let myRank: number | null = null
    try {
      myRank = await getPlayerRank(await requireUserId(req))
    } catch {
      myRank = null
    }
    return NextResponse.json({ entries, season, myRank }, { headers: { 'Cache-Control': 'private, no-store', Vary: 'Authorization' } })
  } catch (err) {
    return errorResponse(err)
  }
}
