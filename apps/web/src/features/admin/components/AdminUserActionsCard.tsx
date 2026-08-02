import { Icon } from '@/components/ui/Icon'
import type {
  AccountStatus,
  AdminUserActionState,
} from '@/features/admin/types/admin.types'

interface AdminUserActionsCardProps {
  status: AccountStatus
  onSelectAction: (action: AdminUserActionState) => void
}

function action(
  value: AdminUserActionState['action'],
  title: string,
  description: string,
  confirmLabel: string,
  destructive: boolean,
): AdminUserActionState {
  return { action: value, title, description, confirmLabel, destructive }
}

export function AdminUserActionsCard({
  status,
  onSelectAction,
}: AdminUserActionsCardProps) {
  const suspensionAction =
    status === 'SUSPENDED'
      ? action(
          'unsuspend',
          'Restore this account?',
          'The user will be able to sign in and use PulseLink again.',
          'Unsuspend account',
          false,
        )
      : action(
          'suspend',
          'Suspend this account?',
          'All sessions will be revoked and sign-in will be blocked until expiry.',
          'Suspend account',
          true,
        )

  const banAction =
    status === 'BANNED'
      ? action(
          'unban',
          'Unban this account?',
          'The account will return to active status.',
          'Unban account',
          false,
        )
      : action(
          'ban',
          'Ban this account?',
          'The ban is indefinite and every active session will be revoked.',
          'Ban account',
          true,
        )

  const logoutAction = action(
    'force-logout',
    'Force logout all sessions?',
    'Refresh tokens and currently issued access tokens will be invalidated.',
    'Force logout',
    true,
  )

  return (
    <section className="admin-card admin-user-actions-card">
      <header>
        <div>
          <span>Privileged operations</span>
          <h2>Account actions</h2>
        </div>
      </header>

      <div className="admin-action-list">
        <button type="button" onClick={() => onSelectAction(suspensionAction)}>
          <Icon name={status === 'SUSPENDED' ? 'check' : 'lock'} />
          <span>
            <b>{suspensionAction.confirmLabel}</b>
            <small>
              {status === 'SUSPENDED'
                ? 'Restore normal access immediately.'
                : 'Temporarily block access until a specified date.'}
            </small>
          </span>
        </button>

        <button
          type="button"
          className={status === 'BANNED' ? undefined : 'danger'}
          onClick={() => onSelectAction(banAction)}
        >
          <Icon name={status === 'BANNED' ? 'check' : 'shield'} />
          <span>
            <b>{banAction.confirmLabel}</b>
            <small>
              {status === 'BANNED'
                ? 'Restore an indefinitely banned account.'
                : 'Indefinitely disable account access.'}
            </small>
          </span>
        </button>

        <button type="button" onClick={() => onSelectAction(logoutAction)}>
          <Icon name="logout" />
          <span>
            <b>Force logout</b>
            <small>Immediately revoke every active session.</small>
          </span>
        </button>
      </div>
    </section>
  )
}
