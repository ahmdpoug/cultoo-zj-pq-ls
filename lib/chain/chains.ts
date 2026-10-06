import { arbitrum, avalanche, base, baseSepolia, bsc, mainnet, optimism, polygon, sepolia, type Chain } from 'viem/chains'

export const SUPPORTED_CHAINS: readonly Chain[] = [base, baseSepolia, mainnet, sepolia, arbitrum, optimism, polygon, bsc, avalanche]

export function chainById(id: number | null | undefined): Chain | null {
  return SUPPORTED_CHAINS.find((c) => c.id === id) ?? null
}

export function explorerTxUrl(chain: Chain | null, hash: string) {
  const base = chain?.blockExplorers?.default.url
  return base ? `${base}/tx/${hash}` : null
}
