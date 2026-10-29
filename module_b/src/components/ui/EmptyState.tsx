import { motion } from 'motion/react'
import type { ReactNode } from 'react'

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card flex flex-col items-center px-6 py-14 text-center"
    >
      <div className="mb-5 grid h-20 w-20 animate-float place-items-center rounded-3xl bg-brand-soft text-brand [&>svg]:h-9 [&>svg]:w-9">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {text && <p className="mt-2 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  )
}
