export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'

export type Archetype = 'trader' | 'builder' | 'meme' | 'alpha' | 'og' | 'researcher'

export interface CardStats {
  ctScore: number
  reputation: number
  influence: number
  engagement: number
  consistency: number
  alpha: number
}

export interface XProfile {
  handle: string
  displayName: string
  followers: number
  following: number
  accountAgeYears: number
  ctActivity: number
  engagement: number
  influence: number
  alpha: number
  archetype: Archetype
  avatarUrl?: string | null
  verified?: boolean
  xId?: string
  /** `x` = live X API metrics, `generated` = deterministic estimate. */
  source?: 'x' | 'generated'
}

export interface CultCard {
  id: string
  number: number
  handle: string
  displayName: string
  archetype: Archetype
  rarity: Rarity
  level: number
  xp: number
  stats: CardStats
  followers: number
  following: number
  accountAgeYears: number
  wins: number
  losses: number
  season: string
  edition: string
  owner: string
  minted: boolean
  createdAt: number
  avatarUrl?: string | null
  verified?: boolean
  liveData?: boolean
}

export interface BattleRound {
  stat: keyof CardStats | 'cultPower'
  label: string
  player: number
  opponent: number
  delta: number
  winner: 'player' | 'opponent'
}

export interface BattleRecord {
  id: string
  playerCardId: string
  opponentHandle: string
  opponentRarity: Rarity
  result: 'victory' | 'defeat'
  xp: number
  reward: number
  rounds: BattleRound[]
  at: number
}

export interface ActivityItem {
  id: string
  type: 'scan' | 'level' | 'battle' | 'forge' | 'mint' | 'buy' | 'tournament' | 'quest' | 'share'
  label: string
  at: number
}

export interface Listing {
  id: string
  card: CultCard
  seller: string
  price: number
  listedAt: number
}

export interface Tournament {
  id: string
  name: string
  tagline: string
  players: number
  maxPlayers: number
  entry: number
  prize: number
  startsInHours: number
  status: 'live' | 'registering' | 'upcoming' | 'completed'
  minRarity: Rarity
}

export interface Guild {
  id: string
  name: string
  tag: string
  motto: string
  archetype: Archetype
  members: number
  xp: number
  rank: number
  wins: number
  seasonPoints: number
  leader: string
}

export interface GuildView extends Guild {
  memberHandles: string[]
  leaderCtScore: number | null
}

export interface Quest {
  id: string
  title: string
  target: number
  xp: number
  action: QuestAction
}

export type QuestAction = 'scan' | 'win' | 'upgrade' | 'tournament' | 'share' | 'battle'

export interface Achievement {
  id: string
  title: string
  description: string
  tier: Rarity
}

export interface LeaderboardEntry {
  rank: number
  handle: string
  displayName: string
  avatarUrl?: string | null
  archetype: Archetype
  rarity: Rarity
  cultPower: number
  ctScore: number
  wins: number
  losses: number
  seasonPoints: number
  cardNumber: number
}

export interface TxReceipt {
  hash: string
  at: number
  explorerUrl: string | null
}

export interface GameState {
  version: 2
  mainCardId: string | null
  cards: CultCard[]
  wallet: { address: string | null }
  economy: { balance: number; pendingCult: number; fragments: number; materials: number; seasonXp: number }
  battles: BattleRecord[]
  achievements: string[]
  quests: Record<string, number>
  claimedQuests: string[]
  tournaments: string[]
  guildId: string | null
  listings: { id: string; cardId: string; price: number }[]
  rewardedBattlesToday: number
  activity: ActivityItem[]
}

export interface SeasonInfo {
  id: string
  name: string
  label: string
  endsAt: number
  qualifyTop: number
  players: number
  prizePool: number
}

export interface ChainInfo {
  configured: boolean
  chainId: number | null
  chainName: string | null
  tokenAddress: string | null
  treasury: string | null
  symbol: string
  decimals: number
  explorer: string | null
}
