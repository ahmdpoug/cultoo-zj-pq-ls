'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpCircle, Gem, RefreshCw, Share2, Swords, History } from 'lucide-react'
import type { CultCard } from '@/lib/types'
import { useGame } from '@/hooks/use-game'
import { useLeaderboard } from '@/hooks/use-data'
import { services, UPGRADE_COST, InsufficientBalanceError } from '@/lib/services'
import { CultCardView } from '@/components/cards/cult-card'
import { ShareModal } from '@/components/cards/share-modal'
import { MintModal } from '@/components/cards/mint-modal'
import { NftDetails } from '@/components/cards/nft-details'
import { LevelProgress, LevelUpBurst } from '@/components/cards/level-progress'
import { AchievementBadges } from '@/components/profile/achievement-badges'
import { CultButton } from '@/components/ui-kit/cult-button'
import { Modal } from '@/components/ui-kit/modal'
import { Panel, RarityBadge, StatBar, StatTile } from '@/components/ui-kit/primitives'
import { compact, num, timeAgo } from '@/lib/game/format'
import { cultPower, winRate } from '@/lib/game/scoring'

export function MyCardDashboard({ card }: { card: CultCard }) {
  const router = useRouter()
  const { state } = useGame()
  const { data: board } = useLeaderboard()
  const [flipped, setFlipped] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [nftOpen, setNftOpen] = useState(false)
  const [mintOpen, setMintOpen] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [levelUp, setLevelUp] = useState<number | null>(null)

  const power = cultPower(card)
  const myRank = board?.myRank ?? null

  async function upgrade() {
    setUpgrading(true)
    setNotice(null)
    try {
      const { levelsGained } = await services.forge.upgrade(card.id)
      if (levelsGained > 0) {
        setLevelUp(card.level + levelsGained)
        setTimeout(() => setLevelUp(null), 2200)
      }
      setNotice(`+${num(UPGRADE_COST.xp)} XP applied`)
    } catch (e) {
      setNotice(e instanceof InsufficientBalanceError ? 'Not enough $CULT for an upgrade.' : (e as Error).message)
    } finally {
      setUpgrading(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[22rem_1fr]">
      <aside className="flex flex-col items-center gap-5 lg:sticky lg:top-24 lg:self-start">
        <CultCardView card={card} size="xl" flipped={flipped} onClick={() => setFlipped((f) => !f)} />
        <button type="button" onClick={() => setFlipped((f) => !f)} className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground">
          <RefreshCw className="size-3.5" aria-hidden /> Flip card
        </button>
        <div className="grid w-full max-w-80 grid-cols-2 gap-2.5">
          <CultButton className="col-span-2" onClick={upgrade} loading={upgrading} icon={<ArrowUpCircle className="size-4" />}>
            Upgrade Card
          </CultButton>
          <CultButton variant="outline" size="sm" onClick={() => router.push('/arena')} icon={<Swords className="size-4" />}>
            Enter Arena
          </CultButton>
          <CultButton variant="outline" size="sm" onClick={() => setShareOpen(true)} icon={<Share2 className="size-4" />}>
            Share to X
          </CultButton>
          <CultButton variant="ghost" size="sm" className="col-span-2" onClick={() => setNftOpen(true)} icon={<Gem className="size-4" />}>
            View NFT
          </CultButton>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Upgrade: {UPGRADE_COST.cult} $CULT + {UPGRADE_COST.materials} materials → +{num(UPGRADE_COST.xp)} XP
        </p>
        {notice && (
          <p role="status" className="text-sm text-primary">
            {notice}
          </p>
        )}
      </aside>

      <div className="space-y-6">
        <Panel className="p-6 sm:p-8">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <RarityBadge rarity={card.rarity} />
            <span className="text-sm text-muted-foreground">@{card.handle} · {card.season} Season</span>
          </div>
          <LevelProgress card={card} />
        </Panel>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile label="Cult Power" value={num(power)} />
          <StatTile label="Season Rank" value={myRank ? `#${num(myRank)}` : '—'} hint={myRank && myRank <= 100 ? 'Championship qualified' : 'Top 100 qualifies'} />
          <StatTile label="Battle Record" value={`${card.wins}W / ${card.losses}L`} hint={`${winRate(card)}% win rate`} />
          <StatTile label="Season XP" value={num(state.economy.seasonXp)} />
        </div>

        <Panel className="p-6 sm:p-8">
          <h2 className="font-display text-lg font-bold uppercase tracking-wide">Card Stats</h2>
          <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <StatBar label="CT Score" value={card.stats.ctScore} />
            <StatBar label="Reputation" value={card.stats.reputation} />
            <StatBar label="Influence" value={card.stats.influence} />
            <StatBar label="Engagement" value={card.stats.engagement} />
            <StatBar label="Consistency" value={card.stats.consistency} />
            <StatBar label="Alpha Score" value={card.stats.alpha} />
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.06] sm:grid-cols-4">
            {[
              ['Followers', compact(card.followers)],
              ['Account Age', `${card.accountAgeYears} yrs`],
              ['Wins', card.wins],
              ['Losses', card.losses],
            ].map(([k, v]) => (
              <div key={k} className="bg-background/80 p-4">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{k}</dt>
                <dd className="mt-1 font-display text-xl font-bold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel className="p-6">
            <h2 className="font-display text-lg font-bold uppercase tracking-wide">Achievements</h2>
            <div className="mt-5">
              <AchievementBadges unlocked={state.achievements} compact />
            </div>
          </Panel>
          <Panel className="p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold uppercase tracking-wide">
              <History className="size-4 text-primary" aria-hidden /> Card History
            </h2>
            {state.activity.length === 0 ? (
              <p className="mt-5 text-sm text-muted-foreground">No history yet. Battle, upgrade or forge to write your story.</p>
            ) : (
              <ol className="mt-4 max-h-72 space-y-1 overflow-y-auto pr-1">
                {state.activity.slice(0, 14).map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 border-b border-white/[0.05] py-2 text-sm">
                    <span className="truncate">{a.label}</span>
                    <time className="shrink-0 text-xs text-muted-foreground">{timeAgo(a.at)}</time>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>
      </div>

      <ShareModal card={card} open={shareOpen} onClose={() => setShareOpen(false)} />
      <MintModal card={card} open={mintOpen} onClose={() => setMintOpen(false)} />
      <Modal open={nftOpen} onClose={() => setNftOpen(false)} title={`CULT Card NFT`}>
        <NftDetails card={card} />
        {card.minted ? (
          <p className="mt-5 text-sm text-success">This card is minted in your collection.</p>
        ) : (
          <CultButton
            className="mt-5 w-full"
            icon={<Gem className="size-4" />}
            onClick={() => {
              setNftOpen(false)
              setMintOpen(true)
            }}
          >
            Mint Card
          </CultButton>
        )}
      </Modal>
      {levelUp && <LevelUpBurst level={levelUp} />}
    </div>
  )
}
