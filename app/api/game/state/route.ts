import { NextResponse, type NextRequest } from 'next/server'
import { requireUserId } from '@/lib/server/auth'
import { getOrCreatePlayer, loadGameState } from '@/lib/server/game'
import { errorResponse } from '@/lib/server/http'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const userId = await requireUserId(req)
    await getOrCreatePlayer(userId)
    return NextResponse.json(await loadGameState(userId))
  } catch (err) {
    return errorResponse(err)
  }
}
