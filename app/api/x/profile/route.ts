import { NextResponse, type NextRequest } from 'next/server'
import { getPrivy } from '@/lib/server/auth'
import { lookupXProfile, XLookupError } from '@/lib/server/x'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get('handle')?.trim().replace(/^@+/, '') ?? ''
  if (!/^[A-Za-z0-9_]{1,15}$/.test(handle)) {
    return NextResponse.json({ error: 'Invalid X username.' }, { status: 400 })
  }

  const client = getPrivy()
  if (!client) return NextResponse.json({ error: 'Login is not configured.' }, { status: 503 })

  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ error: 'Sign in to scan live X profiles.' }, { status: 401 })
  try {
    await client.verifyAuthToken(token)
  } catch {
    return NextResponse.json({ error: 'Session expired. Sign in again.' }, { status: 401 })
  }

  try {
    return NextResponse.json({ profile: await lookupXProfile(handle) })
  } catch (err) {
    const status = err instanceof XLookupError ? err.status : 502
    const message = err instanceof XLookupError ? err.message : 'Could not reach X right now.'
    return NextResponse.json({ error: message }, { status })
  }
}
