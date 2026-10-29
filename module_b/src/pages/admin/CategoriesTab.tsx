import { Check, FolderTree, Pencil, Plus, Trash2, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../../api/endpoints'
import { friendlyMessage, toApiError } from '../../api/errors'
import type { Category } from '../../api/types'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Skeleton } from '../../components/ui/Skeleton'
import { useToast } from '../../context/ToastContext'
import { invalidateDictionaries } from '../../hooks/useDictionaries'

export function CategoriesTab() {
  const toast = useToast()
  const [items, setItems] = useState<Category[] | null>(null)
  const [newName, setNewName] = useState('')
  const [newError, setNewError] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [toDelete, setToDelete] = useState<Category | null>(null)
  const [busy, setBusy] = useState(false)

  const load = () => api.categories().then(setItems).catch((e) => toast.error(friendlyMessage(e)))
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const changed = () => {
    invalidateDictionaries()
    load()
  }

  const create = async (e: FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return setNewError('Введите название')
    setBusy(true)
    try {
      await api.admin.createCategory(newName.trim())
      toast.success('Категория добавлена')
      setNewName('')
      setNewError('')
      changed()
    } catch (err) {
      setNewError(toApiError(err).field('name') ?? friendlyMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const rename = async (id: number) => {
    if (!editName.trim()) return
    try {
      await api.admin.updateCategory(id, editName.trim())
      toast.success('Категория переименована')
      setEditId(null)
      changed()
    } catch (err) {
      toast.error(toApiError(err).field('name') ?? friendlyMessage(err))
    }
  }

  const remove = async () => {
    if (!toDelete) return
    try {
      await api.admin.deleteCategory(toDelete.id)
      toast.info('Категория удалена')
      changed()
    } catch (e) {
      toast.error(friendlyMessage(e))
      throw e
    }
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={create} className="card mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
        <div className="flex-1">
          <input
            value={newName}
            onChange={(e) => (setNewName(e.target.value), setNewError(''))}
            placeholder="Новая категория, например «IT»"
            maxLength={100}
            className="h-11 w-full rounded-2xl border border-line bg-surface px-4 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
          />
          {newError && <p className="mt-1.5 text-xs font-medium text-danger">{newError}</p>}
        </div>
        <Button type="submit" loading={busy} icon={<Plus className="h-4 w-4" />}>
          Добавить
        </Button>
      </form>

      {!items ? (
        <Skeleton className="h-72" />
      ) : (
        <ul className="card divide-y divide-line overflow-hidden">
          <AnimatePresence initial={false}>
            {items.map((c) => (
              <motion.li key={c.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 px-4 py-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                  <FolderTree className="h-4 w-4" />
                </span>
                {editId === c.id ? (
                  <form
                    className="flex flex-1 gap-2"
                    onSubmit={(e) => {
                      e.preventDefault()
                      rename(c.id)
                    }}
                  >
                    <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)} className="h-9 flex-1 rounded-xl border border-brand bg-surface px-3 text-sm outline-none ring-4 ring-brand/15" />
                    <Button type="submit" size="sm" variant="success" icon={<Check className="h-3.5 w-3.5" />}>
                      <span className="sr-only">Сохранить</span>
                    </Button>
                    <Button type="button" size="sm" variant="ghost" icon={<X className="h-3.5 w-3.5" />} onClick={() => setEditId(null)}>
                      <span className="sr-only">Отмена</span>
                    </Button>
                  </form>
                ) : (
                  <>
                    <span className="flex-1 font-semibold">{c.name}</span>
                    <span className="hidden font-mono text-xs text-muted sm:block">{c.slug}</span>
                    <Button size="sm" variant="outline" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => (setEditId(c.id), setEditName(c.name))} title="Переименовать">
                      <span className="sr-only">Переименовать</span>
                    </Button>
                    <Button size="sm" variant="ghost" className="hover:!bg-danger/10 hover:!text-danger" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => setToDelete(c)} title="Удалить">
                      <span className="sr-only">Удалить</span>
                    </Button>
                  </>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Удалить категорию?"
        text={`Категория «${toDelete?.name}» будет удалена. Категорию, в которой есть мероприятия, удалить нельзя.`}
        confirmText="Удалить"
        onConfirm={remove}
        onClose={() => setToDelete(null)}
      />
    </div>
  )
}
