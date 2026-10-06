/**
 * Public $CULT token details. These are public on-chain values, safe to ship to
 * the browser. Server-side code may override the address/chain via env vars.
 */
export const CULT_TOKEN_ADDRESS = '0xd1a6379192eFf4C6A7D498Ab6A5491cE3887FA0B'
export const CULT_CHAIN_ID = 46630
export const CULT_CHAIN_NAME = 'Robinhood Chain Testnet'
export const CULT_EXPLORER_URL = 'https://explorer.testnet.chain.robinhood.com'
export const CULT_TOKEN_URL = `https://testnet.vibevibe.fun/token/${CULT_TOKEN_ADDRESS}`
export const CULT_BUY_URL = `${CULT_TOKEN_URL}?side=buy`

export function shortAddress(address: string, lead = 6, tail = 4) {
  return address.length > lead + tail + 1 ? `${address.slice(0, lead)}…${address.slice(-tail)}` : address
}
