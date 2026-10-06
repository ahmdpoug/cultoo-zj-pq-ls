import { Crown, Flame, Hammer, Lock, ScanLine, Star, Swords, Trophy } from 'lucide-react'
import { ACHIEVEMENTS } from '@/lib/game/config'
import { cn } from '@/lib/utils'

const ICONS: Record<string, typeof Star> = {
  'first-scan': ScanLine,
  'first-battle': Swords,
  'first-win': Flame,
  'forge-master': Hammer,
  'tournament-winner': Trophy,
  'top-100': Star,
  'ct-champion': Crown,
  'cult-legend': Crown,
}

export function AchievementBadges({ unlocked, compact = false }: { unlocked: string[]; compact?: boolean }) {
  return (
    <ul className={cn('grid gap-3', compact ? 'grid-cols-4' : 'grid-cols-2 sm:grid-cols-4')}>
      {ACHIEVEMENTS.map((a) => {
        const Icon = ICONS[a.id] ?? Star
        const isOn = unlocked.includes(a.id)
        return (
          <li key={a.id} data-rarity={a.tier} className={cn('group flex flex-col items-center text-center', !compact && 'glass rounded-xl p-4')}>
            <div
              className={cn(
                'relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105',
                compact ? 'size-14' : 'size-16',
              )}
              title={`${a.title} — ${a.description}`}
            >
              <svg viewBox="0 0 64 64" className="absolute inset-0 size-full" aria-hidden>
                <defs>
                  <linearGradient id={`badge-${a.id}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor={isOn ? 'var(--r-1)' : 'oklch(0.35 0.01 285)'} />
                    <stop offset="1" stopColor={isOn ? 'var(--r-2)' : 'oklch(0.2 0.01 285)'} />
                  </linearGradient>
                </defs>
                <path d="M32 3 57 17.5v29L32 61 7 46.5v-29z" fill="oklch(0.13 0.012 285)" stroke={`url(#badge-${a.id})`} strokeWidth="2.5" />
                <path d="M32 11 50 21.5v21L32 53 14 42.5v-21z" fill={`url(#badge-${a.id})`} opacity={isOn ? 0.18 : 0.06} />
              </svg>
              {isOn ? (
                <Icon className="relative size-6 rarity-text drop-shadow-[0_0_8px_var(--r-glow)]" aria-hidden />
              ) : (
                <Lock className="relative size-5 text-muted-foreground/60" aria-hidden />
              )}
            </div>
            <p className={cn('mt-2 font-display font-bold uppercase leading-tight', compact ? 'text-[10px]' : 'text-xs tracking-wide', isOn ? 'text-foreground' : 'text-muted-foreground')}>
              {a.title}
            </p>
            {!compact && <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{a.description}</p>}
            <span className="sr-only">{isOn ? 'Unlocked' : 'Locked'}</span>
          </li>
        )
      })}
    </ul>
  )
}
