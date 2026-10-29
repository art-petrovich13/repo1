import { KeyRound, Lock, Mail, MailCheck } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { api } from '../../api/endpoints'
import { friendlyMessage, toApiError } from '../../api/errors'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Field'
import { useToast } from '../../context/ToastContext'
import { AuthShell, EMAIL_RE } from './AuthShell'

/** /password-reset — запрос письма; /password-reset?token=… — установка нового пароля. */
export default function PasswordResetPage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  return token ? <NewPasswordForm token={token} /> : <RequestForm />
}

function RequestForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!EMAIL_RE.test(email)) return setError('Введите корректный email')
    setBusy(true)
    try {
      await api.forgotPassword(email.trim())
      setSent(true)
    } catch (err) {
      setError(friendlyMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell title="Восстановление пароля" subtitle="Пришлём ссылку для установки нового пароля">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div key="sent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-brand-soft text-brand">
              <MailCheck className="h-8 w-8" />
            </div>
            <p className="text-muted">Если такой email зарегистрирован, на него отправлено письмо со ссылкой. Проверьте почту.</p>
            <Link to="/login" className="mt-6 inline-block">
              <Button variant="outline">Вернуться ко входу</Button>
            </Link>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} className="space-y-5" noValidate exit={{ opacity: 0, x: -20 }}>
            <Input label="Email" type="email" icon={<Mail className="h-4 w-4" />} value={email} onChange={(e) => (setEmail(e.target.value), setError(undefined))} error={error} placeholder="you@example.com" />
            <Button type="submit" size="lg" className="w-full" loading={busy}>
              Отправить ссылку
            </Button>
            <p className="text-center text-sm">
              <Link to="/login" className="font-semibold text-brand hover:underline">
                Я вспомнил пароль
              </Link>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthShell>
  )
}

function NewPasswordForm({ token }: { token: string }) {
  const toast = useToast()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (password.length < 8) errs.password = 'Пароль должен быть не короче 8 символов'
    if (password !== confirm) errs.confirm = 'Пароли не совпадают'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setBusy(true)
    try {
      await api.resetPassword({ token, password, password_confirmation: confirm })
      toast.success('Пароль изменён. Войдите с новым паролем')
      navigate('/login', { replace: true })
    } catch (err) {
      const apiErr = toApiError(err)
      setErrors({ password: apiErr.field('password') ?? '', token: apiErr.field('token') ?? (apiErr.code !== 'VALIDATION_ERROR' ? friendlyMessage(apiErr) : '') })
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell title="Новый пароль" subtitle="Придумайте новый пароль для входа">
      <form onSubmit={submit} className="space-y-5" noValidate>
        {errors.token && (
          <div className="rounded-2xl border border-danger/30 bg-danger/8 p-4 text-sm font-medium text-danger">
            {errors.token}{' '}
            <Link to="/password-reset" className="font-bold underline">
              Запросить новую ссылку
            </Link>
          </div>
        )}
        <Input label="Новый пароль" type="password" icon={<Lock className="h-4 w-4" />} value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password || undefined} autoComplete="new-password" />
        <Input label="Подтверждение пароля" type="password" icon={<Lock className="h-4 w-4" />} value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} autoComplete="new-password" />
        <Button type="submit" size="lg" className="w-full" loading={busy} icon={<KeyRound className="h-5 w-5" />}>
          Сохранить пароль
        </Button>
      </form>
    </AuthShell>
  )
}
