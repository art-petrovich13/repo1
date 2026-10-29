import { CalendarCheck, Clock, Globe, Heart, MapPin, Sparkles, Users } from 'lucide-react'
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react'
import type { MouseEvent } from 'react'
import { Link } from 'react-router'
import type { EventItem } from '../../api/types'
import { cn } from '../../lib/cn'
import { STATE_LABEL, STATE_TONE, coverOf, onCoverError, fillPercent } from '../../lib/event'
import { formatDay, formatMonth, formatTime, formatWeekday, plural } from '../../lib/format'
import { Badge } from '../ui/Badge'
import { Progress } from '../ui/Progress'

/** Карточка мероприятия в сетке афиши: 3D-наклон и «блик» за курсором, зум обложки. */
export function EventCard({ event, index = 0 }: { event: EventItem; index?: number }) {
  const rx = useSpring(useMotionValue(0), { stiffness: 250, damping: 20 })
  const ry = useSpring(useMotionValue(0), { stiffness: 250, damping: 20 })
  const gx = useMotionValue(50)
  const gy = useMotionValue(50)
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgb(255 255 255 / 0.18), transparent 55%)`

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    rx.set((0.5 - py) * 6)
    ry.set((px - 0.5) * 8)
    gx.set(px * 100)
    gy.set(py * 100)
  }
  const onLeave = () => {
    rx.set(0)
    ry.set(0)
  }

  const fill = fillPercent(event)
  const inactive = event.state === 'finished' || event.state === 'cancelled'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: Math.min(index, 8) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1000 }}
    >
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="group relative h-full"
      >
        <Link
          to={`/events/${event.id}`}
          className={cn('card relative flex h-full flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lift', inactive && 'opacity-80')}
        >
          {/* Обложка */}
          <div className="relative aspect-[16/10] overflow-hidden">
            <img
              src={coverOf(event)} onError={onCoverError(event)}
              alt=""
              loading="lazy"
              className={cn('h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110', inactive && 'grayscale-[40%]')}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              {event.category && <Badge tone="glass">{event.category.name}</Badge>}
              <Badge tone="glass" icon={event.format === 'online' ? <Globe className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}>
                {event.format === 'online' ? 'Онлайн' : 'Офлайн'}
              </Badge>
            </div>

            {/* Дата-«билет» */}
            <div className="glass absolute top-3 right-3 flex w-14 flex-col items-center rounded-2xl py-1.5 text-center shadow-card">
              <span className="text-[10px] font-bold text-muted uppercase">{formatWeekday(event.starts_at)}</span>
              <span className="font-display text-xl leading-none font-bold text-ink">{formatDay(event.starts_at)}</span>
              <span className="text-[10px] font-bold text-brand uppercase">{formatMonth(event.starts_at)}</span>
            </div>

            <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
              {event.state !== 'scheduled' && (
                <Badge tone={event.state === 'ongoing' ? 'success' : event.state === 'cancelled' ? 'danger' : 'glass'} pulse={event.state === 'ongoing'} className={event.state === 'ongoing' || event.state === 'cancelled' ? 'bg-white/90 dark:bg-black/60' : ''}>
                  {STATE_LABEL[event.state]}
                </Badge>
              )}
              {event.is_full && event.state === 'scheduled' && (
                <Badge tone="danger" className="bg-white/90 dark:bg-black/60">
                  Мест нет
                </Badge>
              )}
            </div>

            {event.is_registered && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 bottom-3">
                <Badge tone="success" icon={<CalendarCheck className="h-3.5 w-3.5" />} className="bg-white/95 shadow-card dark:bg-black/70">
                  Вы идёте
                </Badge>
              </motion.div>
            )}
          </div>

          {/* Содержимое */}
          <div className="flex flex-1 flex-col gap-3 p-5">
            {event.club && <p className="truncate text-xs font-bold tracking-wide text-brand uppercase">{event.club.name}</p>}
            <h3 className="line-clamp-2 font-display text-lg leading-snug font-semibold transition-colors group-hover:text-brand">{event.title}</h3>

            <div className="space-y-1.5 text-sm text-muted">
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" />
                {formatTime(event.starts_at)} – {formatTime(event.ends_at)}
              </p>
              <p className="flex items-center gap-2">
                {event.format === 'online' ? <Globe className="h-4 w-4 shrink-0" /> : <MapPin className="h-4 w-4 shrink-0" />}
                <span className="truncate">{event.format === 'online' ? 'Онлайн-трансляция' : event.location}</span>
              </p>
            </div>

            <div className="mt-auto space-y-3 pt-2">
              {fill !== null && (
                <div>
                  <div className="mb-1.5 flex justify-between text-xs font-semibold">
                    <span className="text-muted">
                      {event.registrations_count} из {event.capacity}
                    </span>
                    <span className={fill >= 100 ? 'text-danger' : fill >= 80 ? 'text-warning' : 'text-brand'}>
                      {fill >= 100 ? 'заполнено' : `осталось ${event.seats_left} ${plural(event.seats_left ?? 0, ['место', 'места', 'мест'])}`}
                    </span>
                  </div>
                  <Progress value={fill} />
                </div>
              )}

              <div className="flex items-center gap-4 border-t border-line pt-3 text-sm font-semibold text-muted">
                <span className="flex items-center gap-1.5" title="Зарегистрировано">
                  <Users className="h-4 w-4" /> {event.registrations_count}
                </span>
                <span className={cn('flex items-center gap-1.5', event.my_reactions?.includes('like') && 'text-brand-2')} title="Нравится">
                  <Heart className={cn('h-4 w-4', event.my_reactions?.includes('like') && 'fill-current')} /> {event.reactions.like}
                </span>
                <span className={cn('flex items-center gap-1.5', event.my_reactions?.includes('interested') && 'text-accent')} title="Интересно">
                  <Sparkles className={cn('h-4 w-4', event.my_reactions?.includes('interested') && 'fill-current')} /> {event.reactions.interested}
                </span>
                {event.state !== 'scheduled' && event.state !== 'ongoing' ? null : (
                  <Badge tone={STATE_TONE[event.state]} className="ml-auto">
                    {event.state === 'ongoing' ? 'Сейчас' : 'Скоро'}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Блик за курсором */}
          <motion.div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: glare }} />
        </Link>
      </motion.div>
    </motion.div>
  )
}
