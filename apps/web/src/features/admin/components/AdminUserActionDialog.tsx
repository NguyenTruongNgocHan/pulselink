import type { AdminUserActionState } from '@/features/admin/types/admin.types'
import { ConfirmDialog } from '@/shared/components/overlay/ConfirmDialog'

interface AdminUserActionDialogProps {
  action: AdminUserActionState | null
  reason: string
  suspendedUntil: string
  isSubmitting: boolean
  onReasonChange: (value: string) => void
  onSuspendedUntilChange: (value: string) => void
  onCancel: () => void
  onConfirm: () => void
}

export function AdminUserActionDialog({
  action,
  reason,
  suspendedUntil,
  isSubmitting,
  onReasonChange,
  onSuspendedUntilChange,
  onCancel,
  onConfirm,
}: AdminUserActionDialogProps) {
  return (
    <ConfirmDialog
      isOpen={Boolean(action)}
      title={action?.title ?? ''}
      description={action?.description ?? ''}
      confirmLabel={action?.confirmLabel ?? 'Confirm'}
      reasonLabel="Mandatory reason"
      reason={reason}
      destructive={action?.destructive}
      isSubmitting={isSubmitting}
      isConfirmDisabled={
        reason.trim().length < 3 ||
        (action?.action === 'suspend' && suspendedUntil.length === 0)
      }
      onReasonChange={onReasonChange}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      {action?.action === 'suspend' ? (
        <label className="form-field">
          <span>Suspension end date</span>
          <input
            type="datetime-local"
            value={suspendedUntil}
            min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
            onChange={(event) => onSuspendedUntilChange(event.target.value)}
          />
        </label>
      ) : null}
    </ConfirmDialog>
  )
}
