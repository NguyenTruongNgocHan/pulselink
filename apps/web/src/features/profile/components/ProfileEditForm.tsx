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
    <section className="profile-edit-card">
      <header>
        <div>
          <h2>Edit profile</h2>
          <p>Keep your profile clear and recognizable to your trusted circle.</p>
        </div>
        <button type="button" className="icon-button" onClick={onCancel} aria-label="Close editor">
          <Icon name="x" />
        </button>
      </header>

      <label className="form-field">
        <span>Display name</span>
        <input
          value={displayName}
          onChange={(event) => onDisplayNameChange(event.target.value)}
          maxLength={100}
          autoComplete="name"
        />
        <small>{displayName.length}/100</small>
      </label>

      <label className="form-field">
        <span>Bio</span>
        <textarea
          value={bio}
          onChange={(event) => onBioChange(event.target.value)}
          rows={4}
          maxLength={160}
        />
        <small>{bio.length}/160</small>
      </label>

      <div className="profile-edit-card__actions">
        <Button variant="secondary" disabled={isSaving} onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={!displayName.trim() || isSaving} onClick={onSubmit}>
          {isSaving ? 'Saving…' : 'Save profile'}
        </Button>
      </div>
    </section>
  )
}
