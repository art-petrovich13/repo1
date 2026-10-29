import { Ban, GraduationCap, KeyRound, Lock, LogIn, Mail, ShieldCheck, Star } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { api } from '../../api/endpoints'
import { friendlyMessage, toApiError } from '../../api/errors'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Field'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { AuthShell, EMAIL_RE } from './AuthShell'

export default function LoginPage() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<{ code: string; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!EMAIL_RE.test(email)) errs.email = 'Введите корректный email'
    if (!password) errs.password = 'Введите пароль'
    setErrors(errs)
    setFormError(null)
    if (Object.keys(errs).length) return

    setBusy(true)
    try {
      const user = await login(email.trim(), password)
      toast.success(`С возвращением, ${user.name.split(' ')[0]}!`)
      navigate(from, { replace: true })
    } catch (err) {
      const apiErr = toApiError(err)
      if (apiErr.code === 'VALIDATION_ERROR') {
        setErrors(Object.fromEntries(Object.entries(apiErr.fields).map(([k, v]) => [k, v[0]])))
      } else {
        setFormError({ code: apiErr.code, text: apiErr.code === 'UNAUTHORIZED' ? apiErr.message : friendlyMessage(apiErr) })
      }
    } finally {
      setBusy(false)
    }
  }

  const resend = async () => {
    await api.resendVerification(email.trim()).catch(() => null)
    toast.success('Письмо с подтверждением отправлено повторно')
  }

  return (
    <AuthShell
      title="Вход"
      subtitle={
        <>
          Нет аккаунта?{' '}
          <Link to="/register" className="font-semibold text-brand hover:underline">
            Зарегистрируйтесь
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        <AnimatePresence>
          {formError && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <motion.div initial={{ x: -8 }} animate={{ x: [8, -6, 4, 0] }} transition={{ duration: 0.4 }} className="rounded-2xl border border-danger/30 bg-danger/8 p-4 text-sm font-medium text-danger">
                {formError.text}
                {formError.code === 'NOT_VERIFIED' && (
                  <button type="button" onClick={resend} className="mt-2 block cursor-pointer font-bold underline">
                    Отправить письмо ещё раз
                  </button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Input label="Email" type="email" autoComplete="email" icon={<Mail className="h-4 w-4" />} value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} placeholder="you@example.com" />
        <div>
          <Input label="Пароль" type="password" autoComplete="current-password" icon={<Lock className="h-4 w-4" />} value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} placeholder="••••••••" />
          <div className="mt-2 text-right">
            <Link to="/password-reset" className="text-sm font-semibold text-brand hover:underline">
              Забыли пароль?
            </Link>
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={busy} icon={<LogIn className="h-5 w-5" />}>
          Войти
        </Button>
      </form>

      <DemoAccounts
        current={email}
        onPick={(acc) => {
          setEmail(acc.email)
          setPassword(acc.password)
          setErrors({})
          setFormError(null)
        }}
      />
    </AuthShell>
  )
}

/** Тестовые учётные записи из сидеров — для быстрого входа при проверке. */
const DEMO_ACCOUNTS = [
  { label: 'Студент', hint: 'без верификации', email: 'student@example.com', password: 'password123', icon: GraduationCap, cls: 'bg-brand-soft text-brand' },
  { label: 'Представитель', hint: 'RoboTech и «Добро»', email: 'rep1@example.com', password: 'password123', icon: Star, cls: 'bg-warning/15 text-warning' },
  { label: 'Представитель', hint: 'спортклуб', email: 'rep2@example.com', password: 'password123', icon: Star, cls: 'bg-warning/15 text-warning' },
  { label: 'Администратор', hint: 'admin', email: 'admin@example.com', password: 'Admin12345', icon: ShieldCheck, cls: 'bg-brand-2/12 text-brand-2' },
  { label: 'Заблокированный', hint: 'проверка 403', email: 'blocked@example.com', password: 'password123', icon: Ban, cls: 'bg-danger/12 text-danger' },
]

type DemoAccount = (typeof DEMO_ACCOUNTS)[number]

function DemoAccounts({ current, onPick }: { current: string; onPick: (acc: DemoAccount) => void }) {
  return (
    <div className="mt-8 border-t border-line pt-6">
      <p className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-muted uppercase">
        <KeyRound className="h-3.5 w-3.5" /> Тестовые аккаунты — нажмите, чтобы подставить
      </p>
      <div className="grid gap-1.5">
        {DEMO_ACCOUNTS.map((acc, i) => {
          const Icon = acc.icon
          const active = current === acc.email
          return (
            <motion.button
              key={acc.email}
              type="button"
              onClick={() => onPick(acc)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2 text-left transition-colors ${active ? 'border-brand bg-brand-soft/60 ring-4 ring-brand/10' : 'border-line bg-surface hover:border-brand/40'}`}
            >
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${acc.cls}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-bold">
                {acc.label} <span className="font-medium text-muted">· {acc.hint}</span>
              </span>
              <span className="hidden shrink-0 font-mono text-xs text-muted sm:block">{acc.email}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
