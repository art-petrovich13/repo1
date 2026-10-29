import { motion } from 'motion/react'
import type { ReactNode } from 'react'

export function PageHeader({ eyebrow, title, text, actions }: { eyebrow?: string; title: ReactNode; text?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {eyebrow && <p className="mb-2 text-xs font-bold tracking-[0.18em] text-brand uppercase">{eyebrow}</p>}
        <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
        {text && <p className="mt-2 max-w-2xl text-muted">{text}</p>}
      </motion.div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
