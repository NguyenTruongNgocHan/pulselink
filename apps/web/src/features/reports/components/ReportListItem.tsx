import { Icon } from '@/components/ui/Icon'
import type { UserReport } from '@/features/reports/types/report.types'
import { formatRelativeTime } from '@/shared/utils/date'

interface ReportListItemProps {
  report: UserReport
  selected: boolean
  onSelect: () => void
}

export function ReportListItem({ report, selected, onSelect }: ReportListItemProps) {
  return (
    <button
      type="button"
      className={selected ? 'report-row selected' : 'report-row'}
      onClick={onSelect}
    >
      <span className="report-row__icon">
        <Icon name="flag" size={18} />
      </span>
      <span>
        <b>{report.targetLabel}</b>
        <small>{report.reason}</small>
      </span>
      <span className="report-row__meta">
        <i className={`status-pill status-${report.status.toLowerCase()}`}>
          {report.status.replace('_', ' ')}
        </i>
        <time>{formatRelativeTime(report.updatedAt)}</time>
      </span>
    </button>
  )
}
