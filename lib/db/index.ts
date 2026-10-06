import { Pool } from 'pg'
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from './schema'

const globalForDb = globalThis as unknown as { cultPool?: Pool }

const pool =
  globalForDb.cultPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
  })

if (process.env.NODE_ENV !== 'production') globalForDb.cultPool = pool

export const db: NodePgDatabase<typeof schema> = drizzle(pool, { schema })

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]
export type Db = typeof db | Tx

export { schema }
