'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { MOBILE_NAV, isActive } from './nav-config'

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Game navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-background/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <ul className="grid grid-cols-5">
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon
          const active = isActive(pathname, item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors',
                  active ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {active && <span aria-hidden className="absolute top-0 h-0.5 w-8 rounded-full bg-primary shadow-[0_0_12px_oklch(0.66_0.21_296)]" />}
                <Icon className={cn('size-5 transition-transform', active && 'scale-110 text-primary')} aria-hidden />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
