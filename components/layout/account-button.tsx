'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Fingerprint, Link2, LogOut, Wallet } from 'lucide-react'
import { useCultAuth } from '@/lib/auth/cult-auth'
import { CardAvatar } from '@/components/cards/card-avatar'
import { cn } from '@/lib/utils'

export function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

const short = (v: string, head = 6, tail = 4) => (v.length > head + tail + 1 ? `${v.slice(0, head)}…${v.slice(-tail)}` : v)

export function AccountButton() {
  const auth = useCultAuth()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!auth.ready) {
    return <div className="h-10 w-28 animate-pulse rounded-xl bg-white/[0.06]" aria-hidden />
  }

  if (!auth.authenticated) {
    return (
      <button
        type="button"
        onClick={auth.login}
        disabled={!auth.configured}
        title={auth.configured ? 'Sign in with X via Privy' : 'Set NEXT_PUBLIC_PRIVY_APP_ID to enable sign-in'}
        className="flex h-10 items-center gap-2 rounded-xl bg-primary px-3.5 font-display text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-all hover:brightness-110 disabled:opacity-60"
      >
        <XLogo className="size-3.5" />
        <span className="hidden sm:inline">Connect X</span>
        <span className="sm:hidden">Connect</span>
      </button>
    )
  }

  const label = auth.x ? `@${auth.x.username}` : auth.walletAddress ? short(auth.walletAddress) : 'Account'

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex h-10 items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 pl-1.5 pr-3 text-sm font-semibold transition-colors hover:border-primary/70"
      >
        <CardAvatar handle={auth.x?.username ?? 'cult'} src={auth.x?.avatarUrl} className="size-7" />
        <span className="hidden max-w-32 truncate sm:inline">{label}</span>
        <span className="sr-only sm:hidden">Account menu</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Account"
          className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-white/10 bg-popover/95 p-4 shadow-2xl backdrop-blur-xl animate-slide-up"
        >
          <div className="flex items-center gap-3">
            <CardAvatar handle={auth.x?.username ?? 'cult'} src={auth.x?.avatarUrl} className="size-11" />
            <div className="min-w-0">
              <p className="truncate font-display font-bold">{auth.x?.name ?? 'Cult member'}</p>
              <p className="truncate text-sm text-muted-foreground">{auth.x ? `@${auth.x.username}` : 'No X account linked'}</p>
            </div>
          </div>

          <dl className="mt-4 space-y-2">
            {auth.privyId && <CopyRow icon={<Fingerprint className="size-4" />} label="Privy ID" value={auth.privyId} display={short(auth.privyId.replace('did:privy:', ''), 8, 4)} />}
            {auth.walletAddress && <CopyRow icon={<Wallet className="size-4" />} label="Wallet" value={auth.walletAddress} display={short(auth.walletAddress)} />}
          </dl>

          <div className="mt-4 grid gap-2">
            {!auth.x && (
              <button
                type="button"
                onClick={auth.linkX}
                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:brightness-110"
              >
                <Link2 className="size-4" aria-hidden /> Link X account
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                void auth.logout()
              }}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="size-4" aria-hidden /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function CopyRow({ icon, label, value, display }: { icon: React.ReactNode; label: string; value: string; display: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <span className="text-primary" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</dt>
        <dd className="truncate font-mono text-xs" title={value}>
          {display}
        </dd>
      </div>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(value).catch(() => {})
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }}
        className={cn('flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground', copied && 'text-success')}
      >
        {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
        <span className="sr-only">{copied ? 'Copied' : `Copy ${label}`}</span>
      </button>
    </div>
  )
}
