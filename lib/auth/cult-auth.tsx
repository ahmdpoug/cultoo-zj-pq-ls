'use client'

import { createContext, useContext } from 'react'
import type { XIdentity } from './bridge'

export interface CultAuth {
  /** False when NEXT_PUBLIC_PRIVY_APP_ID is not set. */
  configured: boolean
  ready: boolean
  authenticated: boolean
  privyId: string | null
  x: XIdentity | null
  walletAddress: string | null
  login: () => void
  logout: () => Promise<void>
  linkX: () => void
}

const noop = () => {}

export const GUEST_AUTH: CultAuth = {
  configured: false,
  ready: true,
  authenticated: false,
  privyId: null,
  x: null,
  walletAddress: null,
  login: noop,
  logout: async () => {},
  linkX: noop,
}

export const CultAuthContext = createContext<CultAuth>(GUEST_AUTH)

export function useCultAuth() {
  return useContext(CultAuthContext)
}
