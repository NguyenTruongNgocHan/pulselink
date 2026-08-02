import { Button } from '@/components/ui/Button'
import type { ModerationOutcome } from '@/features/admin/types/admin.types'
import { Modal } from '@/shared/components/overlay/Modal'

export type ReportDecisionType = 'RESOLVE' | 'REJECT'

const moderationOutcomes: ModerationOutcome[] = [
  'NO_ACTION',
  'WARNING_ISSUED',
  'CONTENT_REMOVED',
  'USER_SUSPENDED',
  'USER_BANNED',
  'GROUP_CLOSED',
]

interface AdminReportDecisionDialogProps {
  isOpen: boolean
  type: ReportDecisionType
  outcome: ModerationOutcome
  reason: string
  isSaving: boolean
  onOutcomeChange: (outcome: ModerationOutcome) => void
  onReasonChange: (reason: string) => void
  onCancel: () => void
  onSubmit: () => void
}

export function AdminReportDecisionDialog({
  isOpen,
  type,
  outcome,
  reason,
  isSaving,
  onOutcomeChange,
  onReasonChange,
  onCancel,
  onSubmit,
}: AdminReportDecisionDialogProps) {
  const isResolve = type === 'RESOLVE'

  return (
    <Modal
      isOpen={isOpen}
      title={isResolve ? 'Resolve report' : 'Reject report'}
      description="The decision is final for this workflow and will be audited."
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant={isResolve ? 'primary' : 'danger'}
            disabled={reason.trim().length < 3 || isSaving}
            onClick={onSubmit}
          >
            {isSaving
              ? 'Saving decision…'
              : isResolve
                ? 'Resolve report'
                : 'Reject report'}
          </Button>
        </>
      }
    >
      <div className="form-stack">
        {isResolve ? (
          <label className="form-field">
            <span>Moderation outcome</span>
            <select
              value={outcome}
              onChange={(event) => onOutcomeChange(event.target.value as ModerationOutcome)}
            >
              {moderationOutcomes.map((item) => (
                <option value={item} key={item}>
                  {item.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="form-field">
          <span>Mandatory reason</span>
          <textarea
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            rows={5}
            maxLength={1_000}
            autoFocus
          />
          <small>{reason.length}/1000</small>
        </label>
      </div>
    </Modal>
  )
}
