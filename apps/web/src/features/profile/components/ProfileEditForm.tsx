import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

interface ProfileEditFormProps {
  displayName: string
  bio: string
  isSaving: boolean
  onDisplayNameChange: (value: string) => void
  onBioChange: (value: string) => void
  onCancel: () => void
  onSubmit: () => void
}

export function ProfileEditForm({
  displayName,
  bio,
  isSaving,
  onDisplayNameChange,
  onBioChange,
  onCancel,
  onSubmit,
}: ProfileEditFormProps) {
  return (
    <section className="profile-card-v2 profile-edit-v2">
      <header className="profile-card-v2__header">
        <div>
          <span className="profile-card-v2__icon">
            <Icon name="edit" size={17} />
          </span>

          <span>
            <h2>Edit profile</h2>
            <p>Keep your identity clear and recognizable.</p>
          </span>
        </div>

        <button
          type="button"
          className="profile-edit-v2__close"
          onClick={onCancel}
          aria-label="Close editor"
        >
          <Icon name="x" size={17} />
        </button>
      </header>

      <div className="profile-edit-v2__fields">
        <label>
          <span>Display name</span>
          <input
            value={displayName}
            onChange={(event) =>
              onDisplayNameChange(event.target.value)
            }
            maxLength={100}
            autoComplete="name"
          />
          <small>{displayName.length}/100</small>
        </label>

        <label>
          <span>Bio</span>
          <textarea
            value={bio}
            onChange={(event) => onBioChange(event.target.value)}
            rows={4}
            maxLength={160}
          />
          <small>{bio.length}/160</small>
        </label>
      </div>

      <div className="profile-edit-v2__actions">
        <Button
          variant="secondary"
          disabled={isSaving}
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          disabled={!displayName.trim() || isSaving}
          onClick={onSubmit}
        >
          {isSaving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </section>
  )
}
