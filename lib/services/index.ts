import { mutate } from 'swr'
import type { BattleRecord, ChainInfo, CultCard, Listing, MarketPurchase, TxReceipt, XProfile } from '@/lib/types'
import { authBridge } from '@/lib/auth/bridge'
import { LISTING_FEE, UPGRADE_COST } from '@/lib/game/config'
import { apiFetch, ApiError, STATE_KEY } from './api'
import { InsufficientBalanceError, type CultServices } from './types'
import { xSocial, XLookupError } from './x-social'

/**
 * Every game action is a server call scoped to the signed-in Privy user, then
 * the cached game state is revalidated. Nothing is simulated on the client.
 */
async function action<T>(payload: Record<string, unknown>): Promise<T> {
  try {
    const result = await apiFetch<T>('/api/game/action', { method: 'POST', body: JSON.stringify(payload) })
    await mutate(STATE_KEY)
    return result
  } catch (err) {
    if (err instanceof ApiError && err.status === 402) throw new InsufficientBalanceError(0)
    throw err
  }
}

export const services: CultServices = {
  social: xSocial,

  wallet: {
    async connect() {
      return ''
    },
    async disconnect() {},
  },

  token: {
    balanceOf() {
      return 0
    },
    async spend() {
      throw new Error('$CULT spending runs through the game actions.')
    },
  },

  onboarding: {
    async createPlayer(handle) {
      try {
        return await action<{ card: CultCard; profile: XProfile }>({ action: 'scan', handle })
      } catch (err) {
        if (err instanceof ApiError && (err.status === 404 || err.status === 400)) throw new XLookupError(err.message)
        throw err
      }
    },
  },

  nft: {
    async mint(cardId) {
      return action<TxReceipt>({ action: 'mint', cardId })
    },
  },

  marketplace: {
    async buy(listing) {
      const chain = await apiFetch<ChainInfo>('/api/game/chain').catch(() => null)
      let txHash: string | undefined
      if (chain?.configured && chain.treasury) {
        if (!listing.payTo) throw new Error('This seller has no wallet connected, so the card cannot be bought on-chain.')
        txHash = await authBridge.sendCultTransfer(listing.payTo, listing.price)
      }
      return action<MarketPurchase>({ action: 'buy', listingId: listing.id, txHash })
    },
    async list(cardId, price) {
      const chain = await apiFetch<ChainInfo>('/api/game/chain').catch(() => null)
      const txHash =
        chain?.configured && chain.treasury ? await authBridge.sendCultTransfer(chain.treasury, LISTING_FEE) : undefined
      return action<{ listing: Listing; receipt: TxReceipt }>({ action: 'list', cardId, price, txHash })
    },
    async delist(listingId) {
      return action<{ ok: boolean }>({ action: 'delist', listingId })
    },
  },

  forge: {
    async forge(cardIds, cost) {
      const chain = await apiFetch<ChainInfo>('/api/game/chain').catch(() => null)
      const txHash = chain?.configured && chain.treasury ? await authBridge.sendCultTransfer(chain.treasury, cost) : undefined
      return action<{ receipt: TxReceipt; card: CultCard }>({ action: 'forge', cardIds, txHash })
    },
    async upgrade(cardId) {
      const chain = await apiFetch<ChainInfo>('/api/game/chain').catch(() => null)
      const txHash =
        chain?.configured && chain.treasury ? await authBridge.sendCultTransfer(chain.treasury, UPGRADE_COST.cult) : undefined
      return action<{ receipt: TxReceipt; levelsGained: number }>({ action: 'upgrade', cardId, txHash })
    },
  },

  arena: {
    async battle(cardId, opponent) {
      return action<BattleRecord & { levelsGained: number }>({ action: 'battle', cardId, opponentCardId: opponent.id })
    },
  },

  tournament: {
    async enter(tournamentId, entry) {
      const chain = await apiFetch<ChainInfo>('/api/game/chain').catch(() => null)
      const txHash = chain?.configured && chain.treasury ? await authBridge.sendCultTransfer(chain.treasury, entry) : undefined
      return action<TxReceipt>({ action: 'tournament', tournamentId, txHash })
    },
  },
}

export function claimQuest(questId: string) {
  return action<{ ok: boolean }>({ action: 'quest', questId })
}

export function setMainCard(cardId: string) {
  return action<{ ok: boolean }>({ action: 'main-card', cardId })
}

export function resetPlayer() {
  return action<{ ok: boolean }>({ action: 'reset' })
}

export function syncMainCard() {
  return action<{ synced: boolean }>({ action: 'sync' })
}

export function recordShare() {
  return action<{ ok: boolean }>({ action: 'share' })
}

export { InsufficientBalanceError } from './types'
export { XLookupError } from './x-social'
export { UPGRADE_COST } from '@/lib/game/config'
