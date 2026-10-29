import { ArrowLeft, Download, FileText, Users, XCircle } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { api } from '../../api/endpoints'
import { friendlyMessage } from '../../api/errors'
import type { EventItem, Participant, RegistrationStatus } from '../../api/types'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { Progress } from '../../components/ui/Progress'
import { Skeleton } from '../../components/ui/Skeleton'
import { Tabs } from '../../components/ui/Tabs'
import { useToast } from '../../context/ToastContext'
import { usePaged } from '../../hooks/usePaged'
import { REG_STATUS_LABEL, fillPercent } from '../../lib/event'
import { formatRange, formatShort } from '../../lib/format'

const tone: Record<RegistrationStatus, 'success' | 'muted' | 'danger'> = { active: 'success', cancelled: 'muted', cancelled_by_organizer: 'danger' }

export default function ParticipantsPage() {
  const { id } = useParams()
  const toast = useToast()
  const [status, setStatus] = useState<'' | RegistrationStatus>('')
  const [event, setEvent] = useState<EventItem | null>(null)
  const [exporting, setExporting] = useState(false)
  const { items, meta, loading, error, page, setPage, reload } = usePaged((p) => api.participants(id!, { status, page: p, per_page: 10 }), [id, status])

  useEffect(() => {
    api.event(id!).then(setEvent).catch(() => {})
  }, [id])

  /** Выгрузка всех участников (все страницы) в текстовый файл: TXT (таблица) или CSV. */
  const exportList = async (kind: 'txt' | 'csv') => {
    setExporting(true)
    try {
      const all: Participant[] = []
      let p = 1
      let last = 1
      do {
        const res = await api.participants(id!, { status, page: p, per_page: 100 })
        all.push(...res.data)
        last = res.meta.last_page
        p++
      } while (p <= last)

      const header = ['№', 'Имя', 'Специальность', 'Курс', 'Email', 'Время регистрации', 'Статус']
      const rows = all.map((r, i) => [String(i + 1), r.name, r.faculty ?? '', r.course ? String(r.course) : '', r.email, formatShort(r.registered_at), REG_STATUS_LABEL[r.status]])
      let content: string
      if (kind === 'csv') {
        const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
        content = '﻿' + [header, ...rows].map((r) => r.map(esc).join(';')).join('\r\n')
      } else {
        const widths = header.map((h, c) => Math.max(h.length, ...rows.map((r) => r[c].length)))
        const line = (r: string[]) => r.map((v, c) => v.padEnd(widths[c])).join('  ')
        content = [
          `Участники мероприятия: ${event?.title ?? meta?.event.title ?? ''}`,
          event ? `Дата: ${formatRange(event.starts_at, event.ends_at)}` : '',
          `Всего: ${all.length}, активных: ${all.filter((r) => r.status === 'active').length}`,
          '',
          line(header),
          widths.map((w) => '-'.repeat(w)).join('  '),
          ...rows.map(line),
        ].join('\r\n')
      }
      const blob = new Blob([content], { type: kind === 'csv' ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `participants_event_${id}.${kind}`
      a.click()
      URL.revokeObjectURL(a.href)
      toast.success(`Список выгружен (${all.length})`)
    } catch (e) {
      toast.error(friendlyMessage(e))
    } finally {
      setExporting(false)
    }
  }

  const fill = event ? fillPercent(event) : null

  return (
    <div>
      <Link to="/me/events" className="group mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-brand">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Мои мероприятия
      </Link>
      <PageHeader
        eyebrow="Участники"
        title={event?.title ?? meta?.event.title ?? 'Участники'}
        text={event ? formatRange(event.starts_at, event.ends_at) : undefined}
        actions={
          <>
            <Button variant="outline" icon={<FileText className="h-4 w-4" />} loading={exporting} onClick={() => exportList('txt')}>
              Экспорт TXT
            </Button>
            <Button variant="secondary" icon={<Download className="h-4 w-4" />} disabled={exporting} onClick={() => exportList('csv')}>
              CSV
            </Button>
          </>
        }
      />

      {meta && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand">
            <Users className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <p className="font-display text-2xl font-bold">
              {meta.active_count}
              {meta.event.capacity ? <span className="text-base text-muted"> / {meta.event.capacity}</span> : null}
              <span className="ml-2 text-sm font-semibold text-muted">активных регистраций</span>
            </p>
            {fill !== null && <Progress value={fill} className="mt-2 max-w-md" />}
          </div>
        </motion.div>
      )}

      <div className="mb-5">
        <Tabs
          value={status}
          onChange={setStatus}
          items={[
            { value: '', label: 'Все' },
            { value: 'active', label: 'Активные' },
            { value: 'cancelled', label: 'Отменили' },
            { value: 'cancelled_by_organizer', label: 'Отменены организатором' },
          ]}
        />
      </div>

      {loading && items.length === 0 ? (
        <Skeleton className="h-80" />
      ) : error ? (
        <EmptyState icon={<XCircle />} title="Ошибка загрузки" text={error} action={<Button onClick={() => reload()}>Повторить</Button>} />
      ) : items.length === 0 ? (
        <EmptyState icon={<Users />} title="Пока никого" text="Когда студенты зарегистрируются, они появятся в этом списке." />
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-2/60 text-left text-xs font-bold tracking-wide text-muted uppercase">
                  <th className="px-5 py-3">Участник</th>
                  <th className="px-5 py-3">Специальность</th>
                  <th className="px-5 py-3">Курс</th>
                  <th className="px-5 py-3">Время регистрации</th>
                  <th className="px-5 py-3">Статус</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r, i) => (
                  <motion.tr key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.035 }} className="border-b border-line transition-colors last:border-0 hover:bg-surface-2/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.name} size={36} />
                        <div>
                          <p className="font-semibold">{r.name}</p>
                          <p className="text-xs text-muted">{r.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted">{r.faculty ?? '—'}</td>
                    <td className="px-5 py-3">{r.course ? `${r.course} курс` : '—'}</td>
                    <td className="px-5 py-3 text-muted">{formatShort(r.registered_at)}</td>
                    <td className="px-5 py-3">
                      <Badge tone={tone[r.status]}>{REG_STATUS_LABEL[r.status]}</Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && <Pagination page={page} lastPage={meta.last_page} onChange={setPage} />}
        </>
      )}
    </div>
  )
}
