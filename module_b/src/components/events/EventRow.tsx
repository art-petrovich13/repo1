import { Globe, MapPin } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { EventItem } from '../../api/types'
import { coverOf, onCoverError } from '../../lib/event'
import { formatDay, formatMonth, formatTime, formatWeekday } from '../../lib/format'

/** Горизонтальная карточка мероприятия для списков личного кабинета. */
export function EventRow({ event, badges, actions, index = 0, meta }: { event: EventItem; badges?: ReactNode; actions?: ReactNode; index?: number; meta?: ReactNode }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0, transition: { duration: 0.3 } }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="card group flex flex-col gap-4 overflow-hidden p-3 transition-shadow hover:shadow-lift sm:flex-row sm:items-center sm:p-4"
    >
      <Link to={`/events/${event.id}`} className="relative block h-36 shrink-0 overflow-hidden rounded-2xl sm:h-24 sm:w-40">
        <img src={coverOf(event)} onError={onCoverError(event)} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="glass absolute top-2 left-2 rounded-xl px-2 py-1 text-center leading-none">
          <p className="text-[9px] font-bold text-muted uppercase">{formatWeekday(event.starts_at)}</p>
          <p className="font-display text-base font-bold">{formatDay(event.starts_at)}</p>
          <p className="text-[9px] font-bold text-brand uppercase">{formatMonth(event.starts_at)}</p>
        </div>
      </Link>
      <div className="min-w-0 flex-1 px-1 sm:px-0">
        <div className="mb-1.5 flex flex-wrap gap-1.5">{badges}</div>
        <Link to={`/events/${event.id}`} className="line-clamp-1 font-display text-base font-semibold transition-colors hover:text-brand">
          {event.title}
        </Link>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <span>{event.club?.name}</span>
          <span className="flex items-center gap-1">
            {formatTime(event.starts_at)} – {formatTime(event.ends_at)}
          </span>
          <span className="flex min-w-0 items-center gap-1">
            {event.format === 'online' ? <Globe className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
            <span className="truncate">{event.format === 'online' ? 'Онлайн' : event.location}</span>
          </span>
        </p>
        {meta && <div className="mt-1.5 text-xs text-muted">{meta}</div>}
      </div>
      {actions && <div className="flex shrink-0 gap-2 px-1 pb-1 sm:px-0 sm:pb-0">{actions}</div>}
    </motion.div>
  )
}
