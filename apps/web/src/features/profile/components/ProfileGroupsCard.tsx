import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import type { ProfileGroup } from '@/features/profile/types/profile.types'
import { getInitials } from '@/shared/utils/avatar'

interface ProfileGroupsCardProps {
  groups: ProfileGroup[]
  onCreateGroup: () => void
  onOpenGroup: (groupId: string) => void
}

export function ProfileGroupsCard({
  groups,
  onCreateGroup,
  onOpenGroup,
}: ProfileGroupsCardProps) {
  return (
    <section className="profile-section-card">
      <header>
        <div>
          <h2>Your groups</h2>
          <p>Private spaces you are part of.</p>
        </div>
        <Button variant="ghost" onClick={onCreateGroup}>
          New group
        </Button>
      </header>

      <div className="profile-groups-list">
        {groups.map((group) => (
          <button key={group.id} type="button" onClick={() => onOpenGroup(group.id)}>
            <Avatar initials={getInitials(group.name)} tone="violet" />
            <span>
              <b>{group.name}</b>
              <small>View group details</small>
            </span>
            <Icon name="chevron" size={16} />
          </button>
        ))}
        {groups.length === 0 ? (
          <p className="muted-copy">You have not joined any groups yet.</p>
        ) : null}
      </div>
    </section>
  )
}
