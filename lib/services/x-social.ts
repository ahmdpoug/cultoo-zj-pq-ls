import type { XProfile } from '@/lib/types'
import { authBridge } from '@/lib/auth/bridge'
import { normalizeHandle } from '@/lib/game/scoring'
import type { SocialService } from './types'

export class XLookupError extends Error {}

/**
 * Live X profiles via `/api/x/profile` (X API v2, gated by the Privy session).
 * No fabricated fallback — a failed lookup surfaces as `XLookupError`.
 */
export const xSocial: SocialService = {
  async getProfile(raw) {
    const handle = normalizeHandle(raw)
    const token = await authBridge.getAccessToken().catch(() => null)
    if (!token) throw new XLookupError('Sign in to scan live X profiles.')

    const res = await fetch(`/api/x/profile?handle=${encodeURIComponent(handle)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) return ((await res.json()) as { profile: XProfile }).profile
    const { error } = (await res.json().catch(() => ({}))) as { error?: string }
    throw new XLookupError(error ?? `@${handle} doesn't exist on X.`)
  },

  shareUrl(text, url) {
    const params = new URLSearchParams({ text })
    if (url) params.set('url', url)
    return `https://x.com/intent/post?${params.toString()}`
  },
}
