import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { GroupMemberRow } from '@/features/groups/components/GroupMemberRow'
import { useGroup } from '@/features/groups/hooks/useGroup'
import { InlineAlert } from '@/shared/components/feedback/InlineAlert'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { ConfirmDialog } from '@/shared/components/overlay/ConfirmDialog'
import { routes } from '@/shared/constants/routes'
import { getApiErrorMessage } from '@/shared/utils/apiError'

interface PendingAction {
  type: 'REMOVE' | 'TRANSFER' | 'LEAVE'
  memberId?: string
  memberName?: string
}

export function GroupAdminPage() {
  const navigate = useNavigate()
  const { groupId = '' } = useParams()
  const {
    groupQuery,
    removeMemberMutation,
    transferAdminMutation,
    leaveMutation,
  } = useGroup(groupId)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)

  if (groupQuery.isLoading) {
    return (
      <section className="group-page">
        <LoadingState label="Loading group administration" rows={6} />
      </section>
    )
  }

  if (groupQuery.error || !groupQuery.data) {
    return (
      <section className="group-page">
        <InlineAlert tone="danger">
          {groupQuery.error
            ? getApiErrorMessage(groupQuery.error)
            : 'Group not found.'}
        </InlineAlert>
      </section>
    )
  }

  const group = groupQuery.data
  const error =
    removeMemberMutation.error ??
    transferAdminMutation.error ??
    leaveMutation.error

  const dismissError = () => {
    removeMemberMutation.reset()
    transferAdminMutation.reset()
    leaveMutation.reset()
  }

  const isWorking =
    removeMemberMutation.isPending ||
    transferAdminMutation.isPending ||
    leaveMutation.isPending

  const confirmAction = async () => {
    if (!pendingAction) return

    if (pendingAction.type === 'REMOVE' && pendingAction.memberId) {
      await removeMemberMutation.mutateAsync(pendingAction.memberId)
    }

    if (pendingAction.type === 'TRANSFER' && pendingAction.memberId) {
      await transferAdminMutation.mutateAsync(pendingAction.memberId)
    }

    if (pendingAction.type === 'LEAVE') {
      await leaveMutation.mutateAsync()
      navigate(routes.conversations)
    }

    setPendingAction(null)
  }

  const onlineCount = group.members.filter((member) => member.isOnline).length

  return (
    <section className="group-page group-admin-page">
      <header className="group-page-header">
        <button
          type="button"
          className="icon-button"
          aria-label="Back to group details"
          onClick={() => navigate(routes.groupDetails(group.id))}
        >
          <Icon name="arrowLeft" />
        </button>

        <div>
          <b>Manage group</b>
          <small>{group.name}</small>
        </div>
      </header>

      <div className="group-admin-content">
        <section className="group-admin-summary">
          <div>
            <span className="eyebrow">Group administration</span>
            <h1>{group.name}</h1>
            <p>Manage member access and keep the group ownership clear.</p>
          </div>

          <div className="group-admin-summary__stats">
            <span>
              <b>{group.members.length}</b>
              <small>Members</small>
            </span>
            <span>
              <b>{onlineCount}</b>
              <small>Online</small>
            </span>
            <span>
              <b>1</b>
              <small>Admin</small>
            </span>
          </div>
        </section>

        <div className="group-admin-notice">
          <Icon name="shield" />
          <span>
            <b>You are the group admin</b>
            <small>
              You can remove members or transfer administration to another
              member.
            </small>
          </span>
        </div>

        {error ? (
          <InlineAlert tone="danger" onDismiss={dismissError}>
            {getApiErrorMessage(error)}
          </InlineAlert>
        ) : null}

        <section className="group-admin-members">
          <header>
            <div>
              <h2>Members</h2>
              <p>Manage access to this private group.</p>
            </div>
            <span>{group.members.length} total</span>
          </header>

          <div className="group-admin-member-list">
            {group.members.map((member) => (
              <GroupMemberRow
                key={member.id}
                member={member}
                canManage={group.currentUserRole === 'ADMIN'}
                isWorking={isWorking}
                onTransferAdmin={() =>
                  setPendingAction({
                    type: 'TRANSFER',
                    memberId: member.id,
                    memberName: member.displayName,
                  })
                }
                onRemove={() =>
                  setPendingAction({
                    type: 'REMOVE',
                    memberId: member.id,
                    memberName: member.displayName,
                  })
                }
              />
            ))}
          </div>
        </section>

        <section className="group-admin-danger">
          <div>
            <span className="eyebrow">Membership</span>
            <h2>Leave this group</h2>
            <p>
              Transfer the admin role first so the group always keeps an
              administrator.
            </p>
          </div>

          <Button
            variant="danger"
            onClick={() => setPendingAction({ type: 'LEAVE' })}
          >
            Leave group
          </Button>
        </section>
      </div>

      <ConfirmDialog
        isOpen={Boolean(pendingAction)}
        title={
          pendingAction?.type === 'TRANSFER'
            ? `Transfer admin to ${pendingAction.memberName}?`
            : pendingAction?.type === 'REMOVE'
              ? `Remove ${pendingAction.memberName}?`
              : 'Leave this group?'
        }
        description={
          pendingAction?.type === 'TRANSFER'
            ? 'You will become a regular member immediately after the transfer.'
            : pendingAction?.type === 'REMOVE'
              ? 'This person will lose access to new group messages.'
              : 'You will lose access to future messages in this group.'
        }
        confirmLabel={
          pendingAction?.type === 'TRANSFER'
            ? 'Transfer admin'
            : pendingAction?.type === 'REMOVE'
              ? 'Remove member'
              : 'Leave group'
        }
        destructive={pendingAction?.type !== 'TRANSFER'}
        isSubmitting={isWorking}
        onCancel={() => setPendingAction(null)}
        onConfirm={() => void confirmAction()}
      />
    </section>
  )
}