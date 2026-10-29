import { AnimatePresence, motion } from 'motion/react'

/** Число, которое «перелистывается» при изменении. */
export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  return (
    <span className={`relative inline-flex overflow-hidden tabular-nums ${className ?? ''}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={value} initial={{ y: '-100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}>
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
