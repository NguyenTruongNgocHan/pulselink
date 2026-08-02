import { Button } from '@/components/ui/Button'
import { Modal } from '@/shared/components/overlay/Modal'

interface ClarificationDialogProps {
  isOpen: boolean
  value: string
  isSubmitting: boolean
  onChange: (value: string) => void
  onCancel: () => void
  onSubmit: () => void
}

export function ClarificationDialog({
  isOpen,
  value,
  isSubmitting,
  onChange,
  onCancel,
  onSubmit,
}: ClarificationDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      title="Add clarification"
      description="Clarifications are permanent after submission and visible to the review team."
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <Button
            variant="secondary"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancel
          </Button>

          <Button
            disabled={value.trim().length < 3 || isSubmitting}
            onClick={onSubmit}
          >
            {isSubmitting ? 'Submitting…' : 'Submit clarification'}
          </Button>
        </>
      }
    >
      <label className="reports-v2-dialog-field">
        <span>Additional context</span>

        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={6}
          maxLength={1_000}
          placeholder="Add information that may help the review team."
          autoFocus
        />

        <small>{value.length}/1000</small>
      </label>
    </Modal>
  )
}
