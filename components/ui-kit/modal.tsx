'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={title}
      className={cn(
        'm-auto w-[calc(100%-2rem)] max-w-lg overflow-visible bg-transparent p-0 text-foreground backdrop:bg-black/75 backdrop:backdrop-blur-sm open:animate-in open:fade-in-0 open:zoom-in-95',
        className,
      )}
    >
      {open && (
        <div className="relative max-h-[85dvh] overflow-y-auto rounded-2xl border border-white/10 bg-popover/95 p-6 shadow-2xl sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-display text-xl font-bold uppercase tracking-wide">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 -mt-1 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <X className="size-5" aria-hidden />
              <span className="sr-only">Close</span>
            </button>
          </div>
          <div className="mt-5">{children}</div>
        </div>
      )}
    </dialog>
  )
}
