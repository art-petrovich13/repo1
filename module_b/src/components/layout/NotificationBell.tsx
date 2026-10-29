import { Bell } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Link } from 'react-router'
import { useAuth } from '../../context/AuthContext'

export function NotificationBell() {
  const { unreadCount } = useAuth()
  return (
    <Link
      to="/me/notifications"
      className="group relative grid h-10 w-10 place-items-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-ink"
      aria-label={`Уведомления${unreadCount ? `: ${unreadCount} непрочитанных` : ''}`}
    >
      <Bell className="h-5 w-5 origin-top transition-transform group-hover:animate-[wiggle_0.6s_ease-in-out]" />
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 600, damping: 18 }}
            className="absolute top-1 right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand-2 px-1 text-[10px] font-bold text-white ring-2 ring-bg"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )
}
