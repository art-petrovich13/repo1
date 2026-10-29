import { Bell, CalendarCheck, ChevronDown, Heart, LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Avatar } from '../ui/Avatar'

export function UserMenu() {
  const { user, isRepresentative, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  if (!user) return null

  const items = [
    { to: '/me', label: 'Профиль', icon: UserIcon },
    { to: '/me/registrations', label: 'Мои регистрации', icon: CalendarCheck },
    { to: '/me/reactions', label: 'Мои реакции', icon: Heart },
    { to: '/me/notifications', label: 'Уведомления', icon: Bell },
    ...(isRepresentative ? [{ to: '/me/events', label: 'Мои мероприятия', icon: LayoutDashboard }] : []),
  ]

  const doLogout = async () => {
    setOpen(false)
    await logout()
    toast.info('Вы вышли из аккаунта')
    navigate('/')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex cursor-pointer items-center gap-2 rounded-2xl p-1 pr-2 transition hover:bg-surface-2"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar name={user.name} url={user.avatar_url} size={34} />
        <span className="hidden max-w-32 truncate text-sm font-semibold lg:block">{user.name.split(' ')[0]}</span>
        <ChevronDown className={`h-4 w-4 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className="card absolute right-0 z-50 mt-2 w-64 origin-top-right overflow-hidden p-2"
          >
            <div className="flex items-center gap-3 border-b border-line px-3 pt-2 pb-3">
              <Avatar name={user.name} url={user.avatar_url} size={40} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
            </div>
            <div className="py-1.5">
              {items.map(({ to, label, icon: Icon }, i) => (
                <motion.div key={to} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                  <Link to={to} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-surface-2 hover:text-brand" role="menuitem">
                    <Icon className="h-4 w-4 text-muted" />
                    {label}
                  </Link>
                </motion.div>
              ))}
            </div>
            <button onClick={doLogout} className="flex w-full cursor-pointer items-center gap-3 rounded-xl border-t border-line px-3 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger/10" role="menuitem">
              <LogOut className="h-4 w-4" />
              Выйти
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
