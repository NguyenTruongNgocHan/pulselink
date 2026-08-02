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
    <section className="profile-card-v2">
      <header className="profile-card-v2__header">
        <div>
          <span className="profile-card-v2__icon">
            <Icon name="users" size={17} />
          </span>

          <span>
            <h2>Your groups</h2>
            <p>Private spaces you are part of.</p>
          </span>
        </div>

        <button
          type="button"
          className="profile-card-v2__action"
          onClick={onCreateGroup}
        >
          New group
        </button>
      </header>

      {groups.length > 0 ? (
        <div className="profile-groups-v2">
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => onOpenGroup(group.id)}
            >
              <Avatar
                initials={getInitials(group.name)}
                tone="violet"
              />

              <span>
                <strong>{group.name}</strong>
                <small>Open group details</small>
              </span>

              <span className="profile-groups-v2__arrow">
                <Icon name="chevron" size={16} />
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="profile-card-v2__empty">
          <span>
            <Icon name="users" size={20} />
          </span>
          <strong>No groups yet</strong>
          <p>Create a private space for your circle.</p>
          <Button variant="secondary" onClick={onCreateGroup}>
            Create group
          </Button>
        </div>
      )}
    </section>
  )
}
