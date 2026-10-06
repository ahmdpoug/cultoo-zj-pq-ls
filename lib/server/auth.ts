import { PrivyClient } from '@privy-io/server-auth'
import { HttpError } from './http'

let privy: PrivyClient | null = null

export function getPrivy() {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
  const secret = process.env.PRIVY_APP_SECRET
  if (!appId || !secret) return null
  privy ??= new PrivyClient(appId, secret)
  return privy
}

/** Verifies the Privy access token on the request and returns the Privy user id. */
export async function requireUserId(req: Request): Promise<string> {
  const client = getPrivy()
  if (!client) throw new HttpError(503, 'Login is not configured.')
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) throw new HttpError(401, 'Sign in to continue.')
  try {
    const claims = await client.verifyAuthToken(token)
    return claims.userId
  } catch {
    throw new HttpError(401, 'Session expired. Sign in again.')
  }
}

export interface PrivyIdentity {
  xId: string | null
  xHandle: string | null
  displayName: string | null
  avatarUrl: string | null
  walletAddress: string | null
}

/** Reads the X account and wallet straight from Privy so clients can't spoof them. */
export async function fetchIdentity(userId: string): Promise<PrivyIdentity> {
  const client = getPrivy()
  if (!client) throw new HttpError(503, 'Login is not configured.')
  const user = await client.getUser(userId)
  const embedded = user.linkedAccounts.find(
    (a) => a.type === 'wallet' && 'walletClientType' in a && a.walletClientType === 'privy' && 'chainType' in a && a.chainType === 'ethereum',
  )
  const wallet = (embedded && 'address' in embedded ? embedded.address : null) ?? user.wallet?.address ?? null
  const avatar = user.twitter?.profilePictureUrl ?? null
  return {
    xId: user.twitter?.subject ?? null,
    xHandle: user.twitter?.username ?? null,
    displayName: user.twitter?.name ?? null,
    avatarUrl: avatar ? avatar.replace(/_normal(\.[a-z]+)$/i, '_400x400$1') : null,
    walletAddress: wallet,
  }
}
