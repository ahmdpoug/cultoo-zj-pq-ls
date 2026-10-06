import { arbitrum, avalanche, base, baseSepolia, bsc, mainnet, optimism, polygon, sepolia, type Chain } from 'viem/chains'
import { defineChain } from 'viem'

/** Robinhood Chain testnet — an Arbitrum Orbit L2 where $CULT is deployed. */
export const robinhoodTestnet = defineChain({
  id: 46630,
  name: 'Robinhood Chain Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.testnet.chain.robinhood.com'] } },
  blockExplorers: {
    default: { name: 'Robinhood Chain Explorer', url: 'https://explorer.testnet.chain.robinhood.com' },
  },
  testnet: true,
})

export const SUPPORTED_CHAINS: readonly Chain[] = [
  robinhoodTestnet,
  base,
  baseSepolia,
  mainnet,
  sepolia,
  arbitrum,
  optimism,
  polygon,
  bsc,
  avalanche,
]

export function chainById(id: number | null | undefined): Chain | null {
  return SUPPORTED_CHAINS.find((c) => c.id === id) ?? null
}

export function explorerTxUrl(chain: Chain | null, hash: string) {
  const base = chain?.blockExplorers?.default.url
  return base ? `${base}/tx/${hash}` : null
}
