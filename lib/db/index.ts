import { Pool } from 'pg'
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL
const isLocalDb = !connectionString || /@(localhost|127\.0\.0\.1)[:/]/.test(connectionString)
const poolKey = `${connectionString ?? ''}|ssl=${!isLocalDb}`

const globalForDb = globalThis as unknown as { cultPool?: Pool; cultPoolKey?: string }

function createPool() {
  return new Pool({
    connectionString,
    max: 5,
    ssl: isLocalDb ? undefined : { rejectUnauthorized: true },
  })
}

// Dev HMR keeps globalThis alive; rebuild the pool when its connection settings change.
const pool = globalForDb.cultPool && globalForDb.cultPoolKey === poolKey ? globalForDb.cultPool : createPool()

if (process.env.NODE_ENV !== 'production') {
  if (globalForDb.cultPool && globalForDb.cultPool !== pool) void globalForDb.cultPool.end().catch(() => {})
  globalForDb.cultPool = pool
  globalForDb.cultPoolKey = poolKey
}

export const db: NodePgDatabase<typeof schema> = drizzle(pool, { schema })

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]
export type Db = typeof db | Tx

export { schema }
