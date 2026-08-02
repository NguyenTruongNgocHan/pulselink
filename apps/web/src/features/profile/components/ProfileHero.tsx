import { useRef } from 'react'

import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import type { UserProfile } from '@/features/profile/types/profile.types'
import { getInitials } from '@/shared/utils/avatar'
import { formatDateTime } from '@/shared/utils/date'

interface ProfileHeroProps {
  profile: UserProfile
  isUploadingAvatar: boolean
  onEdit: () => void
  onOpenPrivacy: () => void
  onOpenSecurity: () => void
  onUploadAvatar: (file: File) => Promise<void>
}

export function ProfileHero({
  profile,
  isUploadingAvatar,
  onEdit,
  onOpenPrivacy,
  onOpenSecurity,
  onUploadAvatar,
}: ProfileHeroProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelected = async (file: File | undefined) => {
    if (!file) return

    await onUploadAvatar(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <section className="profile-hero-v2">
      <div className="profile-hero-v2__cover">
        <div className="profile-hero-v2__cover-glow" />
      </div>

      <div className="profile-hero-v2__body">
        <div className="profile-hero-v2__identity">
          <button
            type="button"
            className="profile-hero-v2__avatar-button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload profile photo"
            disabled={isUploadingAvatar}
          >
            <Avatar
              initials={getInitials(profile.displayName)}
              src={profile.avatarUrl}
              alt={`${profile.displayName}'s avatar`}
              tone="violet"
              size="xl"
            />

            <span className="profile-hero-v2__camera" aria-hidden="true">
              <Icon
                name={isUploadingAvatar ? 'loader' : 'camera'}
                size={15}
                className={isUploadingAvatar ? 'icon-spin' : undefined}
              />
            </span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(event) =>
              void handleFileSelected(event.target.files?.[0])
            }
          />

          <div className="profile-hero-v2__copy">
            <span className="eyebrow">@{profile.username}</span>
            <h2>{profile.displayName}</h2>
            <p>{profile.bio || 'A quieter place to stay connected.'}</p>
            <small>
              PulseLink member since {formatDateTime(profile.createdAt)}
            </small>
          </div>
        </div>

        <div className="profile-hero-v2__actions">
          <Button variant="secondary" onClick={onOpenPrivacy}>
            <Icon name="shield" size={16} />
            Privacy
          </Button>

          <Button variant="secondary" onClick={onOpenSecurity}>
            <Icon name="lock" size={16} />
            Security
          </Button>

          <Button onClick={onEdit}>
            <Icon name="edit" size={16} />
            Edit profile
          </Button>
        </div>
      </div>
    </section>
  )
}
