import { authBridge } from '@/lib/auth/bridge'

export const STATE_KEY = '/api/game/state'

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

/** Fetch wrapper that attaches the Privy access token and normalizes errors. */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await authBridge.getAccessToken().catch(() => null)
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  })
  const body = (await res.json().catch(() => ({}))) as { error?: string }
  if (!res.ok) throw new ApiError(body.error ?? 'Request failed.', res.status)
  return body as T
}
