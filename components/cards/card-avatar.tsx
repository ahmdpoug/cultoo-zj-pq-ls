import { cn } from '@/lib/utils'
import { hashString } from '@/lib/game/rng'

/** Real X profile image when available, otherwise a deterministic sigil. */
export function CardAvatar({ handle, src, className }: { handle: string; src?: string | null; className?: string }) {
  const h = hashString(handle.toLowerCase())
  const hue = 270 + (h % 60)
  const rot = h % 360
  const initial = (handle.replace(/[^a-zA-Z]/g, '')[0] ?? 'C').toUpperCase()
  return (
    <div
      className={cn('relative aspect-square overflow-hidden rounded-full', className)}
      style={{
        background: `conic-gradient(from ${rot}deg, oklch(0.32 0.12 ${hue}), oklch(0.18 0.05 ${hue}), oklch(0.5 0.16 ${hue}), oklch(0.2 0.06 ${hue}), oklch(0.32 0.12 ${hue}))`,
        boxShadow: 'inset 0 0 0 2px oklch(1 0 0 / 0.12), 0 10px 30px -10px oklch(0 0 0 / 0.8)',
      }}
      aria-hidden
    >
      {src ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" referrerPolicy="no-referrer" loading="lazy" decoding="async" className="absolute inset-[6%] size-[88%] rounded-full object-cover" />
          <div className="absolute inset-0 rounded-full ring-2 ring-inset ring-white/15" />
        </>
      ) : (
        <>
          <div className="absolute inset-[12%] rounded-full border border-white/15" />
          <div className="absolute inset-[24%] rounded-full bg-black/55" />
          <span className="absolute inset-0 flex items-center justify-center [container-type:inline-size]">
            <span className="font-display text-[length:40cqw] font-bold leading-none metal-text">{initial}</span>
          </span>
        </>
      )}
    </div>
  )
}
