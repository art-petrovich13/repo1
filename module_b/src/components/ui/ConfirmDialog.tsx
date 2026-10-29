import { useState, type ReactNode } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'

interface ConfirmProps {
  open: boolean
  title: string
  text?: ReactNode
  confirmText?: string
  tone?: 'danger' | 'primary'
  onConfirm: () => Promise<unknown> | void
  onClose: () => void
  children?: ReactNode
  confirmDisabled?: boolean
}

export function ConfirmDialog({ open, title, text, confirmText = 'Подтвердить', tone = 'danger', onConfirm, onClose, children, confirmDisabled }: ConfirmProps) {
  const [busy, setBusy] = useState(false)

  const run = async () => {
    setBusy(true)
    try {
      await onConfirm()
      onClose()
    } catch {
      /* ошибку показывает вызывающая сторона */
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      {text && <div className="text-sm leading-relaxed text-muted">{text}</div>}
      {children}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>
          Отмена
        </Button>
        <Button variant={tone} loading={busy} onClick={run} disabled={confirmDisabled}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}
