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
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <header className="profile-cover">
      <div className="profile-cover__glow" />
      <div className="profile-identity">
        <button
          type="button"
          className="profile-avatar-button"
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
          <span aria-hidden="true">
            <Icon
              name={isUploadingAvatar ? 'loader' : 'camera'}
              size={16}
              className={isUploadingAvatar ? 'icon-spin' : undefined}
            />
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(event) => void handleFileSelected(event.target.files?.[0])}
        />

        <div>
          <span className="eyebrow">@{profile.username}</span>
          <h1>{profile.displayName}</h1>
          <p>{profile.bio || 'A quieter place to stay connected.'}</p>
          <small>Joined {formatDateTime(profile.createdAt)}</small>
        </div>

        <div className="profile-actions">
          <Button variant="secondary" onClick={onOpenPrivacy}>
            <Icon name="shield" size={17} />
            Privacy
          </Button>
          <Button variant="secondary" onClick={onOpenSecurity}>
            <Icon name="lock" size={17} />
            Security
          </Button>
          <Button onClick={onEdit}>
            <Icon name="edit" size={17} />
            Edit profile
          </Button>
        </div>
      </div>
    </header>
  )
}
