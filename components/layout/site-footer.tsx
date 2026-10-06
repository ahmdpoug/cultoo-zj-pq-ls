import Link from 'next/link'
import { CultLogo } from './cult-logo'
import { PRIMARY_NAV, SECONDARY_NAV } from './nav-config'

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/[0.06] pb-24 md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <CultLogo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            CT Card Universe turns real X profiles into collectible cards. $CULT is a conceptual in-game utility currency with no
            monetary value, and every card, trade and battle is stored in the CULT database.
          </p>
        </div>
        <FooterCol title="Play" links={PRIMARY_NAV.slice(1, 6)} />
        <FooterCol title="Explore" links={[...SECONDARY_NAV, PRIMARY_NAV[6]]} />
      </div>
      <div className="border-t border-white/[0.06] py-5 text-center text-xs tracking-[0.2em] text-muted-foreground">
        CT IS THE GAME · GENESIS SEASON 01 · LIVE
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: readonly { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
