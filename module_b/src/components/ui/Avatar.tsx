import { assetUrl } from '../../lib/event'
import { cn } from '../../lib/cn'

const gradients = [
  'from-[#6d4aff] to-[#ff4d8d]',
  'from-[#0ea5e9] to-[#6366f1]',
  'from-[#f97316] to-[#ec4899]',
  'from-[#10b981] to-[#0ea5e9]',
  'from-[#a855f7] to-[#6366f1]',
]

/** Аватар: картинка или первая буква имени на градиенте. */
export function Avatar({ name, url, size = 40, className }: { name: string; url?: string | null; size?: number; className?: string }) {
  const src = assetUrl(url)
  const g = gradients[(name.codePointAt(0) ?? 0) % gradients.length]
  return (
    <span
      className={cn('relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br font-display font-semibold text-white', g, className)}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : name.trim().charAt(0).toUpperCase()}
    </span>
  )
}
