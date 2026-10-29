import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useToast } from '../../context/ToastContext'
import { cn } from '../../lib/cn'

const icons = {
  success: <CheckCircle2 className="h-5 w-5 text-success" />,
  error: <XCircle className="h-5 w-5 text-danger" />,
  info: <Info className="h-5 w-5 text-brand" />,
}

export function Toaster() {
  const { toasts, dismiss } = useToast()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className={cn('glass pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line p-4 shadow-lift')}
            role="status"
          >
            {icons[t.kind]}
            <p className="flex-1 text-sm font-medium text-ink">{t.text}</p>
            <button onClick={() => dismiss(t.id)} className="cursor-pointer text-muted hover:text-ink" aria-label="Закрыть">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
