import { Lock, LogIn, Mail } from 'lucide-react'
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
    </AuthShell>
  )
}
