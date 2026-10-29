import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type Tone = 'brand' | 'success' | 'muted' | 'danger' | 'warning' | 'pink' | 'glass'

const tones: Record<Tone, string> = {
  brand: 'bg-brand-soft text-brand',
  success: 'bg-success/12 text-success',
  muted: 'bg-surface-2 text-muted',
  danger: 'bg-danger/12 text-danger',
  warning: 'bg-warning/15 text-warning',
  pink: 'bg-brand-2/12 text-brand-2',
  glass: 'bg-black/35 text-white backdrop-blur-md',
}

export function Badge({ tone = 'brand', icon, children, className, pulse }: { tone?: Tone; icon?: ReactNode; children: ReactNode; className?: string; pulse?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap', tones[tone], className)}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
      )}
      {icon}
      {children}
    </span>
  )
}
