import type { ReactNode } from 'react'

interface InlineAlertProps {
  title?: string
  children: ReactNode
  tone?: 'info' | 'success' | 'warning' | 'danger'
  /** When provided, renders a dismiss (×) control. Use this to clear stale
   * mutation errors that React Query would otherwise keep around until the
   * same mutation is retried. */
  onDismiss?: () => void
}

export function InlineAlert({ title, children, tone = 'info', onDismiss }: InlineAlertProps) {
  return (
    <div className={`inline-alert inline-alert--${tone}`} role={tone === 'danger' ? 'alert' : 'status'}>
      <div className="inline-alert__body">
        {title ? <strong>{title}</strong> : null}
        <span>{children}</span>
      </div>
      {onDismiss ? (
        <button
          type="button"
          className="inline-alert__dismiss"
          onClick={onDismiss}
          aria-label="Dismiss message"
        >
          ×
        </button>
      ) : null}
    </div>
  )
}
