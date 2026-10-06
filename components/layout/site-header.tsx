'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGame } from '@/hooks/use-game'
import { num } from '@/lib/game/format'
import { AccountButton } from './account-button'
import { CultLogo, CultMark } from './cult-logo'
import { PRIMARY_NAV, SECONDARY_NAV, isActive } from './nav-config'

export function SiteHeader() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <CultLogo />

        <nav aria-label="Primary" className="ml-6 hidden items-center gap-0.5 xl:flex">
          {PRIMARY_NAV.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative rounded-lg px-3 py-2 text-[13px] font-medium transition-colors',
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {item.label}
                {active && <span aria-hidden className="absolute inset-x-3 -bottom-[13px] h-px bg-primary shadow-[0_0_12px_oklch(0.66_0.21_296)]" />}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <BalanceChip />
          <AccountButton />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="flex size-10 items-center justify-center rounded-xl border border-white/10 text-muted-foreground transition-colors hover:text-foreground xl:hidden"
          >
            {menuOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
            <span className="sr-only">Menu</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" aria-label="All destinations" className="border-t border-white/[0.06] bg-background/95 px-4 pb-6 pt-4 xl:hidden animate-slide-up">
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[...PRIMARY_NAV, ...SECONDARY_NAV].map((item) => {
              const Icon = item.icon
              const active = isActive(pathname, item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      'flex h-14 items-center gap-3 rounded-xl border px-4 text-sm font-medium transition-colors',
                      active ? 'border-primary/40 bg-primary/10 text-foreground' : 'border-white/[0.06] bg-white/[0.02] text-muted-foreground',
                    )}
                  >
                    <Icon className="size-4.5" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      )}
    </header>
  )
}

function BalanceChip() {
  const { state, hasPlayer } = useGame()
  return (
    <Link
      href="/vault"
      className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 transition-colors hover:border-primary/40 sm:flex"
    >
      <CultMark className="size-4" />
      <span className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground">BALANCE</span>
      <span className="font-display text-sm font-bold tabular-nums">{hasPlayer ? num(state.economy.balance) : '—'}</span>
    </Link>
  )
}

