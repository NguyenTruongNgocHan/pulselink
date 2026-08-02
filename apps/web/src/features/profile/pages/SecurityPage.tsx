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
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

  const closePasswordDialog = () => {
    if (passwordMutation.isPending) return
    setCurrentPassword('')
    setNewPassword('')
    setPasswordModalOpen(false)
  }

  const changePassword = async () => {
    await passwordMutation.mutateAsync({ currentPassword, newPassword })
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
    <main className="settings-page security-page">
      <header className="settings-topbar">
        <button type="button" className="back-link" onClick={() => navigate(routes.profile)}>
          <Icon name="arrowLeft" size={17} />
          Back to profile
        </button>
        <b>Security &amp; Devices</b>
      </header>

      <div className="settings-content">
        <header className="settings-header">
          <div>
            <span className="eyebrow">Protect your account</span>
            <h1>Security &amp; devices</h1>
            <p>Manage your password and every active PulseLink session.</p>
          </div>
          <span className="settings-header__icon">
            <Icon name="lock" size={25} />
          </span>
        </header>

        {error ? (
          <InlineAlert tone="danger" onDismiss={dismissError}>
            {getApiErrorMessage(error)}
          </InlineAlert>
        ) : null}

        <section className="settings-card">
          <header>
            <h2>Password</h2>
            <p>Use a unique password with at least eight characters.</p>
          </header>
          <div className="setting-row">
            <span>
              <b>Change password</b>
              <small>Changing your password signs out every other session.</small>
            </span>
            <Button variant="secondary" onClick={() => setPasswordModalOpen(true)}>
              Update password
            </Button>
          </div>
        </section>

        <SecuritySessionsCard
          sessions={sessionsQuery.data ?? []}
          isLoading={sessionsQuery.isLoading}
          isRevokingOthers={revokeOthersMutation.isPending}
          activeSessionId={activeSessionId}
          onRevokeOthers={() => void revokeOthersMutation.mutateAsync()}
          onRevokeSession={(sessionId) => void revokeSession(sessionId)}
        />

        <section className="settings-card settings-card--danger">
          <header>
            <h2>Account</h2>
            <p>Deactivation is reversible only through account support.</p>
          </header>
          <div className="setting-row danger-text">
            <span>
              <b>Deactivate account</b>
              <small>Disable your profile and immediately sign out all sessions.</small>
            </span>
            <Button variant="danger" onClick={() => setDeactivateOpen(true)}>
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
        onConfirm={() => void deactivateMutation.mutateAsync(deactivateReason)}
      />
    </main>
  )
}
