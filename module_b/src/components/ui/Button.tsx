import { Loader2 } from 'lucide-react'
import { motion, type HTMLMotionProps } from 'motion/react'
import { forwardRef, type ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from '../../lib/cn'

const MotionLink = motion.create(Link)

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'success'
type Size = 'sm' | 'md' | 'lg' | 'icon'

const variants: Record<Variant, string> = {
  primary: 'bg-brand-gradient text-white shadow-glow hover:brightness-110',
  secondary: 'bg-brand-soft text-brand hover:bg-brand/15',
  outline: 'border border-line bg-surface text-ink hover:border-brand/50 hover:text-brand',
  ghost: 'text-muted hover:bg-surface-2 hover:text-ink',
  danger: 'bg-danger text-white hover:brightness-110 shadow-[0_10px_30px_-12px_var(--c-danger)]',
  success: 'bg-success text-white hover:brightness-110',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-xl',
  md: 'h-11 px-5 text-sm gap-2 rounded-2xl',
  lg: 'h-13 px-7 text-base gap-2.5 rounded-2xl',
  icon: 'h-10 w-10 rounded-xl',
}

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
  children?: ReactNode
  /** Если задан — кнопка рендерится ссылкой (без вложения <button> в <a>) */
  to?: string
  /** Доп. классы для варианта-ссылки (ширина, отступы) */
  linkClassName?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, icon, children, className, disabled, to, linkClassName, ...rest },
  ref,
) {
  const classes = cn(
    'relative inline-flex shrink-0 cursor-pointer items-center justify-center overflow-hidden font-semibold whitespace-nowrap transition-[filter,background-color,color,border-color] duration-200 select-none disabled:cursor-not-allowed disabled:opacity-55',
    variants[variant],
    sizes[size],
    className,
    linkClassName,
  )
  const content = (
    <>
      {variant === 'primary' && !disabled && (
        <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shine bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      )}
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </>
  )

  if (to) {
    const { title } = rest as { title?: string }
    return (
      <MotionLink to={to} title={title} whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className={classes}>
        {content}
      </MotionLink>
    )
  }

  return (
    <motion.button
      ref={ref}
      whileHover={disabled || loading ? undefined : { y: -1 }}
      whileTap={disabled || loading ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      disabled={disabled || loading}
      className={classes}
      {...rest}
    >
      {content}
    </motion.button>
  )
})
