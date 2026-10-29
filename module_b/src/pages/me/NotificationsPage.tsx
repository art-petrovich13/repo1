import { Bell, BellRing, CalendarCheck, CalendarClock, CheckCheck, PencilLine, Users, XCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router'
import { api } from '../../api/endpoints'
import { friendlyMessage } from '../../api/errors'
import type { AppNotification, Meta, NotificationType } from '../../api/types'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { Skeleton } from '../../components/ui/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { usePaged } from '../../hooks/usePaged'
import { cn } from '../../lib/cn'
import { NOTIFICATION_LABEL } from '../../lib/event'
import { relative } from '../../lib/format'

const ICONS: Record<NotificationType, { icon: typeof Bell; cls: string }> = {
  registration_confirmed: { icon: CalendarCheck, cls: 'bg-success/12 text-success' },
  event_cancelled: { icon: XCircle, cls: 'bg-danger/12 text-danger' },
  event_changed: { icon: PencilLine, cls: 'bg-warning/15 text-warning' },
  event_reminder: { icon: CalendarClock, cls: 'bg-brand-soft text-brand' },
  event_full: { icon: Users, cls: 'bg-brand-2/12 text-brand-2' },
}

export default function NotificationsPage() {
  const { refreshUnread } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const { items, setItems, meta, loading, error, page, setPage, reload } = usePaged<AppNotification, Meta & { unread_count: number }>((p) => api.notifications({ page: p, per_page: 10 }), [])

  const unread = meta?.unread_count ?? 0

  const open = async (n: AppNotification) => {
    if (!n.is_read) {
      setItems((list) => list.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)))
      api.readNotification(n.id).then(refreshUnread).catch(() => {})
    }
    if (n.event_id) navigate(`/events/${n.event_id}`)
  }

  const readAll = async () => {
    try {
      await api.readAllNotifications()
      setItems((list) => list.map((x) => ({ ...x, is_read: true })))
      refreshUnread()
      reload()
      toast.success('Все уведомления прочитаны')
    } catch (e) {
      toast.error(friendlyMessage(e))
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Личный кабинет"
        title="Уведомления"
        text={unread ? `Непрочитанных: ${unread}` : 'Все уведомления прочитаны'}
        actions={
          unread > 0 && (
            <Button variant="secondary" icon={<CheckCheck className="h-4 w-4" />} onClick={readAll}>
              Прочитать все
            </Button>
          )
        }
      />

      {loading && items.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : error ? (
        <EmptyState icon={<XCircle />} title="Ошибка загрузки" text={error} action={<Button onClick={() => reload()}>Повторить</Button>} />
      ) : items.length === 0 ? (
        <EmptyState icon={<BellRing />} title="Уведомлений нет" text="Здесь появятся подтверждения регистраций, напоминания и изменения в мероприятиях." />
      ) : (
        <>
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {items.map((n, i) => {
                const { icon: Icon, cls } = ICONS[n.type] ?? ICONS.event_reminder
                return (
                  <motion.li key={n.id} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <button
                      onClick={() => open(n)}
                      className={cn(
                        'card group flex w-full cursor-pointer items-start gap-4 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lift sm:p-5',
                        !n.is_read && 'border-brand/30 bg-gradient-to-r from-brand-soft/70 to-surface',
                      )}
                    >
                      <span className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition-transform group-hover:scale-110 group-hover:rotate-6', cls)}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{n.title}</p>
                          <span className="text-xs font-bold tracking-wide text-muted uppercase">{NOTIFICATION_LABEL[n.type]}</span>
                        </div>
                        <p className="mt-1 text-sm text-ink/80">{n.message}</p>
                        <p className="mt-2 text-xs text-muted">{relative(n.created_at)}</p>
                      </div>
                      {!n.is_read && (
                        <span className="relative mt-2 flex h-2.5 w-2.5 shrink-0">
                          <span className="absolute h-full w-full animate-ping rounded-full bg-brand opacity-60" />
                          <span className="relative h-2.5 w-2.5 rounded-full bg-brand" />
                        </span>
                      )}
                    </button>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ul>
          {meta && <Pagination page={page} lastPage={meta.last_page} onChange={setPage} />}
        </>
      )}
    </div>
  )
}
