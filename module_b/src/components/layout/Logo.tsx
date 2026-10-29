import { Sparkles } from 'lucide-react'
import { Link } from 'react-router'

export function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="На главную">
      <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow transition-transform duration-500 group-hover:rotate-[14deg] group-hover:scale-105">
        <Sparkles className="h-5 w-5" />
      </span>
      <span className="leading-none whitespace-nowrap">
        <span className="block font-display text-lg font-bold tracking-tight">Пульс</span>
        <span className="block text-[11px] font-semibold tracking-wide text-muted">афиша кампуса</span>
      </span>
    </Link>
  )
}
