import { Icon } from '@/components/ui/Icon'
import type { AuditLogEntry } from '@/features/admin/types/admin.types'
import { formatDateTime } from '@/shared/utils/date'

interface AdminModerationHistoryProps {
  entries: AuditLogEntry[]
}

export function AdminModerationHistory({ entries }: AdminModerationHistoryProps) {
  return (
    <section className="admin-card admin-history-card">
      <header>
        <div>
          <span>Account history</span>
          <h2>Moderation actions</h2>
        </div>
      </header>
      <div className="admin-history-list">
        {entries.map((entry) => (
          <article key={entry.id}>
            <span>
              <Icon name="shield" size={17} />
            </span>
            <div>
              <b>{entry.action.replaceAll('_', ' ')}</b>
              <p>{entry.reason || 'No reason recorded.'}</p>
            </div>
            <time>{formatDateTime(entry.createdAt)}</time>
          </article>
        ))}
        {entries.length === 0 ? (
          <p className="muted-copy">No moderation actions have been recorded.</p>
        ) : null}
      </div>
    </section>
  )
}
