import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { onUnauthorized } from '../api/client'
import { api } from '../api/endpoints'
import { tokens } from '../api/tokens'
import type { AuthResponse, User } from '../api/types'

interface AuthValue {
  user: User | null
  /** Идёт первичная загрузка профиля по сохранённому токену */
  loading: boolean
  isRepresentative: boolean
  unreadCount: number
  login: (email: string, password: string) => Promise<User>
  /** Сохранить сессию из ответа API (вход, подтверждение email) */
  applySession: (auth: AuthResponse) => void
  logout: () => Promise<void>
  setUser: (user: User) => void
  refreshUnread: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => Boolean(tokens.access || tokens.refresh))
  const [unreadCount, setUnreadCount] = useState(0)

  const reset = useCallback(() => {
    tokens.clear()
    setUser(null)
    setUnreadCount(0)
  }, [])

  // Первичная загрузка профиля
  useEffect(() => {
    if (!tokens.access && !tokens.refresh) return
    api
      .me()
      .then(setUser)
      .catch(() => reset())
      .finally(() => setLoading(false))
  }, [reset])

  // Refresh-токен истёк → выходим (переход на /login делает RequireAuth / страница)
  useEffect(() => onUnauthorized(reset), [reset])

  const refreshUnread = useCallback(async () => {
    try {
      const res = await api.notifications({ per_page: 1 })
      setUnreadCount(res.meta.unread_count)
    } catch {
      /* ignore */
    }
  }, [])

  // Счётчик непрочитанных уведомлений — при входе и раз в минуту
  useEffect(() => {
    if (!user || user.is_blocked) return
    refreshUnread()
    const timer = setInterval(refreshUnread, 60_000)
    return () => clearInterval(timer)
  }, [user, refreshUnread])

  const applySession = useCallback((auth: AuthResponse) => {
    tokens.set(auth.access_token, auth.refresh_token)
    setUser(auth.user)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const auth = await api.login(email, password)
      applySession(auth)
      return auth.user
    },
    [applySession],
  )

  const logout = useCallback(async () => {
    try {
      await api.logout(tokens.refresh)
    } catch {
      /* даже при ошибке очищаем локальное состояние */
    }
    reset()
  }, [reset])

  const value: AuthValue = {
    user,
    loading,
    isRepresentative: Boolean(user?.is_representative),
    unreadCount,
    login,
    applySession,
    logout,
    setUser,
    refreshUnread,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth вне AuthProvider')
  return ctx
}
