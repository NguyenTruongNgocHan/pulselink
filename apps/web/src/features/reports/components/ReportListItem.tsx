import { Icon } from '@/components/ui/Icon'
import type { UserReport } from '@/features/reports/types/report.types'
import { formatRelativeTime } from '@/shared/utils/date'

interface ReportListItemProps {
  report: UserReport
  selected: boolean
  onSelect: () => void
}

export function ReportListItem({
  report,
  selected,
  onSelect,
}: ReportListItemProps) {
  const statusLabel = report.status.replaceAll('_', ' ')

  return (
    <button
      type="button"
      className={[
        'reports-v2-item',
        selected ? 'selected' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className="reports-v2-item__icon" aria-hidden="true">
        <Icon name="flag" size={18} />
      </span>

      <span className="reports-v2-item__body">
        <span className="reports-v2-item__top">
          <strong>{report.targetLabel}</strong>

          <time dateTime={report.updatedAt}>
            {formatRelativeTime(report.updatedAt)}
          </time>
        </span>

        <small>{report.reason}</small>

        <span
          className={`reports-v2-status reports-v2-status--${report.status.toLowerCase()}`}
        >
          {statusLabel}
        </span>
      </span>

      <span className="reports-v2-item__arrow" aria-hidden="true">
        <Icon name="chevron" size={15} />
      </span>
    </button>
  )
}
