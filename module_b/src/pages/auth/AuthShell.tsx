import { CalendarHeart, PartyPopper, Trophy } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'

/** Двухколоночный каркас страниц входа/регистрации: декоративная панель + форма. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-line bg-surface shadow-lift lg:grid-cols-[1fr_1.1fr]">
      <div className="relative hidden overflow-hidden bg-brand-gradient p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -top-20 -right-20 h-72 w-72 animate-aurora rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -bottom-24 -left-16 h-80 w-80 animate-aurora rounded-full bg-black/15 blur-2xl [animation-delay:-8s]" />
        <div className="relative">
          <p className="font-display text-3xl leading-tight font-bold">
            Твой кампус.
            <br />
            Твои события.
          </p>
          <p className="mt-4 max-w-xs text-white/80">Регистрируйся на мероприятия сообществ, отмечай интересное и получай напоминания.</p>
        </div>
        <div className="relative space-y-3">
          {[
            { icon: Trophy, text: 'Турниры и хакатоны' },
            { icon: PartyPopper, text: 'Квизы, спектакли, вечеринки' },
            { icon: CalendarHeart, text: 'Напоминания за сутки и за час' },
          ].map(({ icon: Icon, text }, i) => (
            <motion.div key={text} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.12 }} className="flex items-center gap-3 rounded-2xl bg-white/12 px-4 py-3 backdrop-blur">
              <Icon className="h-5 w-5" />
              <span className="font-semibold">{text}</span>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="p-6 sm:p-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
        </motion.div>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  )
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
