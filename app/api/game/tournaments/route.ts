import { NextResponse } from 'next/server'
import { getTournaments } from '@/lib/server/game'
import { errorResponse } from '@/lib/server/http'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json(await getTournaments())
  } catch (err) {
    return errorResponse(err)
  }
}
