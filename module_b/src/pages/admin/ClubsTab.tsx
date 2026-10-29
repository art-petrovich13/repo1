import { Pencil, Plus, Trash2, UsersRound } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../../api/endpoints'
import { friendlyMessage, toApiError } from '../../api/errors'
import type { Club } from '../../api/types'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Input, Textarea } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Modal'
import { Skeleton } from '../../components/ui/Skeleton'
import { useToast } from '../../context/ToastContext'
import { invalidateDictionaries } from '../../hooks/useDictionaries'
import { plural } from '../../lib/format'

export function ClubsTab() {
  const toast = useToast()
  const [clubs, setClubs] = useState<Club[] | null>(null)
  const [editing, setEditing] = useState<Club | 'new' | null>(null)
  const [toDelete, setToDelete] = useState<Club | null>(null)

  const load = () => api.clubs().then(setClubs).catch((e) => toast.error(friendlyMessage(e)))
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const remove = async () => {
    if (!toDelete) return
    try {
      await api.admin.deleteClub(toDelete.id)
      toast.info('Комьюнити удалено')
      invalidateDictionaries()
      load()
    } catch (e) {
      toast.error(friendlyMessage(e))
      throw e
    }
  }

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setEditing('new')}>
          Новое Комьюнити
        </Button>
      </div>

      {!clubs ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {clubs.map((c, i) => (
              <motion.div key={c.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }} className="card flex flex-col p-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand">
                    <UsersRound className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{c.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{c.description || 'Без описания'}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  <span className="text-xs font-semibold text-muted">
                    {c.published_events_count ?? 0} {plural(c.published_events_count ?? 0, ['опубликованное мероприятие', 'опубликованных мероприятия', 'опубликованных мероприятий'])}
                  </span>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => setEditing(c)} title="Изменить">
                      <span className="sr-only">Изменить</span>
                    </Button>
                    <Button size="sm" variant="ghost" className="hover:!bg-danger/10 hover:!text-danger" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => setToDelete(c)} title="Удалить">
                      <span className="sr-only">Удалить</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <ClubForm
        club={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          invalidateDictionaries()
          load()
        }}
      />
      <ConfirmDialog
        open={toDelete !== null}
        title="Удалить Комьюнити?"
        text={`«${toDelete?.name}» будет удалено. Комьюнити, у которого есть мероприятия, удалить нельзя.`}
        confirmText="Удалить"
        onConfirm={remove}
        onClose={() => setToDelete(null)}
      />
    </div>
  )
}

function ClubForm({ club, onClose, onSaved }: { club: Club | 'new' | null; onClose: () => void; onSaved: () => void }) {
  const toast = useToast()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (club === null) return
    setName(club === 'new' ? '' : club.name)
    setDescription(club === 'new' ? '' : club.description ?? '')
    setErrors({})
  }, [club])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setErrors({ name: 'Укажите название' })
    setBusy(true)
    try {
      const body = { name: name.trim(), description: description.trim() || null }
      if (club === 'new') await api.admin.createClub(body)
      else if (club) await api.admin.updateClub(club.id, body)
      toast.success(club === 'new' ? 'Комьюнити создано' : 'Изменения сохранены')
      onSaved()
      onClose()
    } catch (err) {
      const apiErr = toApiError(err)
      if (apiErr.code === 'VALIDATION_ERROR') setErrors(Object.fromEntries(Object.entries(apiErr.fields).map(([k, v]) => [k, v[0]])))
      else toast.error(friendlyMessage(apiErr))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={club !== null} onClose={onClose} title={club === 'new' ? 'Новое Комьюнити' : 'Изменить Комьюнити'}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Input label="Название" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} placeholder="Например: Шахматный клуб «Гамбит»" maxLength={150} />
        <Textarea label="Описание" value={description} onChange={(e) => setDescription(e.target.value)} error={errors.description} placeholder="Чем занимается сообщество" className="min-h-24" />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" loading={busy}>
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
  )
}
