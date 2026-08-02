import type { ReactNode } from 'react'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/shared/components/overlay/Modal'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description: string
  confirmLabel: string
  children?: ReactNode
  reasonLabel?: string
  reason?: string
  destructive?: boolean
  isSubmitting?: boolean
  isConfirmDisabled?: boolean
  onReasonChange?: (value: string) => void
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  children,
  reasonLabel,
  reason = '',
  destructive = false,
  isSubmitting = false,
  isConfirmDisabled = false,
  onReasonChange,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const reasonRequired = Boolean(reasonLabel)
  const confirmDisabled =
    isSubmitting ||
    isConfirmDisabled ||
    (reasonRequired && reason.trim().length < 3)

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      description={description}
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={confirmDisabled}
          >
            {isSubmitting ? 'Working…' : confirmLabel}
          </Button>
        </>
      }
    >
      <div className="form-stack">
        {children}
        {reasonLabel && onReasonChange ? (
          <label className="form-field">
            <span>{reasonLabel}</span>
            <textarea
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Add a clear reason for this action"
            />
            <small>{reason.trim().length}/500</small>
          </label>
        ) : null}
      </div>
    </Modal>
  )
}
