import { BadgeCheck, Ban, Search, ShieldCheck, Unlock, XCircle } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { api } from '../../api/endpoints'
import { friendlyMessage } from '../../api/errors'
import type { User } from '../../api/types'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'
import { Pagination } from '../../components/ui/Pagination'
import { Skeleton } from '../../components/ui/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useDictionaries } from '../../hooks/useDictionaries'
import { usePaged } from '../../hooks/usePaged'
import { cn } from '../../lib/cn'

type BlockedFilter = '' | 'true' | 'false'

export function UsersTab() {
  const { user: me } = useAuth()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [query, setQuery] = useState('')
  const [blocked, setBlocked] = useState<BlockedFilter>('')
  const [toBlock, setToBlock] = useState<User | null>(null)
  const [verifyUser, setVerifyUser] = useState<User | null>(null)

  // Поиск с задержкой, чтобы не дёргать API на каждую букву
  useEffect(() => {
    const t = setTimeout(() => setQuery(q.trim()), 350)
    return () => clearTimeout(t)
  }, [q])

  const { items, setItems, meta, loading, error, page, setPage, reload } = usePaged(
    (p) => api.admin.users({ q: query, blocked: blocked === '' ? '' : blocked === 'true', page: p, per_page: 10 }),
    [query, blocked],
  )

  const replace = (u: User) => setItems((list) => list.map((x) => (x.id === u.id ? u : x)))

  const toggleBlock = async () => {
    if (!toBlock) return
    try {
      const res = toBlock.is_blocked ? await api.admin.unblock(toBlock.id) : await api.admin.block(toBlock.id)
      replace(res.data)
      toast.success(res.message)
    } catch (e) {
      toast.error(friendlyMessage(e))
      throw e
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по имени или email"
            className="h-11 w-full rounded-2xl border border-line bg-surface pr-4 pl-11 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
          />
        </label>
        <select value={blocked} onChange={(e) => setBlocked(e.target.value as BlockedFilter)} className="h-11 cursor-pointer rounded-2xl border border-line bg-surface px-4 text-sm font-semibold outline-none focus:border-brand">
          <option value="">Все пользователи</option>
          <option value="false">Активные</option>
          <option value="true">Заблокированные</option>
        </select>
      </div>

      {loading && items.length === 0 ? (
        <Skeleton className="h-96" />
      ) : error ? (
        <EmptyState icon={<XCircle />} title="Ошибка загрузки" text={error} action={<Button onClick={() => reload()}>Повторить</Button>} />
      ) : items.length === 0 ? (
        <EmptyState icon={<Search />} title="Никого не нашли" text="Измените запрос или фильтр." />
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-2/60 text-left text-xs font-bold tracking-wide text-muted uppercase">
                  <th className="px-5 py-3">Пользователь</th>
                  <th className="hidden px-5 py-3 xl:table-cell">Учёба</th>
                  <th className="px-5 py-3">Роль и Комьюнити</th>
                  <th className="px-5 py-3">Статус</th>
                  <th className="px-5 py-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {items.map((u, i) => (
                  <motion.tr key={u.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className={cn('border-b border-line transition-colors last:border-0 hover:bg-surface-2/40', u.is_blocked && 'bg-danger/[0.04]')}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} url={u.avatar_url} size={36} />
                        <div className="min-w-0">
                          <p className="font-semibold">{u.name}</p>
                          <p className="text-xs text-muted">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-5 py-3 text-muted xl:table-cell">
                      {u.faculty ?? '—'}
                      {u.course ? `, ${u.course} курс` : ''}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {u.role === 'admin' && (
                          <Badge tone="pink" icon={<ShieldCheck className="h-3 w-3" />}>
                            Администратор
                          </Badge>
                        )}
                        {u.clubs.filter((c) => c.verified).map((c) => (
                          <Badge key={c.id} tone="success" icon={<BadgeCheck className="h-3 w-3" />}>
                            {c.name.replace(/^[^«]*«|»$/g, '')}
                          </Badge>
                        ))}
                        {u.role !== 'admin' && !u.is_representative && <Badge tone="muted">Студент</Badge>}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {u.is_blocked ? <Badge tone="danger">Заблокирован</Badge> : u.email_verified ? <Badge tone="success">Активен</Badge> : <Badge tone="warning">Email не подтверждён</Badge>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="outline" icon={<BadgeCheck className="h-3.5 w-3.5" />} onClick={() => setVerifyUser(u)} title="Верификация представителя">
                          <span className="hidden xl:inline">Верификация</span>
                        </Button>
                        {u.id !== me?.id &&
                          (u.is_blocked ? (
                            <Button size="sm" variant="success" icon={<Unlock className="h-3.5 w-3.5" />} onClick={() => setToBlock(u)} title="Разблокировать">
                              <span className="hidden xl:inline">Разблокировать</span>
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" className="hover:!bg-danger/10 hover:!text-danger" icon={<Ban className="h-3.5 w-3.5" />} onClick={() => setToBlock(u)} title="Заблокировать">
                              <span className="hidden xl:inline">Заблокировать</span>
                            </Button>
                          ))}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && <Pagination page={page} lastPage={meta.last_page} onChange={setPage} />}
        </>
      )}

      <ConfirmDialog
        open={toBlock !== null}
        title={toBlock?.is_blocked ? 'Разблокировать пользователя?' : 'Заблокировать пользователя?'}
        text={
          toBlock?.is_blocked
            ? `${toBlock?.name} снова сможет входить и пользоваться афишей.`
            : `${toBlock?.name} не сможет войти, а на все запросы (кроме просмотра профиля) получит 403 USER_BLOCKED.`
        }
        confirmText={toBlock?.is_blocked ? 'Разблокировать' : 'Заблокировать'}
        tone={toBlock?.is_blocked ? 'primary' : 'danger'}
        onConfirm={toggleBlock}
        onClose={() => setToBlock(null)}
      />

      <VerificationModal user={verifyUser} onClose={() => setVerifyUser(null)} onChange={(u) => (replace(u), setVerifyUser(u))} />
    </div>
  )
}

/** Верификация привязана к паре «пользователь ↔ Комьюнити»: переключатель на каждое Комьюнити. */
function VerificationModal({ user, onClose, onChange }: { user: User | null; onClose: () => void; onChange: (u: User) => void }) {
  const { clubs } = useDictionaries()
  const toast = useToast()
  const [busy, setBusy] = useState<number | null>(null)

  const toggle = async (clubId: number, verified: boolean) => {
    if (!user) return
    setBusy(clubId)
    try {
      const res = verified ? await api.admin.unverify(clubId, user.id) : await api.admin.verify(clubId, user.id)
      onChange(res.data)
      toast.success(res.message)
    } catch (e) {
      toast.error(friendlyMessage(e))
    } finally {
      setBusy(null)
    }
  }

  return (
    <Modal open={user !== null} onClose={onClose} title="Верификация представителя">
      {user && (
        <>
          <div className="mb-5 flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
            <Avatar name={user.name} url={user.avatar_url} size={40} />
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-xs text-muted">{user.email}</p>
            </div>
          </div>
          <p className="mb-3 text-sm text-muted">Представитель может публиковать мероприятия только от имени Комьюнити, где он верифицирован.</p>
          <ul className="space-y-2">
            {clubs.map((c) => {
              const verified = Boolean(user.clubs.find((x) => x.id === c.id)?.verified)
              return (
                <li key={c.id}>
                  <button
                    onClick={() => toggle(c.id, verified)}
                    disabled={busy !== null}
                    className={cn('flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition disabled:opacity-60', verified ? 'border-success/40 bg-success/8' : 'border-line hover:border-brand/40')}
                    role="switch"
                    aria-checked={verified}
                  >
                    <span className="text-sm font-semibold">{c.name}</span>
                    <span className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', verified ? 'bg-success' : 'bg-line')}>
                      <motion.span layout transition={{ type: 'spring', stiffness: 600, damping: 30 }} className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow', verified ? 'right-0.5' : 'left-0.5')} />
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </Modal>
  )
}
