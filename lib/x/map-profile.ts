import type { Archetype, XProfile } from '@/lib/types'
import { createRng } from '@/lib/game/rng'
import { fullSizeAvatar } from '@/lib/auth/bridge'

export interface XApiUser {
  id: string
  name: string
  username: string
  created_at?: string
  description?: string
  profile_image_url?: string
  verified?: boolean
  verified_type?: string
  public_metrics?: {
    followers_count: number
    following_count: number
    tweet_count: number
    listed_count?: number
    like_count?: number
  }
}

const clamp = (v: number) => Math.max(1, Math.min(99, Math.round(v)))

const ARCHETYPE_KEYWORDS: [Archetype, RegExp][] = [
  ['builder', /\b(build|builder|dev|engineer|founder|solidity|rust|protocol|shipping|cto)\b/i],
  ['trader', /\b(trad(e|er|ing)|perps?|charts?|ta|futures|scalp|swing|pnl)\b/i],
  ['researcher', /\b(research|analyst|data|thesis|on-?chain|writer|investor)\b/i],
  ['alpha', /\b(alpha|airdrops?|gems?|calls|early|farm(ing|er)?)\b/i],
  ['meme', /\b(memes?|shitpost(er|ing)?|degen|lol|vibes|jpegs?|nfa)\b/i],
  ['og', /\b(og|since 20(1\d)|bitcoin|btc|cypherpunk)\b/i],
]

const CT_SIGNAL = /\b(crypto|web3|defi|eth|btc|sol|onchain|nft|dao|L2|base|zk|token|degen|alpha)\b/gi

/** Derives card attributes from real X API v2 public metrics. */
export function mapXUser(u: XApiUser): XProfile {
  const m = u.public_metrics ?? { followers_count: 0, following_count: 0, tweet_count: 0, listed_count: 0, like_count: 0 }
  const bio = u.description ?? ''
  const rng = createRng(`${u.username.toLowerCase()}:x`)

  const created = u.created_at ? new Date(u.created_at).getTime() : Date.now()
  const ageDays = Math.max(1, (Date.now() - created) / 86_400_000)
  const accountAgeYears = Math.round((ageDays / 365.25) * 10) / 10

  const postsPerDay = m.tweet_count / ageDays
  const ctActivity = clamp(40 + Math.log10(postsPerDay * 100 + 1) * 18)
  const influence = clamp(38 + Math.log10(m.followers_count + 1) * 10 + (u.verified ? 3 : 0))
  const likesPerPost = (m.like_count ?? 0) / Math.max(1, m.tweet_count)
  // List membership isn't exposed by every source; ~1 list per 150 followers is a typical ratio.
  const listed = m.listed_count ?? Math.round(m.followers_count / 150)
  const engagement = clamp(44 + Math.log10(listed + 1) * 11 + Math.min(8, likesPerPost * 2) + rng.int(0, 4))
  const ctHits = bio.match(CT_SIGNAL)?.length ?? 0
  const alpha = clamp(48 + ctHits * 5 + Math.log10(listed + 1) * 5 + rng.int(0, 12))

  const keyword = ARCHETYPE_KEYWORDS.find(([, re]) => re.test(bio))?.[0]
  const archetype: Archetype = accountAgeYears >= 11 && !keyword ? 'og' : (keyword ?? rng.pick(['trader', 'builder', 'meme', 'alpha', 'og', 'researcher'] as const))

  return {
    handle: u.username,
    displayName: u.name || u.username,
    followers: m.followers_count,
    following: m.following_count,
    accountAgeYears,
    ctActivity,
    engagement,
    influence,
    alpha,
    archetype,
    avatarUrl: fullSizeAvatar(u.profile_image_url),
    verified: Boolean(u.verified),
    xId: u.id,
    source: 'x',
  }
}
