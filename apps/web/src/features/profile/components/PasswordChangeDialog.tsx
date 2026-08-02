import { Button } from '@/components/ui/Button'
import { Modal } from '@/shared/components/overlay/Modal'

interface PasswordChangeDialogProps {
  isOpen: boolean
  currentPassword: string
  newPassword: string
  isSubmitting: boolean
  onCurrentPasswordChange: (value: string) => void
  onNewPasswordChange: (value: string) => void
  onCancel: () => void
  onSubmit: () => void
}

export function PasswordChangeDialog({
  isOpen,
  currentPassword,
  newPassword,
  isSubmitting,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onCancel,
  onSubmit,
}: PasswordChangeDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      title="Change password"
      description="Your other active sessions will be revoked after this update."
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <Button variant="secondary" disabled={isSubmitting} onClick={onCancel}>
            Cancel
          </Button>
          <Button
            disabled={currentPassword.length === 0 || newPassword.length < 8 || isSubmitting}
            onClick={onSubmit}
          >
            {isSubmitting ? 'Updating…' : 'Update password'}
          </Button>
        </>
      }
    >
      <div className="form-stack">
        <label className="form-field">
          <span>Current password</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(event) => onCurrentPasswordChange(event.target.value)}
            autoComplete="current-password"
            autoFocus
          />
        </label>
        <label className="form-field">
          <span>New password</span>
          <input
            type="password"
            value={newPassword}
            onChange={(event) => onNewPasswordChange(event.target.value)}
            autoComplete="new-password"
            minLength={8}
          />
          <small>At least 8 characters.</small>
        </label>
      </div>
    </Modal>
  )
}
