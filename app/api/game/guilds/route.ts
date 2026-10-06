import { NextResponse } from 'next/server'
import { getGuilds } from '@/lib/server/game'
import { errorResponse } from '@/lib/server/http'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json(await getGuilds())
  } catch (err) {
    return errorResponse(err)
  }
}
