import { Menu, Search, X } from 'lucide-react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useEffect, useState, type FormEvent } from 'react'
import { NavLink, useLocation, useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/cn'
import { Button } from '../ui/Button'
import { Logo } from './Logo'
import { NotificationBell } from './NotificationBell'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'

export function Header() {
  const { user, isRepresentative, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 8))
  useEffect(() => setMobileOpen(false), [location.pathname])
  useEffect(() => setQ(params.get('q') ?? ''), [params])

  const nav = [
    { to: '/', label: 'Афиша', end: true },
    ...(user ? [{ to: '/me/registrations', label: 'Мои регистрации' }] : []),
    ...(user ? [{ to: '/me/reactions', label: 'Реакции' }] : []),
    ...(isRepresentative ? [{ to: '/me/events', label: 'Мои мероприятия' }] : []),
  ]

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    const next = new URLSearchParams(location.pathname === '/' ? params : undefined)
    if (q.trim()) next.set('q', q.trim())
    else next.delete('q')
    next.delete('page')
    navigate({ pathname: '/', search: next.toString() })
  }

  return (
    <header className={cn('sticky top-0 z-40 transition-all duration-300', scrolled ? 'glass border-b border-line shadow-card' : 'border-b border-transparent')}>
      <div className="mx-auto flex h-18 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Logo />

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="relative rounded-xl px-3.5 py-2 text-sm font-semibold whitespace-nowrap">
              {({ isActive }) => (
                <>
                  {isActive && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-xl bg-brand-soft" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                  <span className={cn('relative transition-colors', isActive ? 'text-brand' : 'text-muted hover:text-ink')}>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={onSearch} className="ml-auto hidden xl:block">
          <label className="group relative block">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted transition group-focus-within:text-brand" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Найти мероприятие…"
              className="h-10 w-60 rounded-2xl border border-line bg-surface/70 pr-4 pl-10 text-sm transition-all duration-300 outline-none focus:w-72 focus:border-brand focus:ring-4 focus:ring-brand/15"
              aria-label="Поиск по мероприятиям"
            />
          </label>
        </form>

        <div className="ml-auto flex items-center gap-1 xl:ml-2">
          <ThemeToggle />
          {user ? (
            <>
              <NotificationBell />
              <div className="hidden sm:block">
                <UserMenu />
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button to="/login" variant="ghost" size="sm">
                  Войти
                </Button>
              <Button to="/register" size="sm">Регистрация</Button>
            </div>
          )}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-xl text-ink transition hover:bg-surface-2 lg:hidden"
            aria-label="Меню"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="glass overflow-hidden border-b border-line lg:hidden"
          >
            <div className="mx-auto max-w-7xl space-y-1 px-4 pt-2 pb-5 sm:px-6">
              <form onSubmit={onSearch} className="mb-3">
                <label className="relative block">
                  <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Найти мероприятие…" className="h-11 w-full rounded-2xl border border-line bg-surface pr-4 pl-10 text-sm outline-none focus:border-brand" />
                </label>
              </form>
              {[...nav, ...(user ? [{ to: '/me/notifications', label: 'Уведомления' }, { to: '/me', label: 'Профиль' }] : [])].map((item, i) => (
                <motion.div key={item.to} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}>
                  <NavLink
                    to={item.to}
                    end={'end' in item ? item.end : true}
                    className={({ isActive }) => cn('block rounded-xl px-4 py-3 text-base font-semibold', isActive ? 'bg-brand-soft text-brand' : 'text-ink hover:bg-surface-2')}
                  >
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}
              <div className="pt-3">
                {user ? (
                  <Button variant="outline" className="w-full" onClick={() => logout().then(() => navigate('/'))}>
                    Выйти
                  </Button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button to="/login" variant="outline" className="w-full">
                        Войти
                      </Button>
                    <Button to="/register" className="w-full">Регистрация</Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
