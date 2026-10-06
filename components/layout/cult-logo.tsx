import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/** The "C" from the wordmark, for square icon slots. */
export function CultMark({ className }: { className?: string }) {
  return <Image src="/brand/cult-mark.png" alt="" width={256} height={256} className={cn('size-7', className)} aria-hidden />
}

export function CultLogo({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="$CULT — CT Card Universe home"
      className={cn('flex items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring', className)}
    >
      <Image
        src="/brand/cult-wordmark-480.png"
        alt=""
        width={480}
        height={248}
        priority={priority}
        className="h-7 w-auto sm:h-8"
      />
    </Link>
  )
}
