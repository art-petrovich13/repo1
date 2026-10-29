import { motion } from 'motion/react'
import { cn } from '../../lib/cn'

/** Индикатор заполненности мест: цвет меняется от бренда к предупреждению и «мест нет». */
export function Progress({ value, className }: { value: number; className?: string }) {
  const color = value >= 100 ? 'bg-danger' : value >= 80 ? 'bg-warning' : 'bg-brand-gradient'
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-2', className)}>
      <motion.div
        className={cn('h-full rounded-full', color)}
        initial={{ width: 0 }}
        whileInView={{ width: `${Math.max(value, 3)}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}
