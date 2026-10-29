import { ShieldCheck } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useSearchParams } from 'react-router'
import { PageHeader } from '../../components/ui/PageHeader'
import { Tabs } from '../../components/ui/Tabs'
import { CategoriesTab } from './CategoriesTab'
import { ClubsTab } from './ClubsTab'
import { UsersTab } from './UsersTab'

type Tab = 'users' | 'clubs' | 'categories'

/** Админ-панель: пользователи (блокировка, верификация представителей), Комьюнити, категории. */
export default function AdminPage() {
  const [params, setParams] = useSearchParams()
  const tab = (['users', 'clubs', 'categories'].includes(params.get('tab') ?? '') ? params.get('tab') : 'users') as Tab

  return (
    <div>
      <PageHeader
        eyebrow="Администратор"
        title={
          <span className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
              <ShieldCheck className="h-6 w-6" />
            </span>
            Админ-панель
          </span>
        }
        text="Модерация пользователей, верификация представителей Комьюнити, справочники Комьюнити и категорий."
      />

      <div className="mb-6">
        <Tabs
          value={tab}
          onChange={(t) => setParams({ tab: t }, { replace: true })}
          items={[
            { value: 'users', label: 'Пользователи' },
            { value: 'clubs', label: 'Комьюнити' },
            { value: 'categories', label: 'Категории' },
          ]}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
          {tab === 'users' && <UsersTab />}
          {tab === 'clubs' && <ClubsTab />}
          {tab === 'categories' && <CategoriesTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
