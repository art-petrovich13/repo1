import { ArrowDown, CalendarDays, CalendarSearch, Sparkles, Users } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { api } from '../api/endpoints'
import { friendlyMessage } from '../api/errors'
import type { EventItem, Meta } from '../api/types'
import { EventCard } from '../components/events/EventCard'
import { FiltersBar, type FeedFilters } from '../components/events/FiltersBar'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { EventCardSkeleton } from '../components/ui/Skeleton'
import { useAuth } from '../context/AuthContext'
import { useDictionaries } from '../hooks/useDictionaries'
import { coverOf } from '../lib/event'
import { formatDate, formatTime } from '../lib/format'

const PER_PAGE = 9

/** Фильтры живут в URL — ссылкой можно поделиться, а «Назад» восстанавливает состояние. */
function readFilters(p: URLSearchParams): FeedFilters {
  return {
    q: p.get('q') ?? '',
    category_id: p.get('category_id') ?? '',
    club_id: p.get('club_id') ?? '',
    format: (p.get('format') as FeedFilters['format']) ?? '',
    date_from: p.get('date_from') ?? '',
    date_to: p.get('date_to') ?? '',
    upcoming: p.get('upcoming') !== '0',
    sort: p.get('sort') === 'popularity' ? 'popularity' : 'starts_at',
  }
}

export default function HomePage() {
  const [params, setParams] = useSearchParams()
  const filters = useMemo(() => readFilters(params), [params])
  const { clubs, categories } = useDictionaries()
  const { user } = useAuth()

  const [items, setItems] = useState<EventItem[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [featured, setFeatured] = useState<EventItem[]>([])
  const feedRef = useRef<HTMLDivElement>(null)

  const query = useCallback(
    (page: number) =>
      api.events({
        page,
        per_page: PER_PAGE,
        q: filters.q,
        category_id: filters.category_id ? Number(filters.category_id) : '',
        club_id: filters.club_id ? Number(filters.club_id) : '',
        format: filters.format,
        date_from: filters.date_from,
        date_to: filters.date_to,
        upcoming: filters.upcoming,
        sort: filters.sort,
      }),
    [filters],
  )

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    query(1)
      .then((res) => {
        if (!alive) return
        setItems(res.data)
        setMeta(res.meta)
      })
      .catch((e) => alive && setError(friendlyMessage(e)))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [query, user?.id])

  // Популярные предстоящие — для витрины в hero
  useEffect(() => {
    api.events({ upcoming: true, sort: 'popularity', per_page: 3 }).then((r) => setFeatured(r.data)).catch(() => {})
  }, [])

  const loadMore = async () => {
    if (!meta) return
    setLoadingMore(true)
    try {
      const res = await query(meta.page + 1)
      setItems((prev) => [...prev, ...res.data.filter((e) => !prev.some((p) => p.id === e.id))])
      setMeta(res.meta)
    } catch (e) {
      setError(friendlyMessage(e))
    } finally {
      setLoadingMore(false)
    }
  }

  const update = (patch: Partial<FeedFilters>) => {
    const next = { ...filters, ...patch }
    const p = new URLSearchParams()
    if (next.q) p.set('q', next.q)
    if (next.category_id) p.set('category_id', next.category_id)
    if (next.club_id) p.set('club_id', next.club_id)
    if (next.format) p.set('format', next.format)
    if (next.date_from) p.set('date_from', next.date_from)
    if (next.date_to) p.set('date_to', next.date_to)
    if (!next.upcoming) p.set('upcoming', '0')
    if (next.sort !== 'starts_at') p.set('sort', next.sort)
    setParams(p, { replace: true })
  }

  const hasMore = meta ? meta.page < meta.last_page : false

  return (
    <>
      <Hero featured={featured} clubsCount={clubs.length} onExplore={() => feedRef.current?.scrollIntoView({ behavior: 'smooth' })} />

      <section ref={feedRef} className="scroll-mt-24">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-bold tracking-[0.18em] text-brand uppercase">Афиша</p>
            <h2 className="text-2xl font-semibold sm:text-3xl">{filters.q ? `Результаты по «${filters.q}»` : 'Все мероприятия'}</h2>
          </div>
        </div>

        <FiltersBar value={filters} onChange={update} onReset={() => setParams(new URLSearchParams(), { replace: true })} clubs={clubs} categories={categories} total={loading ? undefined : meta?.total} />

        {error && !loading ? (
          <EmptyState icon={<CalendarSearch />} title="Не удалось загрузить афишу" text={error} action={<Button onClick={() => update({})}>Повторить</Button>} />
        ) : loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<CalendarSearch />}
            title="Ничего не нашлось"
            text="Попробуйте изменить фильтры или снять галочку «Только предстоящие»."
            action={
              <Button variant="secondary" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
                Сбросить фильтры
              </Button>
            }
          />
        ) : (
          <>
            <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {items.map((e, i) => (
                  <EventCard key={e.id} event={e} index={i % PER_PAGE} />
                ))}
              </AnimatePresence>
            </motion.div>
            {hasMore && (
              <div className="mt-10 flex flex-col items-center gap-2">
                <Button variant="outline" size="lg" loading={loadingMore} onClick={loadMore} icon={<ArrowDown className="h-4 w-4" />}>
                  Показать ещё
                </Button>
                <span className="text-xs text-muted">
                  Показано {items.length} из {meta?.total}
                </span>
              </div>
            )}
          </>
        )}
      </section>
    </>
  )
}

function Hero({ featured, clubsCount, onExplore }: { featured: EventItem[]; clubsCount: number; onExplore: () => void }) {
  const { user } = useAuth()
  const words = ['хакатоны', 'турниры', 'спектакли', 'лекции', 'субботники']
  const [w, setW] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setW((x) => (x + 1) % words.length), 2200)
    return () => clearInterval(t)
  }, [words.length])

  return (
    <section className="relative mb-16 grid items-center gap-10 pt-4 lg:grid-cols-[1.15fr_1fr] lg:pt-10">
      <div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-xs font-bold text-muted backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="absolute h-full w-full animate-ping rounded-full bg-success opacity-70" />
            <span className="relative h-2 w-2 rounded-full bg-success" />
          </span>
          Студенческие сообщества публикуют события каждый день
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.6 }} className="text-4xl leading-[1.08] font-bold sm:text-5xl xl:text-6xl">
          Студенческая жизнь
          <br />в одном <span className="text-gradient">пульсе</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }} className="mt-6 max-w-xl text-lg text-muted">
          Находи{' '}
          <motion.span layout className="relative mr-[0.28em] inline-flex overflow-hidden align-bottom font-semibold text-ink">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={words[w]} initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '-100%', opacity: 0 }} transition={{ duration: 0.35 }} className="inline-block">
                {words[w]}
              </motion.span>
            </AnimatePresence>
          </motion.span>{' '}
          и встречи клубов, регистрируйся в один клик и не пропускай важное — мы напомним.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.6 }} className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" onClick={onExplore} icon={<CalendarDays className="h-5 w-5" />}>
            Смотреть афишу
          </Button>
          {!user && (
            <Link to="/register">
              <Button size="lg" variant="outline">
                Создать аккаунт
              </Button>
            </Link>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-10 flex gap-8">
          {[
            { icon: Users, value: clubsCount || '—', label: 'сообществ' },
            { icon: Sparkles, value: '6', label: 'направлений' },
            { icon: CalendarDays, value: '24/7', label: 'афиша онлайн' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label}>
              <p className="flex items-center gap-2 font-display text-2xl font-bold">
                <Icon className="h-5 w-5 text-brand" />
                {value}
              </p>
              <p className="text-sm text-muted">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Витрина — парящие карточки популярных событий */}
      <div className="relative hidden h-[26rem] lg:block">
        {featured.map((e, i) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, y: 40, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: [-6, 5, -2][i] }}
            transition={{ delay: 0.2 + i * 0.12, type: 'spring', stiffness: 120, damping: 14 }}
            whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
            className="absolute w-60"
            style={{ top: ['0%', '8%', '44%'][i], left: ['2%', '46%', '22%'][i], zIndex: [2, 1, 3][i] }}
          >
            <Link to={`/events/${e.id}`} className="card block animate-float overflow-hidden shadow-lift" style={{ animationDelay: `${i * -2}s` }}>
              <img src={coverOf(e)} alt="" className="h-32 w-full object-cover" />
              <div className="p-4">
                <p className="truncate text-[11px] font-bold text-brand uppercase">{e.club?.name}</p>
                <p className="mt-1 line-clamp-2 text-sm font-semibold">{e.title}</p>
                <p className="mt-2 text-xs text-muted">
                  {formatDate(e.starts_at)}, {formatTime(e.starts_at)}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
