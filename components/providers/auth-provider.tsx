'use client'

import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth'
import { CultAuthContext, GUEST_AUTH, type CultAuth } from '@/lib/auth/cult-auth'
import { fullSizeAvatar, registerAuthBridge, type XIdentity } from '@/lib/auth/bridge'
import { syncMainCard } from '@/lib/services'

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID

export function AuthProvider({ children }: { children: ReactNode }) {
  if (!PRIVY_APP_ID) {
    return <CultAuthContext.Provider value={GUEST_AUTH}>{children}</CultAuthContext.Provider>
  }

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['twitter', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#9b6bff',
          landingHeader: 'Enter the CULT',
          loginMessage: 'Connect your X account to strike your CT card.',
          showWalletLoginFirst: false,
          walletChainType: 'ethereum-only',
        },
        embeddedWallets: {
          ethereum: { createOnLogin: 'users-without-wallets' },
        },
      }}
    >
      <PrivyBridge>{children}</PrivyBridge>
    </PrivyProvider>
  )
}

function PrivyBridge({ children }: { children: ReactNode }) {
  const { ready, authenticated, user, login, logout, linkTwitter, getAccessToken } = usePrivy()
  const { wallets } = useWallets()
  const syncedFor = useRef<string | null>(null)

  const twitter = user?.twitter
  const x: XIdentity | null = useMemo(
    () =>
      twitter?.username
        ? { username: twitter.username, name: twitter.name, avatarUrl: fullSizeAvatar(twitter.profilePictureUrl), subject: twitter.subject }
        : null,
    [twitter?.username, twitter?.name, twitter?.profilePictureUrl, twitter?.subject],
  )

  const walletAddress = wallets.find((w) => w.walletClientType === 'privy')?.address ?? wallets[0]?.address ?? user?.wallet?.address ?? null
  const privyId = authenticated ? (user?.id ?? null) : null

  useEffect(() => {
    registerAuthBridge({ getAccessToken, getXIdentity: () => x })
  }, [getAccessToken, x])

  const xUsername = authenticated ? x?.username : undefined
  useEffect(() => {
    if (!ready || !xUsername || syncedFor.current === xUsername) return
    syncedFor.current = xUsername
    void syncMainCard().catch(() => {})
  }, [ready, xUsername, privyId])

  const value: CultAuth = useMemo(
    () => ({
      configured: true,
      ready,
      authenticated,
      privyId,
      x,
      walletAddress: authenticated ? walletAddress : null,
      login: () => login(),
      logout,
      linkX: () => linkTwitter(),
    }),
    [ready, authenticated, privyId, x, walletAddress, login, logout, linkTwitter],
  )

  return <CultAuthContext.Provider value={value}>{children}</CultAuthContext.Provider>
}
