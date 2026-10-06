import { createRng } from '@/lib/game/rng'
import { cn } from '@/lib/utils'

export function Particles({ count = 24, seed = 'cult', className }: { count?: number; seed?: string; className?: string }) {
  const rng = createRng(seed)
  const dots = Array.from({ length: count }, () => ({
    left: rng.float(0, 100),
    top: rng.float(30, 100),
    delay: rng.float(0, 8),
    duration: rng.float(6, 12),
    opacity: rng.float(0.3, 0.9),
  }))
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {dots.map((d, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            opacity: d.opacity,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
          }}
        />
      ))}
    </div>
  )
}
