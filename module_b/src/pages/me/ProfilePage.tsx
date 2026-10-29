import { BadgeCheck, Camera, GraduationCap, KeyRound, Lock, LogOut, Mail, Save, ShieldCheck, Trash2, User as UserIcon, Users } from 'lucide-react'
import { motion } from 'motion/react'
import { useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { api } from '../../api/endpoints'
import { friendlyMessage, toApiError } from '../../api/errors'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatDate } from '../../lib/format'

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({ name: user!.name, faculty: user!.faculty ?? '', course: String(user!.course ?? ''), avatar_url: user!.avatar_url })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)

  if (!user) return null
  const dirty = form.name !== user.name || form.faculty !== (user.faculty ?? '') || form.course !== String(user.course ?? '') || form.avatar_url !== user.avatar_url

  const save = async (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Укажите имя'
    if (!form.faculty.trim()) errs.faculty = 'Укажите факультет'
    if (!form.course) errs.course = 'Выберите курс'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSaving(true)
    try {
      const res = await api.updateMe({ name: form.name.trim(), faculty: form.faculty.trim(), course: Number(form.course), avatar_url: form.avatar_url })
      setUser(res.data)
      toast.success('Профиль сохранён')
    } catch (err) {
      const apiErr = toApiError(err)
      if (apiErr.code === 'VALIDATION_ERROR') setErrors(Object.fromEntries(Object.entries(apiErr.fields).map(([k, v]) => [k, v[0]])))
      else toast.error(friendlyMessage(apiErr))
    } finally {
      setSaving(false)
    }
  }

  const upload = async (file: File) => {
    setUploading(true)
    try {
      const res = await api.upload(file, 'avatar')
      setForm((f) => ({ ...f, avatar_url: res.path }))
      toast.info('Аватар загружен — не забудьте сохранить профиль')
    } catch (err) {
      toast.error(toApiError(err).field('file') ?? friendlyMessage(err))
    } finally {
      setUploading(false)
    }
  }

  const doLogout = async () => {
    await logout()
    toast.info('Вы вышли из аккаунта')
    navigate('/', { replace: true })
  }

  const verifiedClubs = user.clubs.filter((c) => c.verified)

  return (
    <div>
      <PageHeader
        eyebrow="Личный кабинет"
        title="Профиль"
        actions={
          <>
            <Button variant="outline" icon={<KeyRound className="h-4 w-4" />} onClick={() => setPwOpen(true)}>
              Сменить пароль
            </Button>
            <Button variant="ghost" icon={<LogOut className="h-4 w-4" />} onClick={doLogout} className="!text-danger hover:!bg-danger/10">
              Выйти
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Карточка пользователя и статус */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="card relative overflow-hidden p-6 text-center">
            <div className="absolute inset-x-0 top-0 h-24 bg-brand-gradient opacity-90" />
            <div className="relative mx-auto mt-6 w-fit">
              <Avatar name={form.name || user.name} url={form.avatar_url} size={104} className="ring-4 ring-surface" />
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute right-0 bottom-0 grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-surface text-brand shadow-card ring-1 ring-line transition hover:scale-110"
                aria-label="Загрузить аватар"
                disabled={uploading}
              >
                <Camera className="h-4 w-4" />
              </button>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            </div>
            {form.avatar_url && (
              <button onClick={() => setForm((f) => ({ ...f, avatar_url: null }))} className="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-muted hover:text-danger">
                <Trash2 className="h-3 w-3" /> убрать аватар
              </button>
            )}
            <h2 className="mt-3 text-xl font-semibold">{user.name}</h2>
            <p className="text-sm text-muted">{user.email}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Badge tone={user.role === 'admin' ? 'pink' : 'brand'} icon={<ShieldCheck className="h-3.5 w-3.5" />}>
                {user.role === 'admin' ? 'Администратор' : user.is_representative ? 'Представитель' : 'Студент'}
              </Badge>
              {user.email_verified && (
                <Badge tone="success" icon={<BadgeCheck className="h-3.5 w-3.5" />}>
                  Email подтверждён
                </Badge>
              )}
            </div>
            <p className="mt-4 text-xs text-muted">С нами с {formatDate(user.created_at)}</p>
          </div>

          <div className="card p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <Users className="h-5 w-5 text-brand" /> Мои Комьюнити
            </h3>
            {user.clubs.length === 0 ? (
              <p className="text-sm text-muted">Вы пока не состоите в Комьюнити. Верификацию представителя выдаёт администратор.</p>
            ) : (
              <ul className="space-y-2">
                {user.clubs.map((c, i) => (
                  <motion.li key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }} className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2 px-4 py-3">
                    <span className="text-sm font-semibold">{c.name}</span>
                    {c.verified ? (
                      <Badge tone="success" icon={<BadgeCheck className="h-3.5 w-3.5" />}>
                        верифицирован
                      </Badge>
                    ) : (
                      <Badge tone="muted">не верифицирован</Badge>
                    )}
                  </motion.li>
                ))}
              </ul>
            )}
            {verifiedClubs.length > 0 && <p className="mt-4 text-xs text-muted">Вы можете публиковать мероприятия от имени {verifiedClubs.length === 1 ? 'этого Комьюнити' : 'этих Комьюнити'}.</p>}
          </div>
        </motion.div>

        {/* Редактирование */}
        <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} onSubmit={save} className="card space-y-5 p-6 sm:p-8" noValidate>
          <h3 className="text-lg font-semibold">Личные данные</h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Имя и фамилия" icon={<UserIcon className="h-4 w-4" />} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
            <Input label="Email" icon={<Mail className="h-4 w-4" />} value={user.email} disabled hint="Email изменить нельзя" />
            <Input label="Факультет / специальность" icon={<GraduationCap className="h-4 w-4" />} value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} error={errors.faculty} />
            <Select label="Курс" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} error={errors.course}>
              <option value="">—</option>
              {[1, 2, 3, 4, 5, 6].map((c) => (
                <option key={c} value={c}>
                  {c} курс
                </option>
              ))}
            </Select>
          </div>
          <Input label="Ссылка на аватар" placeholder="https://… или загрузите фото через кнопку камеры" value={form.avatar_url ?? ''} onChange={(e) => setForm({ ...form, avatar_url: e.target.value || null })} error={errors.avatar_url} hint="Необязательно — без аватара показывается первая буква имени" />
          <div className="flex justify-end border-t border-line pt-5">
            <Button type="submit" loading={saving} disabled={!dirty} icon={<Save className="h-4 w-4" />}>
              Сохранить изменения
            </Button>
          </div>
        </motion.form>
      </div>

      <PasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
    </div>
  )
}

function PasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast()
  const empty = { current_password: '', password: '', password_confirmation: '' }
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  const close = () => {
    setForm(empty)
    setErrors({})
    onClose()
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.current_password) errs.current_password = 'Введите текущий пароль'
    if (form.password.length < 8) errs.password = 'Не короче 8 символов'
    if (form.password !== form.password_confirmation) errs.password_confirmation = 'Пароли не совпадают'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setBusy(true)
    try {
      await api.changePassword(form)
      toast.success('Пароль успешно изменён')
      close()
    } catch (err) {
      const apiErr = toApiError(err)
      if (apiErr.code === 'VALIDATION_ERROR') setErrors(Object.fromEntries(Object.entries(apiErr.fields).map(([k, v]) => [k, v[0]])))
      else toast.error(friendlyMessage(apiErr))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={close} title="Смена пароля">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Input label="Текущий пароль" type="password" icon={<Lock className="h-4 w-4" />} value={form.current_password} onChange={(e) => setForm({ ...form, current_password: e.target.value })} error={errors.current_password} autoComplete="current-password" />
        <Input label="Новый пароль" type="password" icon={<KeyRound className="h-4 w-4" />} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} autoComplete="new-password" />
        <Input label="Повторите новый пароль" type="password" icon={<KeyRound className="h-4 w-4" />} value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} error={errors.password_confirmation} autoComplete="new-password" />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={close}>
            Отмена
          </Button>
          <Button type="submit" loading={busy}>
            Сменить пароль
          </Button>
        </div>
      </form>
    </Modal>
  )
}
