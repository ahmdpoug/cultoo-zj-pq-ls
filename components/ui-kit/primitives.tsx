import type { ReactNode } from 'react'
import type { Rarity } from '@/lib/types'
import { cn } from '@/lib/utils'
import { RARITY_META } from '@/lib/game/rarity'

export function Panel({ className, children, as: As = 'div' }: { className?: string; children: ReactNode; as?: 'div' | 'section' | 'article' | 'aside' }) {
  return <As className={cn('glass rounded-2xl', className)}>{children}</As>
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary', className)}>
      <span aria-hidden className="h-px w-6 bg-primary/70" />
      {children}
    </p>
  )
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <header className="flex flex-col gap-5 pb-8 pt-2 md:flex-row md:items-end md:justify-between md:pb-10">
      <div className="min-w-0 max-w-2xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-3 break-words font-display text-[clamp(1.75rem,8vw,3rem)] font-bold uppercase leading-tight tracking-tight metal-text text-balance">
          {title}
        </h1>
        {subtitle && <p className="mt-3 text-pretty text-muted-foreground leading-relaxed">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  )
}

export function RarityBadge({ rarity, className }: { rarity: Rarity; className?: string }) {
  return (
    <span
      data-rarity={rarity}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] rarity-border rarity-bg rarity-text',
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rotate-45 bg-[var(--r-1)]" />
      {RARITY_META[rarity].label}
    </span>
  )
}

export function StatBar({ label, value, max = 99, className }: { label: string; value: number; max?: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
        <span className="font-display text-lg font-bold tabular-nums">{value}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary/60 via-primary to-silver transition-[width] duration-1000 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function StatTile({ label, value, hint, className }: { label: string; value: ReactNode; hint?: ReactNode; className?: string }) {
  return (
    <div className={cn('glass rounded-xl p-4', className)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-bold tabular-nums text-foreground">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="glass flex flex-col items-center rounded-2xl px-6 py-14 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">{icon}</div>
      <h3 className="mt-5 font-display text-xl font-bold uppercase tracking-wide">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-white/[0.05]', className)} />
}
