import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import { useLocation, useOutlet } from 'react-router'
import { Toaster } from '../ui/Toaster'
import { Aurora } from './Aurora'
import { Footer } from './Footer'
import { Header } from './Header'

/** Общий каркас: фон, шапка, анимированный переход страниц, футер, тосты. */
export function Layout() {
  const location = useLocation()
  const outlet = useOutlet()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [location.pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <Aurora />
      <Header />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-7xl flex-1 px-4 pt-8 sm:px-6"
        >
          {outlet}
        </motion.main>
      </AnimatePresence>
      <Footer />
      <Toaster />
    </div>
  )
}
