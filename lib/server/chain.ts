import {
  createPublicClient,
  createWalletClient,
  erc20Abi,
  formatUnits,
  getAddress,
  http,
  isAddress,
  isHash,
  parseEventLogs,
  parseUnits,
  type Address,
  type Hash,
  type PublicClient,
} from 'viem'
import { privateKeyToAccount, type PrivateKeyAccount } from 'viem/accounts'
import type { ChainInfo } from '@/lib/types'
import { chainById, explorerTxUrl } from '@/lib/chain/chains'
import { HttpError } from './http'

interface TokenRuntime {
  chain: NonNullable<ReturnType<typeof chainById>>
  token: Address
  treasury: PrivateKeyAccount
  client: PublicClient
  rpc: string | undefined
  meta?: { decimals: number; symbol: string }
}

let runtime: TokenRuntime | null | undefined

function load(): TokenRuntime | null {
  if (runtime !== undefined) return runtime
  const token = process.env.CULT_TOKEN_ADDRESS
  const chain = chainById(Number(process.env.CULT_CHAIN_ID))
  const key = process.env.CULT_TREASURY_PRIVATE_KEY
  if (!token || !isAddress(token) || !chain || !key) {
    runtime = null
    return null
  }
  const rpc = process.env.CULT_RPC_URL || undefined
  runtime = {
    chain,
    token: getAddress(token),
    treasury: privateKeyToAccount((key.startsWith('0x') ? key : `0x${key}`) as Hash),
    client: createPublicClient({ chain, transport: http(rpc) }) as PublicClient,
    rpc,
  }
  return runtime
}

function requireToken() {
  const r = load()
  if (!r) throw new HttpError(503, '$CULT token is not configured yet.')
  return r
}

async function tokenMeta(r: TokenRuntime) {
  if (r.meta) return r.meta
  const [decimals, symbol] = await Promise.all([
    r.client.readContract({ address: r.token, abi: erc20Abi, functionName: 'decimals' }),
    r.client.readContract({ address: r.token, abi: erc20Abi, functionName: 'symbol' }).catch(() => 'CULT'),
  ])
  r.meta = { decimals, symbol }
  return r.meta
}

export async function chainInfo(): Promise<ChainInfo> {
  const r = load()
  if (!r) {
    return { configured: false, chainId: null, chainName: null, tokenAddress: null, treasury: null, symbol: 'CULT', decimals: 18, explorer: null }
  }
  const meta = await tokenMeta(r)
  return {
    configured: true,
    chainId: r.chain.id,
    chainName: r.chain.name,
    tokenAddress: r.token,
    treasury: r.treasury.address,
    symbol: meta.symbol,
    decimals: meta.decimals,
    explorer: r.chain.blockExplorers?.default.url ?? null,
  }
}

export function treasuryAddress(): Address {
  return requireToken().treasury.address
}

export function txUrl(hash: string) {
  return explorerTxUrl(load()?.chain ?? null, hash)
}

export async function balanceOf(address: string | null): Promise<number> {
  const r = load()
  if (!r || !address || !isAddress(address)) return 0
  try {
    const [raw, meta] = await Promise.all([
      r.client.readContract({ address: r.token, abi: erc20Abi, functionName: 'balanceOf', args: [getAddress(address)] }),
      tokenMeta(r),
    ])
    return Number(formatUnits(raw, meta.decimals))
  } catch {
    return 0
  }
}

/**
 * Confirms a mined $CULT transfer of at least `amount` from `from` to `to`.
 * Callers must still record the hash so it can't be reused.
 */
export async function verifyTransfer({ hash, from, to, amount }: { hash: string; from: string; to: string; amount: number }) {
  const r = requireToken()
  if (!isHash(hash)) throw new HttpError(400, 'Invalid transaction hash.')
  const meta = await tokenMeta(r)
  let receipt
  try {
    receipt = await r.client.waitForTransactionReceipt({ hash, timeout: 60_000, confirmations: 1 })
  } catch {
    throw new HttpError(408, 'Transaction not confirmed yet. Try again in a moment.')
  }
  if (receipt.status !== 'success') throw new HttpError(402, 'The $CULT transfer failed on-chain.')
  const need = parseUnits(String(amount), meta.decimals)
  const logs = parseEventLogs({ abi: erc20Abi, logs: receipt.logs, eventName: 'Transfer' })
  const ok = logs.some(
    (l) =>
      getAddress(l.address) === r.token &&
      getAddress(l.args.from) === getAddress(from) &&
      getAddress(l.args.to) === getAddress(to) &&
      l.args.value >= need,
  )
  if (!ok) throw new HttpError(402, `Transaction does not contain a ${amount} $CULT transfer to the expected wallet.`)
}

/** Sends `amount` $CULT from the treasury. Returns once the transfer is broadcast. */
export async function sendFromTreasury(to: string, amount: number): Promise<Hash> {
  const r = requireToken()
  if (!isAddress(to)) throw new HttpError(400, 'Invalid payout wallet.')
  const meta = await tokenMeta(r)
  const wallet = createWalletClient({ account: r.treasury, chain: r.chain, transport: http(r.rpc) })
  return wallet.writeContract({
    address: r.token,
    abi: erc20Abi,
    functionName: 'transfer',
    args: [getAddress(to), parseUnits(String(amount), meta.decimals)],
  })
}
