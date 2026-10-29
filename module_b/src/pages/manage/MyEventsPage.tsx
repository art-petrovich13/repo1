import { CalendarPlus, Eye, FileClock, Heart, LayoutGrid, Megaphone, Pencil, Send, Sparkles, Trash2, Users, XCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api } from '../../api/endpoints'
import { friendlyMessage } from '../../api/errors'
import type { EventItem } from '../../api/types'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { Textarea } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { Progress } from '../../components/ui/Progress'
import { Skeleton } from '../../components/ui/Skeleton'
import { Tabs } from '../../components/ui/Tabs'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { usePaged } from '../../hooks/usePaged'
import { STATE_LABEL, STATE_TONE, coverOf, fillPercent } from '../../lib/event'
import { formatDate, formatTime } from '../../lib/format'

type StatusFilter = '' | 'draft' | 'published' | 'cancelled'
type Action = { kind: 'publish' | 'cancel' | 'delete'; event: EventItem }

export default function MyEventsPage() {
  const { user } = useAuth()
  const toast = useToast()
  const clubs = user?.clubs.filter((c) => c.verified) ?? []
  const [status, setStatus] = useState<StatusFilter>('')
  const [clubId, setClubId] = useState<number | ''>('')
  const [action, setAction] = useState<Action | null>(null)
  const [reason, setReason] = useState('')
  const [counts, setCounts] = useState({ all: 0, draft: 0, published: 0, cancelled: 0 })

  const { items, meta, loading, error, page, setPage, reload } = usePaged((p) => api.myEvents({ status, club_id: clubId, page: p, per_page: 8 }), [status, clubId])

  // Счётчики по статусам для вкладок и плиток статистики
  const loadCounts = () =>
    Promise.all((['', 'draft', 'published', 'cancelled'] as const).map((s) => api.myEvents({ status: s, club_id: clubId, per_page: 1 }).then((r) => r.meta.total)))
      .then(([all, draft, published, cancelled]) => setCounts({ all, draft, published, cancelled }))
      .catch(() => {})
  useEffect(() => {
    loadCounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId])

  const totalRegs = items.reduce((s, e) => s + e.registrations_count, 0)

  const run = async () => {
    if (!action) return
    const { kind, event } = action
    try {
      if (kind === 'publish') {
        await api.publishEvent(event.id)
        toast.success(`«${event.title}» опубликовано — теперь его видят все`)
      } else if (kind === 'cancel') {
        await api.cancelEvent(event.id, reason.trim())
        toast.info('Мероприятие отменено, участники получили уведомления')
      } else {
        await api.deleteEvent(event.id)
        toast.info('Черновик удалён')
      }
      reload()
      loadCounts()
    } catch (e) {
      toast.error(friendlyMessage(e))
      throw e
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Представитель Комьюнити"
        title="Мои мероприятия"
        text={`Управляйте событиями ${clubs.length > 1 ? 'ваших Комьюнити' : clubs[0]?.name ?? ''}: публикуйте черновики, редактируйте, отменяйте и смотрите участников.`}
        actions={
          <Button to="/me/events/new" icon={<CalendarPlus className="h-4 w-4" />}>Создать мероприятие</Button>
        }
      />

      {/* Плитки статистики */}
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Всего', value: counts.all, icon: LayoutGrid, cls: 'bg-brand-soft text-brand' },
          { label: 'Опубликовано', value: counts.published, icon: Megaphone, cls: 'bg-success/12 text-success' },
          { label: 'Черновики', value: counts.draft, icon: FileClock, cls: 'bg-warning/15 text-warning' },
          { label: 'Регистраций на странице', value: totalRegs, icon: Users, cls: 'bg-brand-2/12 text-brand-2' },
        ].map(({ label, value, icon: Icon, cls }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="card flex items-center gap-4 p-4 sm:p-5">
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${cls}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-2xl font-bold">
                <AnimatedNumber value={value} />
              </p>
              <p className="text-xs font-semibold text-muted">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={status}
          onChange={setStatus}
          items={[
            { value: '', label: 'Все', count: counts.all },
            { value: 'draft', label: 'Черновики', count: counts.draft },
            { value: 'published', label: 'Опубликованные', count: counts.published },
            { value: 'cancelled', label: 'Отменённые', count: counts.cancelled },
          ]}
        />
        {clubs.length > 1 && (
          <select value={clubId} onChange={(e) => setClubId(e.target.value ? Number(e.target.value) : '')} className="h-11 cursor-pointer rounded-2xl border border-line bg-surface px-4 text-sm font-semibold outline-none focus:border-brand">
            <option value="">Все мои Комьюнити</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading && items.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : error ? (
        <EmptyState icon={<XCircle />} title="Ошибка загрузки" text={error} action={<Button onClick={() => reload()}>Повторить</Button>} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<CalendarPlus />}
          title="Мероприятий нет"
          text="Создайте первое мероприятие — оно сохранится как черновик, а опубликовать его можно в один клик."
          action={
            <Button to="/me/events/new">Создать мероприятие</Button>
          }
        />
      ) : (
        <>
          <div className="card overflow-hidden">
            {/* Заголовок таблицы (десктоп) */}
            <div className="hidden grid-cols-[2.4fr_1.1fr_1fr_1.3fr_auto] gap-4 border-b border-line bg-surface-2/60 px-5 py-3 text-xs font-bold tracking-wide text-muted uppercase xl:grid">
              <span>Мероприятие</span>
              <span>Дата</span>
              <span>Статус</span>
              <span>Регистрации и реакции</span>
              <span className="w-[248px] text-right">Действия</span>
            </div>
            <AnimatePresence initial={false}>
              {items.map((e, i) => {
                const fill = fillPercent(e)
                return (
                  <motion.div
                    key={e.id}
                    layout
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="grid gap-4 border-b border-line px-4 py-4 transition-colors last:border-0 hover:bg-surface-2/40 sm:px-5 sm:grid-cols-2 xl:grid-cols-[2.4fr_1.1fr_1fr_1.3fr_auto] xl:items-center"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <img src={coverOf(e)} alt="" className="h-14 w-20 shrink-0 rounded-xl object-cover" />
                      <div className="min-w-0">
                        <Link to={`/events/${e.id}`} className="line-clamp-1 font-semibold transition hover:text-brand">
                          {e.title}
                        </Link>
                        <p className="truncate text-xs text-muted">
                          {e.club?.name} · {e.category?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold">{formatDate(e.starts_at)}</p>
                      <p className="text-muted">
                        {formatTime(e.starts_at)} – {formatTime(e.ends_at)}
                      </p>
                    </div>
                    <div>
                      <Badge tone={STATE_TONE[e.state]} pulse={e.state === 'ongoing'}>
                        {STATE_LABEL[e.state]}
                      </Badge>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-3 font-semibold text-muted">
                        <span className="flex items-center gap-1 text-ink">
                          <Users className="h-4 w-4" />
                          {e.registrations_count}
                          {e.capacity ? `/${e.capacity}` : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5" />
                          {e.reactions.like}
                        </span>
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5" />
                          {e.reactions.interested}
                        </span>
                      </div>
                      {fill !== null && e.status !== 'draft' && <Progress value={fill} className="h-1.5 max-w-40" />}
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:col-span-2 xl:col-span-1 xl:w-[248px] xl:justify-end">
                      {e.status === 'draft' && (
                        <Button size="sm" variant="success" icon={<Send className="h-3.5 w-3.5" />} onClick={() => setAction({ kind: 'publish', event: e })}>
                          Опубликовать
                        </Button>
                      )}
                      {e.status !== 'cancelled' && (
                        <Button to={`/me/events/${e.id}/edit`} title="Редактировать" size="sm" variant="outline" icon={<Pencil className="h-3.5 w-3.5" />}>
                            <span className="xl:sr-only">Редактировать</span>
                          </Button>
                      )}
                      {e.status !== 'draft' && (
                        <Button to={`/me/events/${e.id}/participants`} title="Участники" size="sm" variant="outline" icon={<Users className="h-3.5 w-3.5" />}>
                            <span className="xl:sr-only">Участники</span>
                          </Button>
                      )}
                      {e.status === 'draft' && (
                        <Button to={`/events/${e.id}`} title="Предпросмотр" size="sm" variant="outline" icon={<Eye className="h-3.5 w-3.5" />}>
                            <span className="xl:sr-only">Предпросмотр</span>
                          </Button>
                      )}
                      {e.status === 'published' && e.state !== 'finished' && (
                        <Button size="sm" variant="ghost" className="hover:!bg-danger/10 hover:!text-danger" icon={<XCircle className="h-3.5 w-3.5" />} onClick={() => (setReason(''), setAction({ kind: 'cancel', event: e }))}>
                          Отменить
                        </Button>
                      )}
                      {e.status === 'draft' && (
                        <Button size="sm" variant="ghost" className="hover:!bg-danger/10 hover:!text-danger" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => setAction({ kind: 'delete', event: e })} title="Удалить черновик">
                          <span className="xl:sr-only">Удалить</span>
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
          {meta && <Pagination page={page} lastPage={meta.last_page} onChange={setPage} />}
        </>
      )}

      <ConfirmDialog
        open={action?.kind === 'publish'}
        title="Опубликовать мероприятие?"
        text={`«${action?.event.title}» появится в общей афише, и студенты смогут на него зарегистрироваться.`}
        confirmText="Опубликовать"
        tone="primary"
        onConfirm={run}
        onClose={() => setAction(null)}
      />
      <ConfirmDialog
        open={action?.kind === 'delete'}
        title="Удалить черновик?"
        text={`Черновик «${action?.event.title}» будет удалён без возможности восстановления.`}
        confirmText="Удалить"
        onConfirm={run}
        onClose={() => setAction(null)}
      />
      <ConfirmDialog
        open={action?.kind === 'cancel'}
        title="Отменить мероприятие?"
        text={`Все ${action?.event.registrations_count ?? 0} участников получат уведомление об отмене «${action?.event.title}».`}
        confirmText="Отменить мероприятие"
        onConfirm={run}
        onClose={() => setAction(null)}
        confirmDisabled={reason.trim().length < 3}
      >
        <div className="mt-4">
          <Textarea label="Причина отмены" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Например: аудитория закрыта на ремонт, мероприятие переносится" className="min-h-24" hint="Обязательно — участники увидят её в уведомлении" />
        </div>
      </ConfirmDialog>
    </div>
  )
}
