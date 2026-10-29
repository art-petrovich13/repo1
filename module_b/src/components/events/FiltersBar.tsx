import { CalendarRange, Flame, RotateCcw, Search, SlidersHorizontal, Timer } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import type { Category, Club } from '../../api/types'
import { cn } from '../../lib/cn'

export interface FeedFilters {
  q: string
  category_id: string
  club_id: string
  format: '' | 'offline' | 'online'
  date_from: string
  date_to: string
  upcoming: boolean
  sort: 'starts_at' | 'popularity'
}

interface Props {
  value: FeedFilters
  onChange: (patch: Partial<FeedFilters>) => void
  onReset: () => void
  clubs: Club[]
  categories: Category[]
  total?: number
}

const chip = 'relative cursor-pointer rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors'
const field = 'h-10 rounded-xl border border-line bg-surface px-3 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15'

export function FiltersBar({ value, onChange, onReset, clubs, categories, total }: Props) {
  const [expanded, setExpanded] = useState(Boolean(value.club_id || value.date_from || value.date_to || value.format))
  const [q, setQ] = useState(value.q)
  const activeCount = [value.club_id, value.format, value.date_from, value.date_to].filter(Boolean).length

  return (
    <div className="card mb-8 p-4 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <form
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault()
            onChange({ q: q.trim() })
          }}
        >
          <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onBlur={() => q.trim() !== value.q && onChange({ q: q.trim() })}
            placeholder="Поиск по названию и описанию"
            className="h-12 w-full rounded-2xl border border-line bg-surface-2/60 pr-4 pl-11 text-sm outline-none transition focus:border-brand focus:bg-surface focus:ring-4 focus:ring-brand/15"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Сортировка */}
          <div className="flex rounded-2xl border border-line bg-surface p-1">
            {(
              [
                { v: 'starts_at', label: 'По дате', icon: Timer },
                { v: 'popularity', label: 'Популярные', icon: Flame },
              ] as const
            ).map(({ v, label, icon: Icon }) => (
              <button key={v} onClick={() => onChange({ sort: v })} className={cn('relative flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold', value.sort === v ? 'text-white' : 'text-muted hover:text-ink')}>
                {value.sort === v && <motion.span layoutId="sort-pill" className="absolute inset-0 rounded-xl bg-brand-gradient" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
                <Icon className="relative h-4 w-4" />
                <span className="relative">{label}</span>
              </button>
            ))}
          </div>

          {/* Только предстоящие — переключатель */}
          <button onClick={() => onChange({ upcoming: !value.upcoming })} className="flex cursor-pointer items-center gap-2.5 rounded-2xl border border-line bg-surface px-3 py-2.5 text-sm font-semibold" role="switch" aria-checked={value.upcoming}>
            <span className={cn('relative h-5 w-9 rounded-full transition-colors', value.upcoming ? 'bg-brand' : 'bg-line')}>
              <motion.span layout transition={{ type: 'spring', stiffness: 600, damping: 30 }} className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow', value.upcoming ? 'right-0.5' : 'left-0.5')} />
            </span>
            Только предстоящие
          </button>

          <button
            onClick={() => setExpanded((x) => !x)}
            className={cn('relative flex cursor-pointer items-center gap-2 rounded-2xl border px-3 py-2.5 text-sm font-semibold transition', expanded ? 'border-brand/40 bg-brand-soft text-brand' : 'border-line bg-surface text-ink hover:border-brand/40')}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Фильтры
            {activeCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] text-white">{activeCount}</span>}
          </button>
        </div>
      </div>

      {/* Категории — чипы */}
      <div className="scrollbar-none -mx-1 mt-4 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {[{ id: '', name: 'Все' }, ...categories.map((c) => ({ id: String(c.id), name: c.name }))].map((c) => {
          const active = value.category_id === c.id
          return (
            <button key={c.id || 'all'} onClick={() => onChange({ category_id: c.id })} className={cn(chip, active ? 'text-white' : 'bg-surface-2 text-muted hover:text-ink')}>
              {active && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-brand-gradient shadow-glow" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
              <span className="relative">{c.name}</span>
            </button>
          )
        })}
      </div>

      {/* Расширенные фильтры */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_auto]">
              <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
                Комьюнити
                <select value={value.club_id} onChange={(e) => onChange({ club_id: e.target.value })} className={cn(field, 'cursor-pointer text-ink')}>
                  <option value="">Все Комьюнити</option>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
                Формат
                <select value={value.format} onChange={(e) => onChange({ format: e.target.value as FeedFilters['format'] })} className={cn(field, 'cursor-pointer text-ink')}>
                  <option value="">Любой</option>
                  <option value="offline">Офлайн</option>
                  <option value="online">Онлайн</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
                <span className="flex items-center gap-1"><CalendarRange className="h-3.5 w-3.5" /> С даты</span>
                <input type="date" value={value.date_from} max={value.date_to || undefined} onChange={(e) => onChange({ date_from: e.target.value })} className={cn(field, 'text-ink')} />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
                <span className="flex items-center gap-1"><CalendarRange className="h-3.5 w-3.5" /> По дату</span>
                <input type="date" value={value.date_to} min={value.date_from || undefined} onChange={(e) => onChange({ date_to: e.target.value })} className={cn(field, 'text-ink')} />
              </label>
              <button
                onClick={() => {
                  setQ('')
                  onReset()
                }}
                className="flex h-10 cursor-pointer items-center justify-center gap-2 self-end rounded-xl px-4 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-danger"
              >
                <RotateCcw className="h-4 w-4" /> Сбросить
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {total !== undefined && (
        <p className="mt-3 text-xs font-semibold text-muted">
          Найдено: <span className="text-ink">{total}</span>
        </p>
      )}
    </div>
  )
}
