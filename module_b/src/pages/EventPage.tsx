import { ArrowLeft, Ban, CalendarClock, CalendarDays, CheckCircle2, Clock, ExternalLink, Globe, Hourglass, MapPin, Settings2, Tag, Users, XCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { api } from '../api/endpoints'
import { ApiError, friendlyMessage, toApiError } from '../api/errors'
import type { EventItem, ReactionType } from '../api/types'
import { ReactionButton } from '../components/events/ReactionButton'
import { AnimatedNumber } from '../components/ui/AnimatedNumber'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { Progress } from '../components/ui/Progress'
import { Skeleton } from '../components/ui/Skeleton'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { cn } from '../lib/cn'
import { STATE_LABEL, STATE_TONE, coverOf, onCoverError, fillPercent } from '../lib/event'
import { formatDate, formatRange, formatTime, plural, relative } from '../lib/format'

export default function EventPage() {
  const { id } = useParams()
  const { user, refreshUnread } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [event, setEvent] = useState<EventItem | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [busy, setBusy] = useState<null | 'register' | ReactionType>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)

  useEffect(() => {
    let alive = true
    setEvent(null)
    setError(null)
    api
      .event(id!)
      .then((e) => alive && setEvent(e))
      .catch((e) => alive && setError(toApiError(e)))
    return () => {
      alive = false
    }
  }, [id, user?.id])

  /** Обработка ошибок действий: 401 → вход, остальное → понятное сообщение. */
  const handleError = (e: unknown) => {
    const err = toApiError(e)
    if (err.status === 401) {
      toast.info('Войдите, чтобы продолжить')
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    toast.error(friendlyMessage(err))
    // Состояние могло измениться (места закончились, мероприятие отменено) — обновим карточку
    if (err.status === 409) api.event(id!).then(setEvent).catch(() => {})
  }

  const requireUser = () => {
    if (user) return true
    toast.info('Войдите или зарегистрируйтесь, чтобы участвовать')
    navigate('/login', { state: { from: location.pathname } })
    return false
  }

  const register = async () => {
    if (!event || !requireUser()) return
    setBusy('register')
    try {
      const res = await api.registerFor(event.id)
      setEvent(res.data)
      toast.success('Вы зарегистрированы! Ждём вас 🎉')
      refreshUnread()
    } catch (e) {
      handleError(e)
    } finally {
      setBusy(null)
    }
  }

  const unregister = async () => {
    if (!event) return
    try {
      const res = await api.unregister(event.id)
      setEvent(res.data)
      toast.info('Регистрация отменена')
    } catch (e) {
      handleError(e)
      throw e
    }
  }

  const toggleReaction = async (type: ReactionType) => {
    if (!event || !requireUser()) return
    const active = event.my_reactions?.includes(type)
    // Оптимистичное обновление
    setEvent({
      ...event,
      my_reactions: active ? event.my_reactions!.filter((t) => t !== type) : [...(event.my_reactions ?? []), type],
      reactions: { ...event.reactions, [type]: event.reactions[type] + (active ? -1 : 1) },
    })
    setBusy(type)
    try {
      const res = active ? await api.unreact(event.id, type) : await api.react(event.id, type)
      setEvent(res.data)
    } catch (e) {
      setEvent(event)
      handleError(e)
    } finally {
      setBusy(null)
    }
  }

  if (error) {
    return (
      <EmptyState
        icon={<XCircle />}
        title={error.status === 404 ? 'Мероприятие не найдено' : 'Не удалось загрузить'}
        text={error.status === 404 ? 'Возможно, оно ещё не опубликовано или было удалено.' : friendlyMessage(error)}
        action={
          <Button to="/">В афишу</Button>
        }
      />
    )
  }

  if (!event) return <EventSkeleton />

  const fill = fillPercent(event)
  const started = event.state === 'ongoing' || event.state === 'finished'

  return (
    <div>
      <button onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))} className="group mb-5 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-muted transition hover:text-brand">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Назад
      </button>

      {/* Обложка-герой */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="relative mb-8 overflow-hidden rounded-[2rem] shadow-lift">
        <motion.img initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} src={coverOf(event)} onError={onCoverError(event)} alt="" className={cn('h-64 w-full object-cover sm:h-80 lg:h-96', event.state === 'cancelled' && 'grayscale')} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge tone={STATE_TONE[event.state]} pulse={event.state === 'ongoing'} className="bg-white/90 dark:bg-black/60">
              {STATE_LABEL[event.state]}
            </Badge>
            {event.category && <Badge tone="glass" icon={<Tag className="h-3 w-3" />}>{event.category.name}</Badge>}
            <Badge tone="glass" icon={event.format === 'online' ? <Globe className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}>
              {event.format === 'online' ? 'Онлайн' : 'Офлайн'}
            </Badge>
          </div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-4xl text-3xl leading-tight font-bold text-white sm:text-5xl">
            {event.title}
          </motion.h1>
          {event.club && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-3 font-semibold text-white/80">
              {event.club.name}
            </motion.p>
          )}
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Баннеры состояний */}
          {event.state === 'cancelled' && (
            <Banner tone="danger" icon={<Ban className="h-5 w-5" />} title="Мероприятие отменено">
              {event.cancel_reason ? `Причина: ${event.cancel_reason}` : 'Организатор отменил мероприятие.'}
            </Banner>
          )}
          {event.state === 'finished' && (
            <Banner tone="muted" icon={<Hourglass className="h-5 w-5" />} title="Мероприятие прошло">
              Оно завершилось {formatDate(event.ends_at)} в {formatTime(event.ends_at)}. Следите за новыми событиями в афише.
            </Banner>
          )}
          {event.state === 'ongoing' && (
            <Banner tone="success" icon={<CalendarClock className="h-5 w-5" />} title="Идёт прямо сейчас">
              Мероприятие началось {relative(event.starts_at)} и продлится до {formatTime(event.ends_at)}.
            </Banner>
          )}
          {event.status === 'draft' && (
            <Banner tone="warning" icon={<Settings2 className="h-5 w-5" />} title="Черновик">
              Мероприятие видно только представителям Комьюнити. Опубликуйте его в разделе «Мои мероприятия».
            </Banner>
          )}

          {/* Детали */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid gap-3 sm:grid-cols-2">
            <Detail icon={<CalendarDays />} label="Дата" value={formatRange(event.starts_at, event.ends_at)} />
            <Detail icon={<Clock />} label="Начало" value={`${formatTime(event.starts_at)} · ${relative(event.starts_at)}`} />
            <Detail
              icon={event.format === 'online' ? <Globe /> : <MapPin />}
              label={event.format === 'online' ? 'Ссылка на трансляцию' : 'Место'}
              value={
                event.format === 'online' && /^https?:\/\//.test(event.location) ? (
                  <a href={event.location} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 break-all text-brand hover:underline">
                    {event.location} <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                ) : (
                  event.location
                )
              }
            />
            <Detail icon={<Users />} label="Вместимость" value={event.capacity ? `${event.capacity} ${plural(event.capacity, ['место', 'места', 'мест'])}` : 'Без ограничений'} />
          </motion.div>

          <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card p-6 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold">О мероприятии</h2>
            <div className="space-y-3 leading-relaxed whitespace-pre-line text-ink/85">{event.description}</div>
          </motion.article>
        </div>

        {/* Панель участия */}
        <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:sticky lg:top-24 lg:self-start">
          <div className="card space-y-5 p-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-semibold text-muted">Зарегистрировано</p>
                <p className="font-display text-4xl font-bold">
                  <AnimatedNumber value={event.registrations_count} />
                  {event.capacity && <span className="text-xl text-muted"> / {event.capacity}</span>}
                </p>
              </div>
              {fill !== null && event.state !== 'cancelled' && (
                <Badge tone={fill >= 100 ? 'danger' : fill >= 80 ? 'warning' : 'brand'}>{fill >= 100 ? 'Мест нет' : `Осталось ${event.seats_left}`}</Badge>
              )}
            </div>
            {fill !== null && event.state !== 'cancelled' && <Progress value={fill} className="h-3" />}

            <RegisterAction event={event} busy={busy === 'register'} started={started} onRegister={register} onUnregister={() => setConfirmCancel(true)} />

            <div className="flex gap-2">
              <ReactionButton type="like" active={Boolean(event.my_reactions?.includes('like'))} count={event.reactions.like} onToggle={() => toggleReaction('like')} disabled={busy === 'like' || event.state === 'cancelled'} />
              <ReactionButton type="interested" active={Boolean(event.my_reactions?.includes('interested'))} count={event.reactions.interested} onToggle={() => toggleReaction('interested')} disabled={busy === 'interested' || event.state === 'cancelled'} />
            </div>
            <p className="text-center text-xs text-muted">Реакции помогают организаторам понять интерес к событию</p>
          </div>

          {event.can_manage && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card mt-4 space-y-3 border-brand/30 bg-brand-soft/40 p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-brand">
                <Settings2 className="h-4 w-4" /> Вы представитель этого Комьюнити
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button to={`/me/events/${event.id}/edit`} variant="primary" size="sm" className="w-full">
                    Управление мероприятием
                  </Button>
                <Button to={`/me/events/${event.id}/participants`} variant="outline" size="sm" className="w-full">
                    Участники
                  </Button>
              </div>
            </motion.div>
          )}
        </motion.aside>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Отменить регистрацию?"
        text={`Вы больше не будете участником «${event.title}». Зарегистрироваться снова можно, пока есть свободные места.`}
        confirmText="Отменить регистрацию"
        onConfirm={unregister}
        onClose={() => setConfirmCancel(false)}
      />
    </div>
  )
}

function RegisterAction({ event, busy, started, onRegister, onUnregister }: { event: EventItem; busy: boolean; started: boolean; onRegister: () => void; onUnregister: () => void }) {
  if (event.state === 'cancelled') {
    return (
      <Button variant="outline" size="lg" className="w-full" disabled icon={<Ban className="h-5 w-5" />}>
        Мероприятие отменено
      </Button>
    )
  }
  if (event.is_registered) {
    return (
      <div className="space-y-2">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center justify-center gap-2 rounded-2xl bg-success/12 py-3.5 font-bold text-success">
          <CheckCircle2 className="h-5 w-5" /> {started ? 'Вы участник' : 'Вы идёте!'}
        </motion.div>
        {!started && (
          <button onClick={onUnregister} className="w-full cursor-pointer py-1 text-sm font-semibold text-muted transition hover:text-danger">
            Отменить регистрацию
          </button>
        )}
      </div>
    )
  }
  if (started) {
    return (
      <Button variant="outline" size="lg" className="w-full" disabled icon={<Hourglass className="h-5 w-5" />}>
        {event.state === 'ongoing' ? 'Регистрация закрыта — уже идёт' : 'Мероприятие прошло'}
      </Button>
    )
  }
  if (event.is_full) {
    return (
      <Button variant="outline" size="lg" className="w-full" disabled icon={<Users className="h-5 w-5" />}>
        Мест нет
      </Button>
    )
  }
  return (
    <Button size="lg" className="w-full text-base" loading={busy} onClick={onRegister} icon={<CheckCircle2 className="h-5 w-5" />}>
      Пойду
    </Button>
  )
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="card flex items-start gap-4 p-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-bold tracking-wide text-muted uppercase">{label}</p>
        <div className="mt-0.5 text-sm font-semibold">{value}</div>
      </div>
    </div>
  )
}

function Banner({ tone, icon, title, children }: { tone: 'danger' | 'success' | 'muted' | 'warning'; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  const tones = {
    danger: 'border-danger/30 bg-danger/8 text-danger',
    success: 'border-success/30 bg-success/8 text-success',
    muted: 'border-line bg-surface-2 text-muted',
    warning: 'border-warning/40 bg-warning/10 text-warning',
  }
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={cn('flex gap-3 rounded-3xl border p-5', tones[tone])}>
        <span className="mt-0.5 shrink-0">{icon}</span>
        <div>
          <p className="font-bold">{title}</p>
          <p className="mt-1 text-sm text-ink/80">{children}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

function EventSkeleton() {
  return (
    <div>
      <Skeleton className="mb-5 h-5 w-20" />
      <Skeleton className="mb-8 h-64 w-full rounded-[2rem] sm:h-96" />
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <Skeleton className="h-56" />
        </div>
        <Skeleton className="h-80" />
      </div>
    </div>
  )
}
