import { Button } from '@/components/ui/Button'
import type { SystemRole } from '@/features/admin/types/admin.types'
import { Modal } from '@/shared/components/overlay/Modal'

interface AdminRoleDialogProps {
  isOpen: boolean
  role: SystemRole
  reason: string
  isSubmitting: boolean
  onRoleChange: (role: SystemRole) => void
  onReasonChange: (reason: string) => void
  onClose: () => void
  onSubmit: () => void
}

export function AdminRoleDialog({
  isOpen,
  role,
  reason,
  isSubmitting,
  onRoleChange,
  onReasonChange,
  onClose,
  onSubmit,
}: AdminRoleDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      title="Change system role"
      description="Only a super administrator can change staff roles. Hierarchy is rechecked by the API."
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={reason.trim().length < 3 || isSubmitting}
            onClick={onSubmit}
          >
            {isSubmitting ? 'Updating…' : 'Update role'}
          </Button>
        </>
      }
    >
      <div className="form-stack">
        <label className="form-field">
          <span>Role</span>
          <select
            value={role}
            onChange={(event) => onRoleChange(event.target.value as SystemRole)}
          >
            <option value="USER">User</option>
            <option value="MODERATOR">Moderator</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super admin</option>
          </select>
        </label>
        <label className="form-field">
          <span>Mandatory reason</span>
          <textarea
            rows={4}
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            maxLength={500}
          />
        </label>
      </div>
    </Modal>
  )
}
