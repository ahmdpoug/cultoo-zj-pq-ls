'use client'

import { useState } from 'react'
import { Check, LockKeyhole, Sparkles, X } from 'lucide-react'
import { useGame } from '@/hooks/use-game'
import { num } from '@/lib/game/format'
import { CultButton } from '@/components/ui-kit/cult-button'
import { Panel, RarityBadge } from '@/components/ui-kit/primitives'
import type { Rarity } from '@/lib/types'

type Pack = {
  id: string
  name: string
  tier: string
  rarity: Rarity
  price: number
  image: string
  summary: string
  odds: string
  accent: string
}

const PACKS: Pack[] = [
  {
    id: 'signal',
    name: 'Signal Pack',
    tier: 'Entry',
    rarity: 'common',
    price: 500,
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/279c7e7d-b9e5-4f4c-a616-06110580b8b5-185Li39bYc4PSOXUAr9BlFOvttIU8o.png',
    summary: 'A clean scan of the CT signal. Built for fresh accounts finding their first edge.',
    odds: 'Common 72% · Rare 24% · Epic 4%',
    accent: 'from-zinc-200/20 via-zinc-400/5 to-transparent',
  },
  {
    id: 'afterglow',
    name: 'Afterglow Pack',
    tier: 'Premium',
    rarity: 'rare',
    price: 1500,
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/29a1acb3-1caa-4894-bf09-0fcc07c3d647-b8aemU6w3ewdGFoQK4LgxtmoehMcrR.png',
    summary: 'A colder signal with better pull protection and a chance at a high-reputation card.',
    odds: 'Rare 58% · Epic 30% · Legendary 12%',
    accent: 'from-blue-400/25 via-blue-500/5 to-transparent',
  },
  {
    id: 'violet',
    name: 'Violet Archive',
    tier: 'Premium',
    rarity: 'epic',
    price: 3500,
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/f8824e76-9dc9-4c20-bbaf-a12a47e425a1-4JRNeLmkljOglh8HRsgg0cL7oNnebz.png',
    summary: 'An unstable archive containing cards with stronger starting traits and deeper CT lore.',
    odds: 'Epic 62% · Legendary 30% · Mythic 8%',
    accent: 'from-fuchsia-500/25 via-purple-500/5 to-transparent',
  },
  {
    id: 'auric',
    name: 'Auric Reserve',
    tier: 'Professional',
    rarity: 'legendary',
    price: 8500,
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/477757ff-c965-490f-8920-4dbd0aaac0a5-1Ew47DcX0Yyl2v0NidFCmUwdjcNwlk.png',
    summary: 'The professional desk favorite. Tuned for collectors building a serious roster.',
    odds: 'Legendary 76% · Mythic 24%',
    accent: 'from-amber-300/30 via-orange-500/5 to-transparent',
  },
  {
    id: 'redline',
    name: 'Redline Vault',
    tier: 'Professional',
    rarity: 'mythic',
    price: 25000,
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9cf33dc5-05f1-4852-823c-b08a84d17f26-vtShJ2JfENqFgf8qeGuaPBRYwrzIdL.png',
    summary: 'The highest-signal reveal. Reserved for accounts ready to put a mythic on the line.',
    odds: 'Mythic guaranteed · 1 bonus reveal',
    accent: 'from-red-500/30 via-rose-500/5 to-transparent',
  },
]

export function CultPacks() {
  const { state } = useGame()
  const [selected, setSelected] = useState<Pack | null>(null)
  const [revealed, setRevealed] = useState(false)
  const balance = state.economy.balance

  function openReveal(pack: Pack) {
    setSelected(pack)
    setRevealed(false)
  }

  return (
    <section aria-labelledby="packs-heading" className="mt-8">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">
            <span aria-hidden className="h-px w-6 bg-primary/70" />
            Drop 01 · CT supply
          </p>
          <h2 id="packs-heading" className="mt-2 font-display text-2xl font-bold uppercase tracking-wide">Open a pack</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Five rarity lanes, priced in $CULT. Your reveal is tied to the authenticated X-linked CT account and the server-backed CULT balance.
          </p>
        </div>
        <div className="glass flex items-center gap-2 rounded-xl px-3 py-2 text-xs">
          <span className="size-2 rounded-full bg-success shadow-[0_0_12px_var(--success)]" aria-hidden />
          <span className="text-muted-foreground">Live balance</span>
          <strong className="tabular-nums">{num(balance)} $CULT</strong>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {PACKS.map((pack) => {
          const canOpen = balance >= pack.price
          return (
            <article key={pack.id} className="group glass overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-1">
              <div className={`relative aspect-[4/5] overflow-hidden bg-gradient-to-b ${pack.accent}`}>
                <img src={pack.image} alt={`${pack.name} ${pack.tier} CULT pack`} className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-x-3 top-3 flex items-center justify-between">
                  <RarityBadge rarity={pack.rarity} />
                  <span className="rounded-full border border-white/15 bg-black/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">{pack.tier}</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 to-transparent" />
              </div>
              <div className="flex min-h-52 flex-col p-4">
                <h3 className="font-display text-lg font-bold uppercase tracking-wide">{pack.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{pack.summary}</p>
                <p className="mt-3 border-t border-white/[0.06] pt-3 text-[11px] leading-relaxed text-muted-foreground">{pack.odds}</p>
                <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                  <p className="font-display text-lg font-bold tabular-nums">{num(pack.price)} <span className="text-[10px] text-muted-foreground">$CULT</span></p>
                  <CultButton size="sm" variant={canOpen ? 'primary' : 'outline'} disabled={!canOpen} onClick={() => openReveal(pack)} icon={canOpen ? <Sparkles className="size-3.5" /> : <LockKeyhole className="size-3.5" />}>
                    {canOpen ? 'Reveal' : 'Locked'}
                  </CultButton>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="reveal-title">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-card shadow-2xl">
            <button type="button" onClick={() => setSelected(null)} className="absolute right-4 top-4 z-10 rounded-full border border-white/15 bg-black/40 p-2 text-white/70 transition-colors hover:text-white" aria-label="Close reveal">
              <X className="size-4" />
            </button>
            <div className="relative aspect-[4/3] overflow-hidden bg-black">
              <img src={selected.image} alt="" className={`h-full w-full object-cover transition-all duration-700 ${revealed ? 'scale-100 blur-0' : 'scale-110 blur-xl brightness-50'}`} />
              {!revealed && <div className="absolute inset-0 flex items-center justify-center"><div className="rounded-full border border-white/25 bg-black/50 px-5 py-3 text-center backdrop-blur"><Sparkles className="mx-auto size-5 text-primary" /><p className="mt-2 text-[10px] font-bold uppercase tracking-[0.25em]">Signal sealed</p></div></div>}
            </div>
            <div className="p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">{revealed ? 'Reveal complete' : 'Professional reveal chamber'}</p>
              <h2 id="reveal-title" className="mt-2 font-display text-2xl font-bold uppercase">{revealed ? selected.name : 'Ready to reveal?'}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{revealed ? `${selected.tier} lane confirmed. The pack image is your live visual receipt for this drop.` : `This ${num(selected.price)} $CULT pack is tied to your authenticated CT account.`}</p>
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">{revealed ? 'Account verified' : '500 CT account lane'}</span>
                {revealed ? <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success"><Check className="size-4" /> Verified</span> : <CultButton onClick={() => setRevealed(true)} icon={<Sparkles className="size-4" />}>Reveal pack</CultButton>}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
