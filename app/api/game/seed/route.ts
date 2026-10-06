import { NextResponse } from 'next/server'
import { seedSystemCards } from '@/lib/server/game'
import { errorResponse } from '@/lib/server/http'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** Idempotent: seeds the house card pool from real X profiles once. */
export async function POST() {
  try {
    return NextResponse.json(await seedSystemCards())
  } catch (err) {
    return errorResponse(err)
  }
}
