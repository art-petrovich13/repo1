import { CalendarCheck, CalendarX2, CheckCircle2, History, XCircle } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { Link } from 'react-router'
import { api } from '../../api/endpoints'
import { friendlyMessage } from '../../api/errors'
import type { Registration } from '../../api/types'
import { EventRow } from '../../components/events/EventRow'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { Skeleton } from '../../components/ui/Skeleton'
import { Tabs } from '../../components/ui/Tabs'
import { useToast } from '../../context/ToastContext'
import { usePaged } from '../../hooks/usePaged'
import { REG_STATUS_LABEL } from '../../lib/event'
import { formatShort } from '../../lib/format'

type Period = 'upcoming' | 'past'

export default function RegistrationsPage() {
  const toast = useToast()
  const [period, setPeriod] = useState<Period>('upcoming')
  const [toCancel, setToCancel] = useState<Registration | null>(null)
  const { items, setItems, meta, loading, error, page, setPage, reload } = usePaged((p) => api.myRegistrations({ period, page: p, per_page: 8 }), [period])

  const cancel = async () => {
    if (!toCancel) return
    try {
      await api.unregister(toCancel.event_id)
      setItems((list) => list.filter((r) => r.id !== toCancel.id))
      toast.info('Регистрация отменена')
      setTimeout(() => reload(), 350)
    } catch (e) {
      toast.error(friendlyMessage(e))
      throw e
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Личный кабинет" title="Мои регистрации" text="Мероприятия, на которые вы записались. Посещёнными считаются прошедшие мероприятия с активной регистрацией." />

      <div className="mb-6">
        <Tabs
          value={period}
          onChange={setPeriod}
          items={[
            { value: 'upcoming', label: 'Предстоящие' },
            { value: 'past', label: 'Прошедшие' },
          ]}
        />
      </div>

      {loading && items.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : error ? (
        <EmptyState icon={<XCircle />} title="Ошибка загрузки" text={error} action={<Button onClick={() => reload()}>Повторить</Button>} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={period === 'upcoming' ? <CalendarX2 /> : <History />}
          title={period === 'upcoming' ? 'Нет предстоящих регистраций' : 'Пока нет посещённых мероприятий'}
          text={period === 'upcoming' ? 'Найдите интересное событие в афише и нажмите «Пойду».' : 'Здесь появятся прошедшие мероприятия, на которые вы были зарегистрированы.'}
          action={
            <Link to="/">
              <Button>Перейти в афишу</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false} mode="popLayout">
            {items.map((r, i) => (
              <EventRow
                key={r.id}
                index={i}
                event={r.event}
                badges={
                  <>
                    {r.is_visited ? (
                      <Badge tone="success" icon={<CheckCircle2 className="h-3 w-3" />}>
                        Посещено
                      </Badge>
                    ) : (
                      <Badge tone={r.status === 'active' ? 'brand' : 'danger'} icon={r.status === 'active' ? <CalendarCheck className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}>
                        {REG_STATUS_LABEL[r.status]}
                      </Badge>
                    )}
                    {r.event.state === 'cancelled' && <Badge tone="danger">Мероприятие отменено</Badge>}
                  </>
                }
                meta={<>Зарегистрирован(а): {formatShort(r.registered_at)}</>}
                actions={
                  r.can_cancel ? (
                    <Button variant="outline" size="sm" className="hover:!border-danger/50 hover:!text-danger" onClick={() => setToCancel(r)}>
                      Отменить регистрацию
                    </Button>
                  ) : undefined
                }
              />
            ))}
          </AnimatePresence>
          {meta && <Pagination page={page} lastPage={meta.last_page} onChange={setPage} />}
        </div>
      )}

      <ConfirmDialog
        open={toCancel !== null}
        title="Отменить регистрацию?"
        text={toCancel ? `Вы больше не будете участником «${toCancel.event.title}».` : ''}
        confirmText="Отменить регистрацию"
        onConfirm={cancel}
        onClose={() => setToCancel(null)}
      />
    </div>
  )
}
