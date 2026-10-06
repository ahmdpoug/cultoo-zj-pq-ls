import { NextResponse, type NextRequest } from 'next/server'
import { requireUserId } from '@/lib/server/auth'
import { getLeaderboard, getPlayerRank, getSeason } from '@/lib/server/game'
import { errorResponse } from '@/lib/server/http'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const [entries, season] = await Promise.all([getLeaderboard(), getSeason()])
    let myRank: number | null = null
    if (req.headers.get('authorization')) {
      try {
        myRank = await getPlayerRank(await requireUserId(req))
      } catch {
        myRank = null
      }
    }
    return NextResponse.json({ entries, season, myRank })
  } catch (err) {
    return errorResponse(err)
  }
}
