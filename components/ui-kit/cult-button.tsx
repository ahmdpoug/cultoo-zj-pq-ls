import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const VARIANTS = {
  primary:
    'bg-primary text-primary-foreground shadow-[0_0_0_1px_oklch(1_0_0/0.2)_inset,0_10px_30px_-14px_oklch(0.95_0.012_95/0.55)] hover:brightness-105 hover:shadow-[0_0_0_1px_oklch(1_0_0/0.3)_inset,0_14px_40px_-14px_oklch(0.95_0.012_95/0.7)]',
  silver:
    'bg-gradient-to-b from-primary to-[oklch(0.82_0.02_95)] text-primary-foreground shadow-[0_10px_30px_-14px_oklch(0.95_0.012_95/0.4)] hover:brightness-105',
  outline: 'glass text-foreground hover:border-white/20 hover:bg-white/[0.06]',
  ghost: 'text-muted-foreground hover:text-foreground hover:bg-white/5',
} as const

const SIZES = {
  sm: 'h-9 px-3.5 text-xs',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-sm sm:text-base',
} as const

interface BaseProps {
  variant?: keyof typeof VARIANTS
  size?: keyof typeof SIZES
  icon?: ReactNode
  loading?: boolean
  className?: string
  children: ReactNode
}

const base =
  'group relative inline-flex select-none items-center justify-center gap-2 rounded-xl font-display font-semibold uppercase tracking-[0.14em] transition-all duration-300 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45'

export function CultButton({
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  className,
  children,
  ...props
}: BaseProps & Omit<ComponentProps<'button'>, keyof BaseProps>) {
  return (
    <button className={cn(base, VARIANTS[variant], SIZES[size], className)} disabled={loading || props.disabled} {...props}>
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  )
}

export function CultLink({
  variant = 'primary',
  size = 'md',
  icon,
  className,
  children,
  href,
  external,
}: Omit<BaseProps, 'loading'> & { href: string; external?: boolean }) {
  const classes = cn(base, VARIANTS[variant], SIZES[size], className)
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes}>
        {icon}
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={classes}>
      {icon}
      {children}
    </Link>
  )
}
