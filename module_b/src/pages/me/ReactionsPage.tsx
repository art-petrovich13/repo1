import { Heart, HeartOff, Sparkles, XCircle } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { api } from '../../api/endpoints'
import { friendlyMessage } from '../../api/errors'
import type { MyReaction, ReactionType } from '../../api/types'
import { EventRow } from '../../components/events/EventRow'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { Skeleton } from '../../components/ui/Skeleton'
import { Tabs } from '../../components/ui/Tabs'
import { useToast } from '../../context/ToastContext'
import { usePaged } from '../../hooks/usePaged'
import { formatShort } from '../../lib/format'

export default function ReactionsPage() {
  const toast = useToast()
  const [type, setType] = useState<'' | ReactionType>('')
  const [removing, setRemoving] = useState<number | null>(null)
  const { items, setItems, meta, loading, error, page, setPage, reload } = usePaged((p) => api.myReactions({ type, page: p, per_page: 10 }), [type])

  const remove = async (r: MyReaction) => {
    setRemoving(r.id)
    try {
      await api.unreact(r.event_id, r.type)
      setItems((list) => list.filter((x) => x.id !== r.id))
      toast.info(r.type === 'like' ? 'Убрали из «Нравится»' : 'Убрали из «Интересно»')
      setTimeout(() => reload(), 350)
    } catch (e) {
      toast.error(friendlyMessage(e))
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Личный кабинет" title="Мои реакции" text="Мероприятия, которые вам понравились или показались интересными." />
      <div className="mb-6">
        <Tabs
          value={type}
          onChange={setType}
          items={[
            { value: '', label: 'Все' },
            { value: 'like', label: '❤ Нравится' },
            { value: 'interested', label: '✦ Интересно' },
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
          icon={<Heart />}
          title="Реакций пока нет"
          text="Отмечайте мероприятия кнопками «Нравится» и «Интересно» — они появятся здесь."
          action={
            <Button to="/">В афишу</Button>
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
                  r.type === 'like' ? (
                    <Badge tone="pink" icon={<Heart className="h-3 w-3 fill-current" />}>
                      Нравится
                    </Badge>
                  ) : (
                    <Badge tone="warning" icon={<Sparkles className="h-3 w-3" />}>
                      Интересно
                    </Badge>
                  )
                }
                meta={<>Отмечено: {formatShort(r.created_at)}</>}
                actions={
                  <Button variant="ghost" size="sm" loading={removing === r.id} icon={<HeartOff className="h-4 w-4" />} onClick={() => remove(r)}>
                    Снять реакцию
                  </Button>
                }
              />
            ))}
          </AnimatePresence>
          {meta && <Pagination page={page} lastPage={meta.last_page} onChange={setPage} />}
        </div>
      )}
    </div>
  )
}
