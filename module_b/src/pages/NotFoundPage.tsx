import { Compass } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '../components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <motion.div initial={{ scale: 0.6, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }} className="mb-6 grid h-24 w-24 place-items-center rounded-[2rem] bg-brand-gradient text-white shadow-glow">
        <Compass className="h-11 w-11 animate-[spin_8s_linear_infinite]" />
      </motion.div>
      <h1 className="font-display text-6xl font-bold text-gradient">404</h1>
      <p className="mt-3 max-w-md text-muted">Такой страницы нет — возможно, мероприятие удалено или ссылка устарела.</p>
      <Button to="/" linkClassName="mt-8">Вернуться в афишу</Button>
    </div>
  )
}
