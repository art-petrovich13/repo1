import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../../context/AuthContext'

function FullLoader() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand" />
    </div>
  )
}

/** Только для авторизованных: иначе — на /login с возвратом обратно. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <FullLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  return children
}

/** Только для представителей Комьюнити. Студент получает переадресацию на афишу. */
export function RequireRepresentative({ children }: { children: ReactNode }) {
  const { user, loading, isRepresentative } = useAuth()
  const location = useLocation()
  if (loading) return <FullLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!isRepresentative) return <Navigate to="/" replace />
  return children
}

/** Для гостей (вход/регистрация): авторизованного отправляем на главную. */
export function GuestOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <FullLoader />
  if (user) return <Navigate to={(location.state as { from?: string } | null)?.from ?? '/'} replace />
  return children
}

/** Только для администратора. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <FullLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return children
}
