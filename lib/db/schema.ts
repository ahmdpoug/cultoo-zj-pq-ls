import { sql } from 'drizzle-orm'
import { bigint, boolean, date, integer, jsonb, pgTable, primaryKey, real, text, timestamp } from 'drizzle-orm/pg-core'
import type { BattleRound, CardStats } from '@/lib/types'

const ts = (name: string) => timestamp(name, { withTimezone: true })

export const players = pgTable('players', {
  id: text('id').primaryKey(),
  xId: text('x_id'),
  xHandle: text('x_handle'),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  walletAddress: text('wallet_address'),
  mainCardId: text('main_card_id'),
  guildId: text('guild_id'),
  balance: bigint('balance', { mode: 'number' }).notNull().default(0),
  materials: integer('materials').notNull().default(0),
  fragments: integer('fragments').notNull().default(0),
  seasonXp: integer('season_xp').notNull().default(0),
  pendingCult: bigint('pending_cult', { mode: 'number' }).notNull().default(0),
  achievements: text('achievements').array().notNull().default(sql`'{}'`),
  quests: jsonb('quests').$type<Record<string, number>>().notNull().default({}),
  claimedQuests: text('claimed_quests').array().notNull().default(sql`'{}'`),
  questDay: date('quest_day'),
  createdAt: ts('created_at').notNull().defaultNow(),
})

export const cards = pgTable('cards', {
  id: text('id').primaryKey(),
  number: integer('number').generatedAlwaysAsIdentity(),
  ownerId: text('owner_id').notNull(),
  handle: text('handle').notNull(),
  displayName: text('display_name').notNull(),
  archetype: text('archetype').notNull(),
  rarity: text('rarity').notNull(),
  level: integer('level').notNull().default(1),
  xp: integer('xp').notNull().default(0),
  stats: jsonb('stats').$type<CardStats>().notNull(),
  followers: integer('followers').notNull().default(0),
  following: integer('following').notNull().default(0),
  accountAgeYears: real('account_age_years').notNull().default(0),
  wins: integer('wins').notNull().default(0),
  losses: integer('losses').notNull().default(0),
  season: text('season').notNull(),
  edition: text('edition').notNull(),
  minted: boolean('minted').notNull().default(false),
  mintedAt: ts('minted_at'),
  avatarUrl: text('avatar_url'),
  verified: boolean('verified').notNull().default(false),
  liveData: boolean('live_data').notNull().default(true),
  createdAt: ts('created_at').notNull().defaultNow(),
})

export const listings = pgTable('listings', {
  id: text('id').primaryKey(),
  cardId: text('card_id').notNull(),
  sellerId: text('seller_id').notNull(),
  price: bigint('price', { mode: 'number' }).notNull(),
  status: text('status').notNull().default('active'),
  buyerId: text('buyer_id'),
  txHash: text('tx_hash'),
  reservedBy: text('reserved_by'),
  reservedUntil: ts('reserved_until'),
  listedAt: ts('listed_at').notNull().defaultNow(),
  soldAt: ts('sold_at'),
})

export const battles = pgTable('battles', {
  id: text('id').primaryKey(),
  playerId: text('player_id').notNull(),
  cardId: text('card_id').notNull(),
  opponentCardId: text('opponent_card_id').notNull(),
  opponentHandle: text('opponent_handle').notNull(),
  opponentRarity: text('opponent_rarity').notNull(),
  result: text('result').notNull(),
  xp: integer('xp').notNull(),
  reward: bigint('reward', { mode: 'number' }).notNull(),
  rounds: jsonb('rounds').$type<BattleRound[]>().notNull(),
  at: ts('at').notNull().defaultNow(),
})

export const activity = pgTable('activity', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  playerId: text('player_id').notNull(),
  type: text('type').notNull(),
  label: text('label').notNull(),
  at: ts('at').notNull().defaultNow(),
})

export const payments = pgTable('payments', {
  txHash: text('tx_hash').primaryKey(),
  playerId: text('player_id').notNull(),
  purpose: text('purpose').notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  at: ts('at').notNull().defaultNow(),
})

export const tournamentEntries = pgTable(
  'tournament_entries',
  {
    tournamentId: text('tournament_id').notNull(),
    playerId: text('player_id').notNull(),
    cardId: text('card_id').notNull(),
    txHash: text('tx_hash').notNull(),
    enteredAt: ts('entered_at').notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.tournamentId, t.playerId] })],
)

export const tournamentResults = pgTable('tournament_results', {
  tournamentId: text('tournament_id').primaryKey(),
  winners: jsonb('winners').$type<{ playerId: string; handle: string; wins: number; prize: number }[]>().notNull().default([]),
  prizePool: bigint('prize_pool', { mode: 'number' }).notNull().default(0),
  settledAt: ts('settled_at').notNull().defaultNow(),
})

export const payouts = pgTable('payouts', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  playerId: text('player_id').notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  reason: text('reason').notNull(),
  txHash: text('tx_hash'),
  status: text('status').notNull().default('pending'),
  at: ts('at').notNull().defaultNow(),
})

export type PlayerRow = typeof players.$inferSelect
export type CardRow = typeof cards.$inferSelect
