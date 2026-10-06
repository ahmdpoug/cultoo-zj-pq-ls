import type { XProfile } from '@/lib/types'
import { mapXUser, type XApiUser } from '@/lib/x/map-profile'
import { HttpError } from './http'

const USER_FIELDS = 'created_at,description,profile_image_url,public_metrics,verified,verified_type'

export class XLookupError extends HttpError {
  constructor(message: string, status: number) {
    super(status, message)
  }
}

async function fromXApi(handle: string, bearer: string): Promise<XApiUser> {
  const res = await fetch(`https://api.x.com/2/users/by/username/${handle}?user.fields=${USER_FIELDS}`, {
    headers: { Authorization: `Bearer ${bearer}` },
    next: { revalidate: 3600 },
  })
  if (res.status === 429) throw new XLookupError('X rate limit reached. Try again shortly.', 429)
  const body = (await res.json().catch(() => null)) as { data?: XApiUser; errors?: { title?: string }[] } | null
  if (res.ok && body?.data) return body.data
  const notFound = res.status === 404 || body?.errors?.some((e) => e.title === 'Not Found Error')
  throw new XLookupError(notFound ? `@${handle} doesn't exist on X.` : 'X API request failed.', notFound ? 404 : 502)
}

interface FxUser {
  id: string
  screen_name: string
  name: string
  description?: string
  avatar_url?: string
  followers: number
  following: number
  tweets: number
  likes: number
  joined?: string
  protected?: boolean
  verification?: { verified?: boolean; type?: string | null }
}

/** Public, key-less mirror of X profile data (api.fxtwitter.com). */
async function fromFxTwitter(handle: string): Promise<XApiUser> {
  const res = await fetch(`https://api.fxtwitter.com/${handle}`, {
    redirect: 'manual',
    headers: { 'User-Agent': 'CultCards/1.0' },
    next: { revalidate: 900 },
  })
  const body = (await res.json().catch(() => null)) as { code?: number; user?: FxUser } | null
  if (!res.ok || body?.code !== 200 || !body.user) {
    const notFound = res.status === 404 || res.status === 302 || body?.code === 404
    throw new XLookupError(notFound ? `@${handle} doesn't exist on X.` : 'Could not reach X right now.', notFound ? 404 : 502)
  }
  const u = body.user
  return {
    id: u.id,
    name: u.name,
    username: u.screen_name,
    created_at: u.joined ? new Date(u.joined).toISOString() : undefined,
    description: u.description,
    profile_image_url: u.avatar_url,
    verified: Boolean(u.verification?.verified),
    verified_type: u.verification?.type ?? undefined,
    public_metrics: {
      followers_count: u.followers,
      following_count: u.following,
      tweet_count: u.tweets,
      like_count: u.likes,
    },
  }
}

/**
 * Resolves a real X profile. Uses the official X API when `X_BEARER_TOKEN` is
 * configured, otherwise the public fxtwitter mirror. Never fabricates data —
 * a failed lookup throws `XLookupError`.
 */
export async function lookupXProfile(handle: string): Promise<XProfile> {
  const bearer = process.env.X_BEARER_TOKEN
  const user = bearer ? await fromXApi(handle, bearer).catch(() => fromFxTwitter(handle)) : await fromFxTwitter(handle)
  return mapXUser(user)
}
