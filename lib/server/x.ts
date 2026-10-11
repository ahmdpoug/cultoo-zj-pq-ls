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
  if (!bearer) throw new XLookupError('X API is not configured. Add X_BEARER_TOKEN to enable live profile lookups.', 503)

  const profile = mapXUser(await fromXApi(handle, bearer))

  if (profileCache.size > 500) profileCache.clear()
  profileCache.set(key, { at: Date.now(), profile })
  return profile
}
