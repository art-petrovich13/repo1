import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '../../lib/cn'

export function Pagination({ page, lastPage, onChange }: { page: number; lastPage: number; onChange: (page: number) => void }) {
  if (lastPage <= 1) return null

  const pages: Array<number | '…'> = []
  for (let p = 1; p <= lastPage; p++) {
    if (p === 1 || p === lastPage || Math.abs(p - page) <= 1) pages.push(p)
    else if (pages[pages.length - 1] !== '…') pages.push('…')
  }

  const btn = 'grid h-10 min-w-10 cursor-pointer place-items-center rounded-xl px-3 text-sm font-semibold transition'
  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Пагинация">
      <button className={cn(btn, 'text-muted hover:bg-surface-2 disabled:opacity-40')} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Назад">
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`d${i}`} className="px-1 text-muted">
            …
          </span>
        ) : (
          <button key={p} onClick={() => onChange(p)} className={cn(btn, 'relative', p === page ? 'text-white' : 'text-muted hover:bg-surface-2 hover:text-ink')}>
            {p === page && <motion.span layoutId="page-pill" className="absolute inset-0 rounded-xl bg-brand-gradient shadow-glow" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
            <span className="relative">{p}</span>
          </button>
        ),
      )}
      <button className={cn(btn, 'text-muted hover:bg-surface-2 disabled:opacity-40')} disabled={page >= lastPage} onClick={() => onChange(page + 1)} aria-label="Вперёд">
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}
