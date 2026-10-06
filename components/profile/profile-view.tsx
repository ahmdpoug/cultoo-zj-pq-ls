'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogOut, Shield, Star, Trophy, Shield as ShieldIcon } from 'lucide-react'
import type { CultCard } from '@/lib/types'
import { useGame } from '@/hooks/use-game'
import { useGuilds, useLeaderboard } from '@/hooks/use-data'
import { rankForLevel } from '@/lib/game/progression'
import { ARCHETYPE_LABEL, cultPower, winRate } from '@/lib/game/scoring'
import { RARITY_META, compareRarity } from '@/lib/game/rarity'
import { num, timeAgo } from '@/lib/game/format'
import { CardAvatar } from '@/components/cards/card-avatar'
import { CultCardView } from '@/components/cards/cult-card'
import { AchievementBadges } from './achievement-badges'
import { CultButton, CultLink } from '@/components/ui-kit/cult-button'
import { Panel, RarityBadge, StatTile } from '@/components/ui-kit/primitives'
import { Modal } from '@/components/ui-kit/modal'

export function ProfileView({ card }: { card: CultCard }) {
  const { state, setMainCard, reset } = useGame()
  const { data: guilds } = useGuilds()
  const { data: board } = useLeaderboard()
  const [confirmReset, setConfirmReset] = useState(false)
  const power = cultPower(card)
  const rank = rankForLevel(card.level)
  const myRank = board?.myRank ?? null
  const guild = guilds?.find((g) => g.id === state.guildId) ?? guilds?.find((g) => g.archetype === card.archetype) ?? guilds?.[0]
  const collection = [...state.cards].sort((a, b) => compareRarity(b.rarity, a.rarity) || b.level - a.level)
  const totalWins = state.battles.filter((b) => b.result === 'victory').length

  return (
    <div className="space-y-8">
      <Panel className="relative overflow-hidden p-6 sm:p-8">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_100%_at_0%_0%,oklch(0.35_0.15_296/0.35),transparent_70%)]" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <CardAvatar handle={card.handle} src={card.avatarUrl} className="w-24 sm:w-28" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-bold metal-text sm:text-4xl">{card.displayName}</h1>
              <RarityBadge rarity={card.rarity} />
            </div>
            <p className="text-muted-foreground">
              @{card.handle} · {ARCHETYPE_LABEL[card.archetype]} · <span className="font-semibold uppercase text-primary">{rank.title}</span>
            </p>
            {guild && (
              <Link href="/guilds" className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm hover:border-primary/40">
                <ShieldIcon className="size-4 text-primary" aria-hidden /> {guild.name}
              </Link>
            )}
          </div>
          <div className="flex gap-2">
            <CultLink href="/card" variant="outline" size="sm">
              My Card
            </CultLink>
            <CultButton variant="ghost" size="sm" onClick={() => setConfirmReset(true)} icon={<LogOut className="size-4" />}>
              Reset Profile
            </CultButton>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Cult Power" value={num(power)} />
        <StatTile label="Season Rank" value={myRank ? `#${num(myRank)}` : '—'} />
        <StatTile label="Level" value={card.level} hint={rank.title} />
        <StatTile label="Win Rate" value={`${winRate(card)}%`} hint={`${card.wins}W / ${card.losses}L`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Panel className="p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold uppercase tracking-wide">
            <Star className="size-4 text-primary" aria-hidden /> Achievements
            <span className="ml-auto text-sm font-normal text-muted-foreground tabular-nums">{state.achievements.length} / 8</span>
          </h2>
          <div className="mt-5">
            <AchievementBadges unlocked={state.achievements} />
          </div>
        </Panel>
        <Panel className="p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold uppercase tracking-wide">
            <Trophy className="size-4 text-primary" aria-hidden /> Battle History
            <span className="ml-auto text-sm font-normal text-muted-foreground tabular-nums">{totalWins} wins</span>
          </h2>
          {state.battles.length === 0 ? (
            <p className="mt-5 text-sm text-muted-foreground">
              No battles recorded.{' '}
              <Link href="/arena" className="text-foreground underline underline-offset-4">
                Enter the Arena
              </Link>
            </p>
          ) : (
            <ul className="mt-4 space-y-1">
              {state.battles.slice(0, 8).map((b) => (
                <li key={b.id} className="flex items-center justify-between border-b border-white/[0.05] py-2 text-sm">
                  <span>
                    <span className={b.result === 'victory' ? 'font-semibold text-success' : 'text-muted-foreground'}>{b.result === 'victory' ? 'W' : 'L'}</span>{' '}
                    vs @{b.opponentHandle}
                  </span>
                  <span className="text-xs text-muted-foreground">{timeAgo(b.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <section aria-labelledby="collection">
        <div className="flex items-end justify-between">
          <h2 id="collection" className="font-display text-xl font-bold uppercase tracking-wide">
            NFT Collection
          </h2>
          <p className="text-sm text-muted-foreground tabular-nums">
            {collection.length} cards · {collection.filter((c) => c.minted).length} minted
          </p>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {collection.map((c) => (
            <li key={c.id} className="flex flex-col items-center gap-2">
              <CultCardView card={c} size="sm" className="w-full" />
              <div className="flex w-full items-center justify-between text-xs">
                <span data-rarity={c.rarity} className="font-semibold uppercase tracking-wider rarity-text">
                  {RARITY_META[c.rarity].label}
                </span>
                {c.id === state.mainCardId ? (
                  <span className="text-primary">Main</span>
                ) : (
                  <button type="button" onClick={() => void setMainCard(c.id)} className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                    Set main
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset profile?">
        <p className="text-sm text-muted-foreground">This permanently clears your cards, balance and history from the CULT database.</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <CultButton variant="outline" onClick={() => setConfirmReset(false)}>
            Cancel
          </CultButton>
          <CultButton
            onClick={() => {
              void reset()
              setConfirmReset(false)
            }}
            icon={<Shield className="size-4" />}
          >
            Reset
          </CultButton>
        </div>
      </Modal>
    </div>
  )
}
