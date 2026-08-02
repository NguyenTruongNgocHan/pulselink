import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PrivacyToggle } from '@/features/privacy/components/PrivacyToggle'
import { usePrivacySettings } from '@/features/privacy/hooks/usePrivacySettings'
import type { PrivacySettings } from '@/features/privacy/types/privacy.types'
import { InlineAlert } from '@/shared/components/feedback/InlineAlert'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { getApiErrorMessage } from '@/shared/utils/apiError'

import './privacy.css'

export function PrivacyPage() {
  const { settingsQuery, updateMutation } = usePrivacySettings()

  const [draft, setDraft] = useState<PrivacySettings | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settingsQuery.data) {
      setDraft(settingsQuery.data)
    }
  }, [settingsQuery.data])

  const hasChanges = useMemo(() => {
    if (!draft || !settingsQuery.data) {
      return false
    }

    return JSON.stringify(draft) !== JSON.stringify(settingsQuery.data)
  }, [draft, settingsQuery.data])

  if (settingsQuery.isLoading || !draft) {
    return (
      <main className="privacy-page-v2 privacy-page-v2--loading">
        <div className="privacy-page-v2__loading">
          <LoadingState rows={8} label="Loading privacy settings" />
        </div>
      </main>
    )
  }

  const updateField = <K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K],
  ) => {
    setDraft((current) =>
      current ? { ...current, [key]: value } : current,
    )

    setSaved(false)
  }

  const resetChanges = () => {
    if (!settingsQuery.data) {
      return
    }

    setDraft(settingsQuery.data)
    setSaved(false)
    updateMutation.reset()
  }

  const save = async () => {
    await updateMutation.mutateAsync(draft)

    setSaved(true)

    window.setTimeout(() => {
      setSaved(false)
    }, 2_500)
  }

  const error = settingsQuery.error ?? updateMutation.error

  const dismissError = () => {
    updateMutation.reset()
  }

  return (
    <main className="privacy-page-v2">
      <div className="privacy-page-v2__shell">
        <header className="privacy-page-v2__header">
          <div className="privacy-page-v2__heading">
            <span className="eyebrow">Your boundaries</span>
            <h1>Privacy</h1>
            <p>
              Control how people can find you and what realtime signals
              you share.
            </p>
          </div>

          <span
            className="privacy-page-v2__header-icon"
            aria-hidden="true"
          >
            <Icon name="shield" size={24} />
          </span>
        </header>

        {error ? (
          <div className="privacy-page-v2__alert">
            <InlineAlert tone="danger" onDismiss={dismissError}>
              {getApiErrorMessage(error)}
            </InlineAlert>
          </div>
        ) : null}

        {saved ? (
          <div className="privacy-page-v2__alert">
            <InlineAlert tone="success">
              Privacy settings saved.
            </InlineAlert>
          </div>
        ) : null}

        <div className="privacy-page-v2__content">
          <section className="privacy-card-v2">
            <header className="privacy-card-v2__header">
              <span className="privacy-card-v2__header-icon">
                <Icon name="users" size={18} />
              </span>

              <div>
                <h2>Discoverability</h2>
                <p>Choose who can discover and contact you.</p>
              </div>
            </header>

            <div className="privacy-card-v2__rows">
              <PrivacyToggle
                icon="search"
                title="Appear in people search"
                description="Allow other PulseLink members to find your profile."
                checked={draft.discoverable}
                disabled={updateMutation.isPending}
                onChange={(value) =>
                  updateField('discoverable', value)
                }
              />

              <PrivacyToggle
                icon="users"
                title="Allow friend requests"
                description="People can invite you to join their trusted circle."
                checked={draft.allowFriendRequests}
                disabled={updateMutation.isPending}
                onChange={(value) =>
                  updateField('allowFriendRequests', value)
                }
              />

              <PrivacyToggle
                icon="chat"
                title="Allow direct messages"
                description="Friends can start a direct conversation with you."
                checked={draft.allowDirectMessages}
                disabled={updateMutation.isPending}
                onChange={(value) =>
                  updateField('allowDirectMessages', value)
                }
              />

              <label className="privacy-select-v2">
                <span className="privacy-select-v2__icon">
                  <Icon name="user" size={18} />
                </span>

                <span className="privacy-select-v2__copy">
                  <strong>Profile visibility</strong>
                  <small>
                    Control who can see your complete profile.
                  </small>
                </span>

                <span className="privacy-select-v2__control">
                  <select
                    value={draft.profileVisibility}
                    disabled={updateMutation.isPending}
                    onChange={(event) =>
                      updateField(
                        'profileVisibility',
                        event.target
                          .value as PrivacySettings['profileVisibility'],
                      )
                    }
                  >
                    <option value="EVERYONE">Everyone</option>
                    <option value="FRIENDS">Friends only</option>
                    <option value="NOBODY">Only me</option>
                  </select>

                  <Icon name="chevron" size={15} />
                </span>
              </label>
            </div>
          </section>

          <section className="privacy-card-v2">
            <header className="privacy-card-v2__header">
              <span className="privacy-card-v2__header-icon">
                <Icon name="shield" size={18} />
              </span>

              <div>
                <h2>Presence and message signals</h2>
                <p>
                  Decide what other participants can see while you chat.
                </p>
              </div>
            </header>

            <div className="privacy-card-v2__rows">
              <PrivacyToggle
                icon="shield"
                title="Show online status"
                description="Friends can see when you are connected to PulseLink."
                checked={draft.showOnlineStatus}
                disabled={updateMutation.isPending}
                onChange={(value) =>
                  updateField('showOnlineStatus', value)
                }
              />

              <PrivacyToggle
                icon="bell"
                title="Show last active time"
                description="Friends can see when you were last active."
                checked={draft.showLastActive}
                disabled={updateMutation.isPending}
                onChange={(value) =>
                  updateField('showLastActive', value)
                }
              />

              <PrivacyToggle
                icon="check"
                title="Send read receipts"
                description="Participants can see when you have read their messages."
                checked={draft.sendReadReceipts}
                disabled={updateMutation.isPending}
                onChange={(value) =>
                  updateField('sendReadReceipts', value)
                }
              />

              <PrivacyToggle
                icon="edit"
                title="Show typing indicators"
                description="Participants can see when you are composing a message."
                checked={draft.showTypingIndicators}
                disabled={updateMutation.isPending}
                onChange={(value) =>
                  updateField('showTypingIndicators', value)
                }
              />
            </div>
          </section>
        </div>

        <footer className="privacy-page-v2__footer">
          <div className="privacy-page-v2__footer-copy">
            <span
              className={[
                'privacy-page-v2__status-dot',
                hasChanges ? 'changed' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            />

            <span>
              {hasChanges
                ? 'You have unsaved privacy changes.'
                : 'Your privacy settings are up to date.'}
            </span>
          </div>

          <div className="privacy-page-v2__actions">
            <Button
              variant="secondary"
              onClick={resetChanges}
              disabled={updateMutation.isPending || !hasChanges}
            >
              Reset changes
            </Button>

            <Button
              onClick={() => void save()}
              disabled={updateMutation.isPending || !hasChanges}
            >
              {updateMutation.isPending
                ? 'Saving…'
                : 'Save changes'}
            </Button>
          </div>
        </footer>
      </div>
    </main>
  )
}