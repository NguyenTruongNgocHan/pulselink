import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PasswordChangeDialog } from '@/features/profile/components/PasswordChangeDialog'
import { SecuritySessionsCard } from '@/features/profile/components/SecuritySessionsCard'
import { useSecuritySessions } from '@/features/profile/hooks/useSecuritySessions'
import { InlineAlert } from '@/shared/components/feedback/InlineAlert'
import { ConfirmDialog } from '@/shared/components/overlay/ConfirmDialog'
import { routes } from '@/shared/constants/routes'
import { getApiErrorMessage } from '@/shared/utils/apiError'

import './profile.css'

export function SecurityPage() {
  const navigate = useNavigate()

  const {
    sessionsQuery,
    revokeMutation,
    revokeOthersMutation,
    passwordMutation,
    deactivateMutation,
  } = useSecuritySessions()

  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [deactivateReason, setDeactivateReason] = useState('')
  const [activeSessionId, setActiveSessionId] =
    useState<string | null>(null)

  const closePasswordDialog = () => {
    if (passwordMutation.isPending) return

    setCurrentPassword('')
    setNewPassword('')
    setPasswordModalOpen(false)
  }

  const changePassword = async () => {
    await passwordMutation.mutateAsync({
      currentPassword,
      newPassword,
    })

    closePasswordDialog()
  }

  const revokeSession = async (sessionId: string) => {
    setActiveSessionId(sessionId)

    try {
      await revokeMutation.mutateAsync(sessionId)
    } finally {
      setActiveSessionId(null)
    }
  }

  const error =
    sessionsQuery.error ??
    revokeMutation.error ??
    revokeOthersMutation.error ??
    passwordMutation.error ??
    deactivateMutation.error

  const dismissError = () => {
    revokeMutation.reset()
    revokeOthersMutation.reset()
    passwordMutation.reset()
    deactivateMutation.reset()
  }

  return (
    <main className="security-page-v2">
      <div className="security-page-v2__shell">
        <header className="security-page-v2__topbar">
          <button
            type="button"
            onClick={() => navigate(routes.profile)}
          >
            <Icon name="arrowLeft" size={17} />
            Back to profile
          </button>

          <span>Security &amp; devices</span>
        </header>

        <header className="security-page-v2__header">
          <div>
            <span className="eyebrow">Protect your account</span>
            <h1>Security &amp; devices</h1>
            <p>
              Manage your password and every active PulseLink session.
            </p>
          </div>

          <span className="security-page-v2__header-icon">
            <Icon name="lock" size={24} />
          </span>
        </header>

        {error ? (
          <div className="security-page-v2__alert">
            <InlineAlert tone="danger" onDismiss={dismissError}>
              {getApiErrorMessage(error)}
            </InlineAlert>
          </div>
        ) : null}

        <section className="security-card-v2">
          <header className="security-card-v2__header">
            <div>
              <h2>Password</h2>
              <p>Use a unique password with at least eight characters.</p>
            </div>
          </header>

          <div className="security-row-v2">
            <span>
              <strong>Change password</strong>
              <small>
                Changing your password signs out every other session.
              </small>
            </span>

            <Button
              variant="secondary"
              onClick={() => setPasswordModalOpen(true)}
            >
              Update password
            </Button>
          </div>
        </section>

        <SecuritySessionsCard
          sessions={sessionsQuery.data ?? []}
          isLoading={sessionsQuery.isLoading}
          isRevokingOthers={revokeOthersMutation.isPending}
          activeSessionId={activeSessionId}
          onRevokeOthers={() =>
            void revokeOthersMutation.mutateAsync()
          }
          onRevokeSession={(sessionId) =>
            void revokeSession(sessionId)
          }
        />

        <section className="security-card-v2 security-card-v2--danger">
          <header className="security-card-v2__header">
            <div>
              <h2>Account</h2>
              <p>
                Deactivation is reversible only through account support.
              </p>
            </div>
          </header>

          <div className="security-row-v2 security-row-v2--danger">
            <span>
              <strong>Deactivate account</strong>
              <small>
                Disable your profile and immediately sign out all
                sessions.
              </small>
            </span>

            <Button
              variant="danger"
              onClick={() => setDeactivateOpen(true)}
            >
              Deactivate
            </Button>
          </div>
        </section>
      </div>

      <PasswordChangeDialog
        isOpen={passwordModalOpen}
        currentPassword={currentPassword}
        newPassword={newPassword}
        isSubmitting={passwordMutation.isPending}
        onCurrentPasswordChange={setCurrentPassword}
        onNewPasswordChange={setNewPassword}
        onCancel={closePasswordDialog}
        onSubmit={() => void changePassword()}
      />

      <ConfirmDialog
        isOpen={deactivateOpen}
        title="Deactivate your account?"
        description="Your profile will no longer be available and all sessions will be revoked."
        confirmLabel="Deactivate account"
        reasonLabel="Why are you leaving?"
        reason={deactivateReason}
        destructive
        isSubmitting={deactivateMutation.isPending}
        onReasonChange={setDeactivateReason}
        onCancel={() => setDeactivateOpen(false)}
        onConfirm={() =>
          void deactivateMutation.mutateAsync(deactivateReason)
        }
      />
    </main>
  )
}
