import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ProfileEditForm } from '@/features/profile/components/ProfileEditForm'
import { ProfileGroupsCard } from '@/features/profile/components/ProfileGroupsCard'
import { ProfileHero } from '@/features/profile/components/ProfileHero'
import { ProfileMediaCard } from '@/features/profile/components/ProfileMediaCard'
import { ProfileStat } from '@/features/profile/components/ProfileStat'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { InlineAlert } from '@/shared/components/feedback/InlineAlert'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { routes } from '@/shared/constants/routes'
import { getApiErrorMessage } from '@/shared/utils/apiError'

export function ProfilePage() {
  const navigate = useNavigate()
  const { profileQuery, updateMutation, avatarMutation } = useProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    if (!profileQuery.data) return
    setDisplayName(profileQuery.data.displayName)
    setBio(profileQuery.data.bio)
  }, [profileQuery.data])

  if (profileQuery.isLoading || !profileQuery.data) {
    return (
      <main className="profile-page">
        <LoadingState rows={8} label="Loading profile" />
      </main>
    )
  }

  const profile = profileQuery.data
  const error = profileQuery.error ?? updateMutation.error ?? avatarMutation.error
  const dismissError = () => {
    updateMutation.reset()
    avatarMutation.reset()
  }

  const cancelEditing = () => {
    setDisplayName(profile.displayName)
    setBio(profile.bio)
    setIsEditing(false)
  }

  const saveProfile = async () => {
    await updateMutation.mutateAsync({
      displayName: displayName.trim(),
      bio: bio.trim(),
    })
    setIsEditing(false)
  }

  return (
    <main className="profile-page">
      <ProfileHero
        profile={profile}
        isUploadingAvatar={avatarMutation.isPending}
        onEdit={() => setIsEditing(true)}
        onOpenPrivacy={() => navigate(routes.privacy)}
        onOpenSecurity={() => navigate(routes.security)}
        onUploadAvatar={(file) => avatarMutation.mutateAsync(file).then(() => undefined)}
      />

      <div className="profile-content">
        {error ? (
          <InlineAlert tone="danger" onDismiss={dismissError}>
            {getApiErrorMessage(error)}
          </InlineAlert>
        ) : null}

        <section className="profile-stats-card" aria-label="Profile statistics">
          <ProfileStat value={profile.stats.connectionCount} label="Connections" />
          <ProfileStat value={profile.stats.messageCount} label="Messages sent" />
          <ProfileStat value={profile.stats.groupCount} label="Groups" />
          <ProfileStat value={profile.stats.reportCount} label="Reports" />
        </section>

        {isEditing ? (
          <ProfileEditForm
            displayName={displayName}
            bio={bio}
            isSaving={updateMutation.isPending}
            onDisplayNameChange={setDisplayName}
            onBioChange={setBio}
            onCancel={cancelEditing}
            onSubmit={() => void saveProfile()}
          />
        ) : null}

        <div className="profile-grid">
          <ProfileMediaCard media={profile.recentMedia} />
          <ProfileGroupsCard
            groups={profile.groups}
            onCreateGroup={() => navigate(routes.createGroup)}
            onOpenGroup={(groupId) => navigate(routes.groupDetails(groupId))}
          />
        </div>
      </div>
    </main>
  )
}
