import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PrivacyToggle } from '@/features/privacy/components/PrivacyToggle'
import { usePrivacySettings } from '@/features/privacy/hooks/usePrivacySettings'
import type { PrivacySettings } from '@/features/privacy/types/privacy.types'
import { InlineAlert } from '@/shared/components/feedback/InlineAlert'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { getApiErrorMessage } from '@/shared/utils/apiError'

export function PrivacyPage() {
  const { settingsQuery, updateMutation } = usePrivacySettings()
  const [draft, setDraft] = useState<PrivacySettings | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settingsQuery.data) setDraft(settingsQuery.data)
  }, [settingsQuery.data])

  if (settingsQuery.isLoading || !draft) {
    return (
      <main className="settings-page">
        <div className="settings-content">
          <LoadingState rows={8} label="Loading privacy settings" />
        </div>
      </main>
    )
  }

  const updateField = <K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K],
  ) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current))
    setSaved(false)
  }

  const save = async () => {
    await updateMutation.mutateAsync(draft)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2_500)
  }

  const error = settingsQuery.error ?? updateMutation.error
  const dismissError = () => updateMutation.reset()

  return (
    <main className="settings-page">
      <div className="settings-content">
        <header className="settings-header">
          <div>
            <span className="eyebrow">Your boundaries</span>
            <h1>Privacy</h1>
            <p>Control how people can find you and what realtime signals you share.</p>
          </div>
          <span className="settings-header__icon">
            <Icon name="shield" size={25} />
          </span>
        </header>

        {error ? (
          <InlineAlert tone="danger" onDismiss={dismissError}>
            {getApiErrorMessage(error)}
          </InlineAlert>
        ) : null}
        {saved ? <InlineAlert tone="success">Privacy settings saved.</InlineAlert> : null}

        <section className="settings-card">
          <header>
            <h2>Discoverability</h2>
            <p>Choose who can discover and contact you.</p>
          </header>

          <PrivacyToggle
            title="Appear in people search"
            description="Allow other PulseLink members to find your profile."
            checked={draft.discoverable}
            onChange={(value) => updateField('discoverable', value)}
          />
          <PrivacyToggle
            title="Allow friend requests"
            description="People can invite you to join their trusted circle."
            checked={draft.allowFriendRequests}
            onChange={(value) => updateField('allowFriendRequests', value)}
          />
          <PrivacyToggle
            title="Allow direct messages"
            description="Friends can start a direct conversation with you."
            checked={draft.allowDirectMessages}
            onChange={(value) => updateField('allowDirectMessages', value)}
          />

          <label className="settings-select-row">
            <span>
              <b>Profile visibility</b>
              <small>Control who can see your complete profile.</small>
            </span>
            <select
              value={draft.profileVisibility}
              onChange={(event) =>
                updateField(
                  'profileVisibility',
                  event.target.value as PrivacySettings['profileVisibility'],
                )
              }
            >
              <option value="EVERYONE">Everyone</option>
              <option value="FRIENDS">Friends only</option>
              <option value="NOBODY">Only me</option>
            </select>
          </label>
        </section>

        <section className="settings-card">
          <header>
            <h2>Presence and message signals</h2>
            <p>Decide what other participants can see while you chat.</p>
          </header>

          <PrivacyToggle
            title="Show online status"
            description="Friends can see when you are connected to PulseLink."
            checked={draft.showOnlineStatus}
            onChange={(value) => updateField('showOnlineStatus', value)}
          />
          <PrivacyToggle
            title="Show last active time"
            description="Friends can see when you were last active."
            checked={draft.showLastActive}
            onChange={(value) => updateField('showLastActive', value)}
          />
          <PrivacyToggle
            title="Send read receipts"
            description="Participants can see when you have read their messages."
            checked={draft.sendReadReceipts}
            onChange={(value) => updateField('sendReadReceipts', value)}
          />
          <PrivacyToggle
            title="Show typing indicators"
            description="Participants can see when you are composing a message."
            checked={draft.showTypingIndicators}
            onChange={(value) => updateField('showTypingIndicators', value)}
          />
        </section>

        <footer className="settings-actions">
          <Button
            variant="secondary"
            onClick={() => settingsQuery.data && setDraft(settingsQuery.data)}
            disabled={updateMutation.isPending}
          >
            Reset changes
          </Button>
          <Button onClick={() => void save()} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </footer>
      </div>
    </main>
  )
}
