import { GraduationCap, Lock, Mail, MailCheck, User, UserPlus } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { api } from '../../api/endpoints'
import { friendlyMessage, toApiError } from '../../api/errors'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Field'
import { useToast } from '../../context/ToastContext'
import { cn } from '../../lib/cn'
import { AuthShell, EMAIL_RE } from './AuthShell'

type Form = { name: string; email: string; password: string; faculty: string; course: string }

/** Индикатор надёжности пароля. */
function strength(p: string) {
  let s = 0
  if (p.length >= 8) s++
  if (p.length >= 12) s++
  if (/[A-ZА-Я]/.test(p) && /[a-zа-я]/.test(p)) s++
  if (/\d/.test(p) && /[^\w\s]/.test(p)) s++
  return s
}

export default function RegisterPage() {
  const toast = useToast()
  const [form, setForm] = useState<Form>({ name: '', email: '', password: '', faculty: '', course: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({})
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<{ email: string; debugUrl?: string } | null>(null)

  const set = (k: keyof Form) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }))
  }

  const validate = () => {
    const e: Partial<Record<keyof Form, string>> = {}
    if (!form.name.trim()) e.name = 'Укажите имя'
    if (!EMAIL_RE.test(form.email)) e.email = 'Введите корректный email'
    if (form.password.length < 8) e.password = 'Пароль должен быть не короче 8 символов'
    if (!form.faculty.trim()) e.faculty = 'Укажите факультет или специальность'
    if (!form.course) e.course = 'Выберите курс'
    return e
  }

  const submit = async (ev: FormEvent) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return

    setBusy(true)
    try {
      const res = await api.register({ name: form.name.trim(), email: form.email.trim(), password: form.password, faculty: form.faculty.trim(), course: Number(form.course) })
      setDone({ email: form.email.trim(), debugUrl: res.debug_verify_url })
    } catch (err) {
      const apiErr = toApiError(err)
      if (apiErr.code === 'VALIDATION_ERROR') setErrors(Object.fromEntries(Object.entries(apiErr.fields).map(([k, v]) => [k, v[0]])))
      else toast.error(friendlyMessage(apiErr))
    } finally {
      setBusy(false)
    }
  }

  const st = strength(form.password)

  return (
    <AuthShell
      title={done ? 'Почти готово!' : 'Регистрация'}
      subtitle={
        done ? undefined : (
          <>
            Уже есть аккаунт?{' '}
            <Link to="/login" className="font-semibold text-brand hover:underline">
              Войдите
            </Link>
          </>
        )
      }
    >
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }} className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-success/12 text-success">
              <MailCheck className="h-10 w-10" />
            </motion.div>
            <p className="text-muted">
              Мы отправили письмо со ссылкой подтверждения на <b className="text-ink">{done.email}</b>. Перейдите по ссылке — и мы сразу выполним вход.
            </p>
            {done.debugUrl && (
              <div className="mt-6 rounded-2xl border border-dashed border-brand/40 bg-brand-soft/50 p-4 text-left text-sm">
                <p className="font-bold text-brand">Демо-режим</p>
                <p className="mt-1 text-muted">Письма эмулируются (storage/logs/laravel.log). Можно подтвердить сразу:</p>
                <Button to={new URL(done.debugUrl).pathname + new URL(done.debugUrl).search} linkClassName="mt-3 " size="sm" icon={<MailCheck className="h-4 w-4" />}>
                    Подтвердить email
                  </Button>
              </div>
            )}
            <Button variant="ghost" className="mt-6" onClick={() => api.resendVerification(done.email).then(() => toast.success('Письмо отправлено повторно'))}>
              Отправить письмо ещё раз
            </Button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} className="space-y-5" noValidate exit={{ opacity: 0, x: -20 }}>
            <Input label="Имя и фамилия" icon={<User className="h-4 w-4" />} value={form.name} onChange={set('name')} error={errors.name} placeholder="Анна Смирнова" autoComplete="name" />
            <Input label="Email" type="email" icon={<Mail className="h-4 w-4" />} value={form.email} onChange={set('email')} error={errors.email} placeholder="you@example.com" autoComplete="email" />
            <div>
              <Input label="Пароль" type="password" icon={<Lock className="h-4 w-4" />} value={form.password} onChange={set('password')} error={errors.password} placeholder="Минимум 8 символов" autoComplete="new-password" />
              {form.password && (
                <div className="mt-2 flex gap-1.5">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.span key={i} layout className={cn('h-1.5 flex-1 rounded-full transition-colors duration-300', i < st ? (st <= 1 ? 'bg-danger' : st === 2 ? 'bg-warning' : 'bg-success') : 'bg-surface-2')} />
                  ))}
                </div>
              )}
            </div>
            <div className="grid gap-5 sm:grid-cols-[1fr_8rem]">
              <Input label="Факультет / специальность" icon={<GraduationCap className="h-4 w-4" />} value={form.faculty} onChange={set('faculty')} error={errors.faculty} placeholder="Прикладная информатика" />
              <Select label="Курс" value={form.course} onChange={set('course')} error={errors.course}>
                <option value="">—</option>
                {[1, 2, 3, 4, 5, 6].map((c) => (
                  <option key={c} value={c}>
                    {c} курс
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" size="lg" className="w-full" loading={busy} icon={<UserPlus className="h-5 w-5" />}>
              Создать аккаунт
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthShell>
  )
}
