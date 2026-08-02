import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { AdminModerationHistory } from '@/features/admin/components/AdminModerationHistory'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import { AdminRoleDialog } from '@/features/admin/components/AdminRoleDialog'
import { AdminUserActionDialog } from '@/features/admin/components/AdminUserActionDialog'
import { AdminUserActionsCard } from '@/features/admin/components/AdminUserActionsCard'
import { AdminUserProfileCard } from '@/features/admin/components/AdminUserProfileCard'
import { useAdminUser } from '@/features/admin/hooks/useAdminUsers'
import type {
  AdminUserActionState,
  SystemRole,
} from '@/features/admin/types/admin.types'
import { InlineAlert } from '@/shared/components/feedback/InlineAlert'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { getApiErrorMessage } from '@/shared/utils/apiError'

export function AdminUserDetailsPage() {
  const navigate = useNavigate()
  const { userId = '' } = useParams()
  const { userQuery, actionMutation, roleMutation } = useAdminUser(userId)
  const [pendingAction, setPendingAction] = useState<AdminUserActionState | null>(null)
  const [reason, setReason] = useState('')
  const [suspendedUntil, setSuspendedUntil] = useState('')
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [nextRole, setNextRole] = useState<SystemRole>('USER')
  const [roleReason, setRoleReason] = useState('')

  if (userQuery.isLoading) {
    return (
      <section className="admin-page">
        <LoadingState rows={8} label="Loading user details" />
      </section>
    )
  }

  if (userQuery.error || !userQuery.data) {
    return (
      <section className="admin-page">
        <InlineAlert tone="danger">
          {userQuery.error ? getApiErrorMessage(userQuery.error) : 'User not found.'}
        </InlineAlert>
      </section>
    )
  }

  const user = userQuery.data
  const error = actionMutation.error ?? roleMutation.error
  const dismissError = () => {
    actionMutation.reset()
    roleMutation.reset()
  }

  const closeActionDialog = () => {
    setPendingAction(null)
    setReason('')
    setSuspendedUntil('')
  }

  const executeAction = async () => {
    if (!pendingAction) return

    await actionMutation.mutateAsync({
      action: pendingAction.action,
      reason: reason.trim(),
      ...(pendingAction.action === 'suspend' && suspendedUntil
        ? { until: new Date(suspendedUntil).toISOString() }
        : {}),
    })
    closeActionDialog()
  }

  const openRoleDialog = () => {
    setNextRole(user.role)
    setRoleReason('')
    setRoleModalOpen(true)
  }

  const updateRole = async () => {
    await roleMutation.mutateAsync({
      role: nextRole,
      reason: roleReason.trim(),
    })
    setRoleModalOpen(false)
    setRoleReason('')
  }

  return (
    <section className="admin-page">
      <button type="button" className="back-link" onClick={() => navigate('/admin/users')}>
        <Icon name="arrowLeft" size={17} />
        User directory
      </button>

      <AdminPageHeader
        eyebrow={`Account ${user.id.slice(0, 8)}`}
        title={user.displayName}
        description={`@${user.username} · ${user.email}`}
        actions={
          <Button variant="secondary" onClick={openRoleDialog}>
            Change role
          </Button>
        }
      />

      {error ? (
        <InlineAlert tone="danger" onDismiss={dismissError}>
          {getApiErrorMessage(error)}
        </InlineAlert>
      ) : null}

      <div className="admin-user-detail-grid">
        <AdminUserProfileCard user={user} />
        <AdminUserActionsCard status={user.status} onSelectAction={setPendingAction} />
      </div>

      <AdminModerationHistory entries={user.moderationHistory} />

      <AdminUserActionDialog
        action={pendingAction}
        reason={reason}
        suspendedUntil={suspendedUntil}
        isSubmitting={actionMutation.isPending}
        onReasonChange={setReason}
        onSuspendedUntilChange={setSuspendedUntil}
        onCancel={closeActionDialog}
        onConfirm={() => void executeAction()}
      />

      <AdminRoleDialog
        isOpen={roleModalOpen}
        role={nextRole}
        reason={roleReason}
        isSubmitting={roleMutation.isPending}
        onRoleChange={setNextRole}
        onReasonChange={setRoleReason}
        onClose={() => setRoleModalOpen(false)}
        onSubmit={() => void updateRole()}
      />
    </section>
  )
}
