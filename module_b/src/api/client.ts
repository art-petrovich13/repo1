import axios, { type AxiosRequestConfig } from 'axios'
import { toApiError } from './errors'
import { tokens } from './tokens'
import type { AuthResponse } from './types'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { Accept: 'application/json' },
})

http.interceptors.request.use((config) => {
  const access = tokens.access
  if (access && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${access}`
  }
  return config
})

/** Подписчики на «сессия завершена» (истёк refresh-токен) — AuthContext выполняет выход и редирект на /login. */
const unauthorizedListeners = new Set<() => void>()
export const onUnauthorized = (fn: () => void) => {
  unauthorizedListeners.add(fn)
  return () => {
    unauthorizedListeners.delete(fn)
  }
}

let refreshing: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokens.refresh
  if (!refresh) return null
  try {
    const { data } = await axios.post<AuthResponse>(`${http.defaults.baseURL}/auth/refresh`, { refresh_token: refresh })
    tokens.set(data.access_token, data.refresh_token)
    return data.access_token
  } catch {
    return null
  }
}

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean }
    const isAuthCall = original?.url?.startsWith('/auth/')

    // 401 → пробуем один раз обновить access-токен по refresh-токену и повторить запрос
    if (error.response?.status === 401 && original && !original._retry && !isAuthCall && tokens.refresh) {
      original._retry = true
      refreshing ??= refreshAccessToken().finally(() => {
        refreshing = null
      })
      const newAccess = await refreshing
      if (newAccess) {
        original.headers = { ...original.headers, Authorization: `Bearer ${newAccess}` }
        return http(original)
      }
      tokens.clear()
      unauthorizedListeners.forEach((fn) => fn())
    } else if (error.response?.status === 401 && !isAuthCall && original?.headers?.Authorization) {
      tokens.clear()
      unauthorizedListeners.forEach((fn) => fn())
    }

    return Promise.reject(toApiError(error))
  },
)
