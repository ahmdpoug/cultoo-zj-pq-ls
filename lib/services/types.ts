import type { BattleRecord, CultCard, Listing, MarketPurchase, Rarity, TxReceipt, XProfile } from '@/lib/types'

/**
 * Contracts for every external capability. The UI only talks to these interfaces,
 * implemented against the CULT API in `lib/services/index.ts`.
 */

export interface SocialService {
  /** Fetch a live X profile via the X API v2 route handler. */
  getProfile(handle: string): Promise<XProfile>
  /** Build a share URL for X's web intent (free, no API key required). */
  shareUrl(text: string, url?: string): string
}

export interface WalletService {
  connect(): Promise<string>
  disconnect(): Promise<void>
}

export interface TokenService {
  /** $CULT is the in-game utility currency. */
  balanceOf(address: string | null): number
  spend(amount: number, reason: string): Promise<TxReceipt>
}

export interface NFTService {
  mint(cardId: string): Promise<TxReceipt>
}

export interface MarketplaceService {
  buy(listing: Listing): Promise<MarketPurchase>
  list(cardId: string, price: number): Promise<{ listing: Listing; receipt: TxReceipt }>
  delist(listingId: string): Promise<{ ok: boolean }>
}

export interface ForgeService {
  forge(cardIds: string[], cost: number): Promise<{ receipt: TxReceipt; card: CultCard }>
  upgrade(cardId: string): Promise<{ receipt: TxReceipt; levelsGained: number }>
}

export interface ArenaService {
  battle(playerCardId: string, opponent: CultCard): Promise<BattleRecord & { levelsGained: number }>
}

export interface TournamentService {
  enter(tournamentId: string, entry: number): Promise<TxReceipt>
}

export interface OnboardingService {
  createPlayer(handle: string): Promise<{ card: CultCard; profile: XProfile }>
}

export interface CultServices {
  social: SocialService
  wallet: WalletService
  token: TokenService
  nft: NFTService
  marketplace: MarketplaceService
  forge: ForgeService
  arena: ArenaService
  tournament: TournamentService
  onboarding: OnboardingService
}

export class InsufficientBalanceError extends Error {
  constructor(public needed: number) {
    super(`Insufficient $CULT balance. ${needed} required.`)
  }
}

export type ForgeRecipe = { input: Rarity; count: number; output: Rarity }
