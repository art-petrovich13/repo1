import { Hammer } from 'lucide-react'
import { EmptyState } from '../components/ui/EmptyState'

export default function Placeholder({ title }: { title: string }) {
  return <EmptyState icon={<Hammer />} title={title} text="Раздел в разработке" />
}
