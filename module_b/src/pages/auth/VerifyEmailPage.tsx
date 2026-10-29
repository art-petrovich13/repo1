import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { api } from '../../api/endpoints'
import { toApiError } from '../../api/errors'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

/** Переход по ссылке из письма: подтверждение email → автологин → редирект на афишу. */
export default function VerifyEmailPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const { applySession } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return // защита от двойного вызова в StrictMode
    started.current = true
    if (!token) {
      setState('error')
      setMessage('В ссылке нет токена подтверждения.')
      return
    }
    api
      .verifyEmail(token)
      .then((res) => {
        applySession(res)
        setState('ok')
        toast.success('Email подтверждён — добро пожаловать!')
        setTimeout(() => navigate('/', { replace: true }), 1600)
      })
      .catch((e) => {
        setState('error')
        setMessage(toApiError(e).field('token') ?? toApiError(e).message)
      })
  }, [token, applySession, navigate, toast])

  return (
    <div className="card mx-auto max-w-md p-10 text-center">
      {state === 'loading' && (
        <>
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand" />
          <p className="mt-5 font-semibold">Подтверждаем email…</p>
        </>
      )}
      {state === 'ok' && (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.6 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success/12 text-success">
            <CheckCircle2 className="h-11 w-11" />
          </motion.div>
          <h1 className="mt-6 text-2xl font-bold">Email подтверждён!</h1>
          <p className="mt-2 text-muted">Выполняем вход и переходим в афишу…</p>
        </motion.div>
      )}
      {state === 'error' && (
        <>
          <XCircle className="mx-auto h-14 w-14 text-danger" />
          <h1 className="mt-5 text-2xl font-bold">Не удалось подтвердить</h1>
          <p className="mt-2 text-muted">{message}</p>
          <Button to="/login" linkClassName="mt-6 ">Ко входу</Button>
        </>
      )}
    </div>
  )
}
