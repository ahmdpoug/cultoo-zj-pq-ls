import Link from 'next/link'
import { Building2, DoorOpen, Hammer, Landmark, Store, Swords, Trophy, Vault, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const LOCATIONS = [
  { name: 'The Gate', href: '/scan', icon: DoorOpen, sector: '00', blurb: 'Where every initiate is scanned and struck.', span: 'lg:col-span-2 lg:row-span-2', hue: 296 },
  { name: 'CT City', href: '/leaderboard', icon: Building2, sector: '01', blurb: 'The CULT 100 rules these streets.', span: '', hue: 260 },
  { name: 'The Arena', href: '/arena', icon: Swords, sector: '02', blurb: 'Stat duels. Best of three.', span: '', hue: 330 },
  { name: 'The Forge', href: '/forge', icon: Hammer, sector: '03', blurb: 'Turn cards into legends.', span: '', hue: 40 },
  { name: 'The Market', href: '/market', icon: Store, sector: '04', blurb: 'Trade cards across the cult.', span: '', hue: 220 },
  { name: 'The Vault', href: '/vault', icon: Vault, sector: '05', blurb: 'Your $CULT, materials and daily quests.', span: '', hue: 180 },
  { name: 'The Sanctum', href: '/guilds', icon: Landmark, sector: '06', blurb: 'Guild halls of the four orders.', span: '', hue: 300 },
  { name: 'Championship Stadium', href: '/championships', icon: Trophy, sector: '07', blurb: 'Where CT Champions are crowned.', span: 'lg:col-span-2', hue: 80 },
]

export function WorldMap({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-4', !compact && 'lg:auto-rows-[13rem]')}>
      {LOCATIONS.map(({ name, href, icon: Icon, sector, blurb, span, hue }) => (
        <li key={name} className={cn(span, 'min-h-44')}>
          <Link
            href={href}
            className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.07] bg-card p-5 transition-all duration-500 hover:-translate-y-0.5 hover:border-white/20 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              backgroundImage: `radial-gradient(90% 90% at 85% 15%, oklch(0.42 0.14 ${hue} / 0.35), transparent 65%), linear-gradient(180deg, oklch(0.16 0.014 285), oklch(0.11 0.01 285))`,
            }}
          >
            <div aria-hidden className="absolute inset-0 grid-bg opacity-40 transition-opacity duration-500 group-hover:opacity-80" />
            <div
              aria-hidden
              className="absolute -right-8 -top-8 size-40 rounded-full border opacity-30 transition-transform duration-700 group-hover:scale-125"
              style={{ borderColor: `oklch(0.7 0.14 ${hue})` }}
            />
            <div className="relative flex items-start justify-between">
              <span
                className="flex size-11 items-center justify-center rounded-xl border bg-black/40 backdrop-blur"
                style={{ borderColor: `oklch(0.7 0.14 ${hue} / 0.4)`, color: `oklch(0.85 0.1 ${hue})` }}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="text-[10px] font-semibold tracking-[0.3em] text-muted-foreground">SECTOR {sector}</span>
            </div>
            <div className="relative">
              <h3 className="flex items-center gap-2 font-display text-xl font-bold uppercase tracking-wide">
                {name}
                <ArrowUpRight className="size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
