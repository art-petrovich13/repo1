import { Heart, Sparkles } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import type { ReactionType } from '../../api/types'
import { cn } from '../../lib/cn'
import { AnimatedNumber } from '../ui/AnimatedNumber'

const config = {
  like: { label: 'Нравится', icon: Heart, active: 'border-brand-2/40 bg-brand-2/10 text-brand-2', particle: 'bg-brand-2' },
  interested: { label: 'Интересно', icon: Sparkles, active: 'border-accent/50 bg-accent/12 text-accent', particle: 'bg-accent' },
} as const

/** Кнопка-реакция (toggle) с «взрывом» частиц при активации. */
export function ReactionButton({ type, active, count, onToggle, disabled }: { type: ReactionType; active: boolean; count: number; onToggle: () => void; disabled?: boolean }) {
  const { label, icon: Icon, active: activeCls, particle } = config[type]
  const [burst, setBurst] = useState(0)

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      disabled={disabled}
      onClick={() => {
        if (!active) setBurst((b) => b + 1)
        onToggle()
      }}
      aria-pressed={active}
      className={cn(
        'relative flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        active ? activeCls : 'border-line bg-surface text-muted hover:border-brand/30 hover:text-ink',
      )}
    >
      <span className="relative">
        <motion.span key={`${active}`} initial={{ scale: active ? 0.4 : 1 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 600, damping: 12 }} className="block">
          <Icon className={cn('h-5 w-5', active && 'fill-current')} />
        </motion.span>
        <AnimatePresence>
          {burst > 0 &&
            Array.from({ length: 8 }, (_, i) => {
              const angle = (i / 8) * Math.PI * 2
              return (
                <motion.span
                  key={`${burst}-${i}`}
                  className={cn('absolute top-1/2 left-1/2 h-1.5 w-1.5 rounded-full', particle)}
                  initial={{ x: '-50%', y: '-50%', scale: 1, opacity: 1 }}
                  animate={{ x: `calc(-50% + ${Math.cos(angle) * 22}px)`, y: `calc(-50% + ${Math.sin(angle) * 22}px)`, scale: 0, opacity: 0 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                />
              )
            })}
        </AnimatePresence>
      </span>
      {label}
      <AnimatedNumber value={count} className="ml-0.5 opacity-80" />
    </motion.button>
  )
}
