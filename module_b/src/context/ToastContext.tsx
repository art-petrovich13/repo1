import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

export type ToastKind = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  kind: ToastKind
  text: string
}

interface ToastValue {
  toasts: Toast[]
  push: (kind: ToastKind, text: string) => void
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastValue | null>(null)
let seq = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), [])

  const push = useCallback(
    (kind: ToastKind, text: string) => {
      const id = ++seq
      setToasts((list) => [...list.slice(-3), { id, kind, text }])
      setTimeout(() => dismiss(id), kind === 'error' ? 5500 : 3800)
    },
    [dismiss],
  )

  return <ToastContext.Provider value={{ toasts, push, dismiss }}>{children}</ToastContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast вне ToastProvider')
  return {
    toasts: ctx.toasts,
    dismiss: ctx.dismiss,
    success: (text: string) => ctx.push('success', text),
    error: (text: string) => ctx.push('error', text),
    info: (text: string) => ctx.push('info', text),
  }
}
