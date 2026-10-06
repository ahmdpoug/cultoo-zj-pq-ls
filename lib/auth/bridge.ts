export interface XIdentity {
  username: string
  name: string | null
  avatarUrl: string | null
  subject: string
}

/**
 * Lets plain (non-React) service modules reach the live Privy session.
 * The Privy bridge component registers these on mount.
 */
export const authBridge = {
  getAccessToken: async (): Promise<string | null> => null,
  getXIdentity: (): XIdentity | null => null,
  /** Sends $CULT from the signed-in user's wallet and resolves with the tx hash. */
  sendCultTransfer: async (_to: string, _amount: number): Promise<string> => {
    throw new Error('Your wallet is not ready yet. Try again in a moment.')
  },
}

export function registerAuthBridge(next: Partial<typeof authBridge>) {
  Object.assign(authBridge, next)
}

/** X returns `_normal` (48px) avatars; request the 400px variant instead. */
export function fullSizeAvatar(url: string | null | undefined) {
  return url ? url.replace(/_normal(\.[a-z]+)$/i, '_400x400$1') : null
}
