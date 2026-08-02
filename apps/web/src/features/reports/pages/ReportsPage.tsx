import { useEffect, useMemo, useState } from 'react'

import { Icon } from '@/components/ui/Icon'
import { ClarificationDialog } from '@/features/reports/components/ClarificationDialog'
import { ReportDetailPanel } from '@/features/reports/components/ReportDetailPanel'
import { ReportListItem } from '@/features/reports/components/ReportListItem'
import { useReports } from '@/features/reports/hooks/useReports'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { InlineAlert } from '@/shared/components/feedback/InlineAlert'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { getApiErrorMessage } from '@/shared/utils/apiError'

export function ReportsPage() {
  const { reportsQuery, clarificationMutation } = useReports()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [clarificationOpen, setClarificationOpen] = useState(false)
  const [clarification, setClarification] = useState('')

  const reports = reportsQuery.data ?? []
  const selectedReport = useMemo(
    () => reports.find((report) => report.id === selectedId) ?? reports[0] ?? null,
    [reports, selectedId],
  )

  useEffect(() => {
    if (!selectedId && reports[0]) setSelectedId(reports[0].id)
  }, [reports, selectedId])

  const closeClarification = () => {
    if (clarificationMutation.isPending) return
    setClarificationOpen(false)
    setClarification('')
  }

  const submitClarification = async () => {
    if (!selectedReport || clarification.trim().length < 3) return
    await clarificationMutation.mutateAsync({
      reportId: selectedReport.id,
      body: clarification.trim(),
    })
    closeClarification()
  }

  const error = reportsQuery.error ?? clarificationMutation.error
  const dismissError = () => clarificationMutation.reset()

  return (
    <main className="workspace two reports-workspace">
      <aside className="list-panel report-list-panel">
        <header className="panel-heading">
          <div>
            <span className="eyebrow">Safety center</span>
            <h1>My reports</h1>
            <small>{reports.length} submitted</small>
          </div>
          <Icon name="shield" />
        </header>

        <div className="report-guidance">
          <Icon name="info" size={18} />
          <p>
            Staff identities and internal notes are never shown. You will only see public status
            and resolution details.
          </p>
        </div>

        {error ? (
          <InlineAlert tone="danger" onDismiss={dismissError}>
            {getApiErrorMessage(error)}
          </InlineAlert>
        ) : null}
        {reportsQuery.isLoading ? <LoadingState rows={6} label="Loading reports" /> : null}
        {!reportsQuery.isLoading && reports.length === 0 ? (
          <EmptyState
            compact
            icon="flag"
            title="No reports submitted"
            description="Reports you submit from user, message, or group menus will appear here."
          />
        ) : null}

        <div className="report-list">
          {reports.map((report) => (
            <ReportListItem
              key={report.id}
              report={report}
              selected={report.id === selectedReport?.id}
              onSelect={() => setSelectedId(report.id)}
            />
          ))}
        </div>
      </aside>

      <ReportDetailPanel
        report={selectedReport}
        onAddClarification={() => setClarificationOpen(true)}
      />

      <ClarificationDialog
        isOpen={clarificationOpen}
        value={clarification}
        isSubmitting={clarificationMutation.isPending}
        onChange={setClarification}
        onCancel={closeClarification}
        onSubmit={() => void submitClarification()}
      />
    </main>
  )
}
