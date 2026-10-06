'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Crown } from 'lucide-react'
import { useLeaderboard } from '@/hooks/use-data'
import { useGame, useMounted } from '@/hooks/use-game'
import { compact, num } from '@/lib/game/format'
import { Eyebrow, RarityBadge } from '@/components/ui-kit/primitives'
import { Particles } from '@/components/ui-kit/particles'
import { CultLink } from '@/components/ui-kit/cult-button'

function useCountdown(target: number) {
  const mounted = useMounted()
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const diff = Math.max(0, target - now)
  const parts = {
    days: Math.floor(diff / 86_400_000),
    hrs: Math.floor(diff / 3_600_000) % 24,
    min: Math.floor(diff / 60_000) % 60,
    sec: Math.floor(diff / 1000) % 60,
  }
  return mounted ? parts : null
}

export function ChampionshipHero() {
  const { data } = useLeaderboard()
  const season = data?.season
  const time = useCountdown(season?.endsAt ?? 0)
  const { hasPlayer } = useGame()
  const mounted = useMounted()
  const myRank = data?.myRank ?? null
  const featured = (data?.entries ?? []).slice(0, 5)

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[radial-gradient(70%_90%_at_70%_40%,oklch(0.3_0.15_296/0.5),transparent_70%)]">
      <div aria-hidden className="absolute inset-0 grid-bg opacity-50" />
      <Particles count={30} seed="championship" />
      <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <Eyebrow>{season?.label ?? 'Genesis — Season 01'}</Eyebrow>
          <h2 className="mt-4 font-display text-4xl font-bold uppercase leading-none tracking-tight metal-text text-balance sm:text-6xl">CULT CT Championship</h2>
          <p className="mt-4 max-w-lg text-muted-foreground">
            The top {season?.qualifyTop ?? 100} of the CULT 100 at season end qualify for the final tournament. One card leaves as CT Champion.
          </p>

          <div className="mt-8 grid grid-cols-4 gap-2 sm:max-w-md" aria-label="Time remaining" role="timer">
            {(['days', 'hrs', 'min', 'sec'] as const).map((k) => (
              <div key={k} className="rounded-xl border border-white/10 bg-black/50 px-2 py-3 text-center backdrop-blur">
                <p className="font-display text-3xl font-bold tabular-nums">{time ? String(time[k]).padStart(2, '0') : '--'}</p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{k}</p>
              </div>
            ))}
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-4 sm:max-w-md">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Players</dt>
              <dd className="font-display text-xl font-bold tabular-nums">{season ? num(season.players) : '—'}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Prize pool</dt>
              <dd className="font-display text-xl font-bold tabular-nums">{season ? compact(season.prizePool) : '—'} $CULT</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Your rank</dt>
              <dd className="font-display text-xl font-bold tabular-nums text-primary">{mounted && myRank ? `#${num(myRank)}` : '—'}</dd>
            </div>
          </dl>
          {mounted && myRank && season && (
            <p className="mt-3 text-sm text-muted-foreground">
              {myRank <= season.qualifyTop ? 'You are currently qualified for the final.' : `Climb ${num(myRank - season.qualifyTop)} places to qualify.`}
            </p>
          )}
          {mounted && !hasPlayer && (
            <CultLink href="/scan" className="mt-6">
              Join the Season
            </CultLink>
          )}
        </div>

        <div className="relative flex flex-col items-center">
          <div aria-hidden className="absolute top-10 size-64 rounded-full bg-primary/30 blur-[80px]" />
          <Image
            src="/images/cult-trophy.png"
            alt="The CULT CT Championship trophy"
            width={360}
            height={360}
            priority
            className="relative w-56 animate-float mix-blend-lighten sm:w-72"
          />
          <ol className="relative mt-2 w-full max-w-sm space-y-1.5">
            {featured.map((e, i) => (
              <li key={e.handle} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-black/40 px-3 py-2 text-sm backdrop-blur">
                <span className="w-5 font-display font-bold tabular-nums text-muted-foreground">{i + 1}</span>
                {i === 0 && <Crown className="size-4 text-primary" aria-hidden />}
                <Link href="/leaderboard" className="flex-1 truncate font-semibold hover:text-primary">
                  @{e.handle}
                </Link>
                <RarityBadge rarity={e.rarity} />
                <span className="w-16 text-right font-display font-bold tabular-nums">{compact(e.seasonPoints)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
