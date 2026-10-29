import { AnimatePresence, motion } from 'motion/react'
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

const control =
  'w-full rounded-2xl border bg-surface px-4 text-sm text-ink placeholder:text-muted/70 transition-all duration-200 outline-none focus:border-brand focus:ring-4 focus:ring-brand/15 disabled:opacity-60'

interface WrapProps {
  label?: string
  error?: string
  hint?: string
  id: string
  children: ReactNode
  className?: string
}

function Wrap({ label, error, hint, id, children, className }: WrapProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
      )}
      {children}
      <AnimatePresence initial={false}>
        {error ? (
          <motion.p
            key="err"
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs font-medium text-danger"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <p className="text-xs text-muted">{hint}</p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  wrapClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, icon, className, wrapClassName, id, ...rest },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <Wrap label={label} error={error} hint={hint} id={inputId} className={wrapClassName}>
      <div className="relative">
        {icon && <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted">{icon}</span>}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          className={cn(control, 'h-11', Boolean(icon) && 'pl-10', error ? 'border-danger' : 'border-line', className)}
          {...rest}
        />
      </div>
    </Wrap>
  )
})

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ label, error, hint, className, id, ...rest }, ref) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <Wrap label={label} error={error} hint={hint} id={inputId}>
      <textarea
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        className={cn(control, 'min-h-32 resize-y py-3 leading-relaxed', error ? 'border-danger' : 'border-line', className)}
        {...rest}
      />
    </Wrap>
  )
})

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  wrapClassName?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, className, wrapClassName, id, children, ...rest },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <Wrap label={label} error={error} hint={hint} id={inputId} className={wrapClassName}>
      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          className={cn(control, 'h-11 cursor-pointer appearance-none pr-10', error ? 'border-danger' : 'border-line', className)}
          {...rest}
        >
          {children}
        </select>
        <svg className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-muted" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5.25 7.5 10 12.25 14.75 7.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Wrap>
  )
})
