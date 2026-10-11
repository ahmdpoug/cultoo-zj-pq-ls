import type { XProfile } from '@/lib/types'
import { mapXUser, type XApiUser } from '@/lib/x/map-profile'
import { HttpError } from './http'

const USER_FIELDS = 'created_at,description,profile_image_url,public_metrics,verified,verified_type'

export class XLookupError extends HttpError {
  constructor(message: string, status: number) {
    super(status, message)
  }
}

async function fromPublicLookup(handle: string): Promise<XApiUser> {
  const res = await fetch(`https://api.fxtwitter.com/user/by/username/${encodeURIComponent(handle)}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 3600 },
  })
  const body = (await res.json().catch(() => null)) as {
    code?: number
    message?: string
    user?: {
      id?: string
      name?: string
      screen_name?: string
      description?: string
      avatar_url?: string
      created_at?: string
      verified?: boolean
      followers_count?: number
      following_count?: number
      tweets_count?: number
      listed_count?: number
      likes_count?: number
    }
  } | null
  const user = body?.user
  if (!res.ok || !user?.id || !user.screen_name) {
    if (res.status === 404 || body?.code === 404) throw new XLookupError(`@${handle} doesn't exist on X.`, 404)
    throw new XLookupError('Could not connect to the public X lookup service. Try again shortly.', 502)
  }
  return {
    id: user.id,
    name: user.name || user.screen_name,
    username: user.screen_name,
    description: user.description,
    profile_image_url: user.avatar_url,
    created_at: user.created_at,
    verified: user.verified,
    public_metrics: {
      followers_count: user.followers_count ?? 0,
      following_count: user.following_count ?? 0,
      tweet_count: user.tweets_count ?? 0,
      listed_count: user.listed_count,
      like_count: user.likes_count,
    },
  }
}

async function fromXApi(handle: string, bearer: string): Promise<XApiUser> {
  try {
    const res = await fetch(`https://api.x.com/2/users/by/username/${encodeURIComponent(handle)}?user.fields=${USER_FIELDS}`, {
      headers: { Authorization: `Bearer ${bearer}` },
      next: { revalidate: 3600 },
    })
    if (res.status === 401 || res.status === 403) {
      throw new XLookupError('X API access was rejected. Check the X_BEARER_TOKEN configuration.', 502)
    }
    if (res.status === 429) throw new XLookupError('X rate limit reached. Try again shortly.', 429)
    const body = (await res.json().catch(() => null)) as { data?: XApiUser; errors?: { title?: string }[] } | null
    if (res.ok && body?.data) return body.data
    const notFound = res.status === 404 || body?.errors?.some((e) => e.title === 'Not Found Error')
    throw new XLookupError(notFound ? `@${handle} doesn't exist on X.` : 'X API request failed.', notFound ? 404 : 502)
  } catch (error) {
    if (error instanceof XLookupError) throw error
    throw new XLookupError('Could not connect to the X API. Try again shortly.', 502)
  }
}

const PROFILE_TTL_MS = 10 * 60 * 1000
const profileCache = new Map<string, { at: number; profile: XProfile }>()

/** Resolves a real X profile through the official X API. */
export async function lookupXProfile(handle: string): Promise<XProfile> {
  const key = handle.toLowerCase()
  const cached = profileCache.get(key)
  if (cached && Date.now() - cached.at < PROFILE_TTL_MS) return cached.profile

  const bearer = process.env.X_BEARER_TOKEN
  const profile = mapXUser(bearer ? await fromXApi(handle, bearer) : await fromPublicLookup(handle))

  if (profileCache.size > 500) profileCache.clear()
  profileCache.set(key, { at: Date.now(), profile })
  return profile
}
