import { useEffect, useMemo, useState } from 'react'

import { Icon } from '@/components/ui/Icon'
import { ClarificationDialog } from '@/features/reports/components/ClarificationDialog'
import { ReportDetailPanel } from '@/features/reports/components/ReportDetailPanel'
import { ReportListItem } from '@/features/reports/components/ReportListItem'
import { useReports } from '@/features/reports/hooks/useReports'
import { InlineAlert } from '@/shared/components/feedback/InlineAlert'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { getApiErrorMessage } from '@/shared/utils/apiError'

import './reports.css'

export function ReportsPage() {
  const { reportsQuery, clarificationMutation } = useReports()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [clarificationOpen, setClarificationOpen] = useState(false)
  const [clarification, setClarification] = useState('')

  const reports = reportsQuery.data ?? []

  const selectedReport = useMemo(
    () =>
      reports.find((report) => report.id === selectedId) ??
      reports[0] ??
      null,
    [reports, selectedId],
  )

  useEffect(() => {
    if (!selectedId && reports[0]) {
      setSelectedId(reports[0].id)
    }

    if (
      selectedId &&
      !reports.some((report) => report.id === selectedId)
    ) {
      setSelectedId(reports[0]?.id ?? null)
    }
  }, [reports, selectedId])

  const closeClarification = () => {
    if (clarificationMutation.isPending) return

    setClarificationOpen(false)
    setClarification('')
  }

  const submitClarification = async () => {
    if (!selectedReport || clarification.trim().length < 3) {
      return
    }

    await clarificationMutation.mutateAsync({
      reportId: selectedReport.id,
      body: clarification.trim(),
    })

    closeClarification()
  }

  const error = reportsQuery.error ?? clarificationMutation.error

  const dismissError = () => {
    clarificationMutation.reset()
  }

  return (
    <main className="workspace reports-v2">
      <aside className="reports-v2__panel">
        <header className="reports-v2__header">
          <div>
            <span className="eyebrow">Safety center</span>
            <h1>My reports</h1>
            <small>
              {reports.length}{' '}
              {reports.length === 1 ? 'submitted report' : 'submitted reports'}
            </small>
          </div>

          <span className="reports-v2__header-icon" aria-hidden="true">
            <Icon name="shield" size={20} />
          </span>
        </header>

        <div className="reports-v2__guidance">
          <span>
            <Icon name="info" size={17} />
          </span>

          <p>
            Staff identities and internal notes stay private. Only public
            status and resolution details are shown here.
          </p>
        </div>

        {error ? (
          <div className="reports-v2__alert">
            <InlineAlert tone="danger" onDismiss={dismissError}>
              {getApiErrorMessage(error)}
            </InlineAlert>
          </div>
        ) : null}

        <div className="reports-v2__summary">
          <span>
            {reportsQuery.isLoading
              ? 'Loading reports'
              : `${reports.length} ${
                  reports.length === 1 ? 'report' : 'reports'
                }`}
          </span>
        </div>

        <div className="reports-v2__content" aria-live="polite">
          {reportsQuery.isLoading ? (
            <LoadingState rows={6} label="Loading reports" />
          ) : null}

          {!reportsQuery.isLoading && reports.length === 0 ? (
            <div className="reports-v2__empty">
              <span className="reports-v2__empty-icon">
                <Icon name="flag" size={23} />
              </span>

              <strong>No reports submitted</strong>

              <p>
                Reports submitted from user, message or group menus will
                appear here.
              </p>
            </div>
          ) : null}

          {!reportsQuery.isLoading && reports.length > 0 ? (
            <div className="reports-v2__list">
              {reports.map((report) => (
                <ReportListItem
                  key={report.id}
                  report={report}
                  selected={report.id === selectedReport?.id}
                  onSelect={() => setSelectedId(report.id)}
                />
              ))}
            </div>
          ) : null}
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
