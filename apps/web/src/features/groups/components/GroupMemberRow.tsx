import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import type { ConversationParticipant } from '@/features/conversations/types/conversation.types'
import { getInitials } from '@/shared/utils/avatar'

interface GroupMemberRowProps {
  member: ConversationParticipant
  canManage: boolean
  isWorking: boolean
  onTransferAdmin: () => void
  onRemove: () => void
}

export function GroupMemberRow({
  member,
  canManage,
  isWorking,
  onTransferAdmin,
  onRemove,
}: GroupMemberRowProps) {
  return (
    <article className="group-member-row">
      <Avatar
        initials={getInitials(member.displayName)}
        tone="violet"
        online={member.isOnline}
      />
      <span className="group-member-row__identity">
        <b>
          {member.displayName}
          {member.role === 'ADMIN' ? <em>Admin</em> : null}
        </b>
        <small>@{member.username}</small>
      </span>
      {canManage && member.role !== 'ADMIN' ? (
        <div className="group-member-row__actions">
          <Button variant="secondary" onClick={onTransferAdmin} disabled={isWorking}>
            Transfer admin
          </Button>
          <Button variant="danger" onClick={onRemove} disabled={isWorking}>
            Remove
          </Button>
        </div>
      ) : null}
    </article>
  )
}
