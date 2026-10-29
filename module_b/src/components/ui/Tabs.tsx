import { motion } from 'motion/react'
import { useId } from 'react'
import { cn } from '../../lib/cn'

export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: Array<{ value: T; label: string; count?: number }> }) {
  const id = useId()
  return (
    <div className="scrollbar-none inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-line bg-surface p-1">
      {items.map((it) => (
        <button
          key={it.value}
          onClick={() => onChange(it.value)}
          className={cn('relative cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors', value === it.value ? 'text-white' : 'text-muted hover:text-ink')}
        >
          {value === it.value && <motion.span layoutId={`tab-${id}`} className="absolute inset-0 rounded-xl bg-brand-gradient" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
          <span className="relative">
            {it.label}
            {it.count !== undefined && <span className="ml-1.5 opacity-70">{it.count}</span>}
          </span>
        </button>
      ))}
    </div>
  )
}
