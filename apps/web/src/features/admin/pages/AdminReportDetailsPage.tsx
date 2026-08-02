import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Icon } from '@/components/ui/Icon'
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader'
import { AdminReportDecisionBar } from '@/features/admin/components/AdminReportDecisionBar'
import {
  AdminReportDecisionDialog,
  type ReportDecisionType,
} from '@/features/admin/components/AdminReportDecisionDialog'
import { AdminReportEvidenceCard } from '@/features/admin/components/AdminReportEvidenceCard'
import { AdminReportSummaryCard } from '@/features/admin/components/AdminReportSummaryCard'
import { useAdminReport } from '@/features/admin/hooks/useAdminReports'
import type { ModerationOutcome } from '@/features/admin/types/admin.types'
import { InlineAlert } from '@/shared/components/feedback/InlineAlert'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { getApiErrorMessage } from '@/shared/utils/apiError'

export function AdminReportDetailsPage() {
  const navigate = useNavigate()
  const { reportId = '' } = useParams()
  const {
    reportQuery,
    evidenceQuery,
    claimMutation,
    resolveMutation,
    rejectMutation,
  } = useAdminReport(reportId)
  const [decisionOpen, setDecisionOpen] = useState(false)
  const [decisionType, setDecisionType] = useState<ReportDecisionType>('RESOLVE')
  const [outcome, setOutcome] = useState<ModerationOutcome>('NO_ACTION')
  const [reason, setReason] = useState('')

  if (reportQuery.isLoading) {
    return (
      <section className="admin-page">
        <LoadingState rows={8} label="Loading report" />
      </section>
    )
  }

  if (reportQuery.error || !reportQuery.data) {
    return (
      <section className="admin-page">
        <InlineAlert tone="danger">
          {reportQuery.error ? getApiErrorMessage(reportQuery.error) : 'Report not found.'}
        </InlineAlert>
      </section>
    )
  }

  const report = reportQuery.data
  const mutationError = claimMutation.error ?? resolveMutation.error ?? rejectMutation.error
  const dismissMutationError = () => {
    claimMutation.reset()
    resolveMutation.reset()
    rejectMutation.reset()
  }
  const isDeciding = resolveMutation.isPending || rejectMutation.isPending

  const openDecision = (type: ReportDecisionType) => {
    setDecisionType(type)
    setReason('')
    setDecisionOpen(true)
  }

  const closeDecision = () => {
    if (isDeciding) return
    setDecisionOpen(false)
    setReason('')
  }

  const submitDecision = async () => {
    const normalizedReason = reason.trim()
    if (normalizedReason.length < 3) return

    if (decisionType === 'RESOLVE') {
      await resolveMutation.mutateAsync({ outcome, reason: normalizedReason })
    } else {
      await rejectMutation.mutateAsync(normalizedReason)
    }

    setDecisionOpen(false)
    setReason('')
  }

  return (
    <section className="admin-page">
      <button type="button" className="back-link" onClick={() => navigate('/admin/reports')}>
        <Icon name="arrowLeft" size={17} />
        Report queue
      </button>

      <AdminPageHeader
        eyebrow={`Report ${report.id.slice(0, 8)}`}
        title={report.reason}
        description={`${report.targetType} report submitted by @${report.reporterUsername}`}
        actions={
          <span className={`status-pill status-${report.status.toLowerCase()}`}>
            {report.status.replace('_', ' ')}
          </span>
        }
      />

      {mutationError ? (
        <InlineAlert tone="danger" onDismiss={dismissMutationError}>
          {getApiErrorMessage(mutationError)}
        </InlineAlert>
      ) : null}

      <div className="admin-report-detail-grid">
        <AdminReportSummaryCard report={report} />
        <AdminReportEvidenceCard
          evidence={evidenceQuery.data}
          evidenceAvailable={report.evidenceAvailable}
          isLoading={evidenceQuery.isFetching}
          onLoad={() => void evidenceQuery.refetch()}
        />
      </div>

      <AdminReportDecisionBar
        status={report.status}
        isClaiming={claimMutation.isPending}
        onClaim={() => void claimMutation.mutateAsync()}
        onReject={() => openDecision('REJECT')}
        onResolve={() => openDecision('RESOLVE')}
      />

      <AdminReportDecisionDialog
        isOpen={decisionOpen}
        type={decisionType}
        outcome={outcome}
        reason={reason}
        isSaving={isDeciding}
        onOutcomeChange={setOutcome}
        onReasonChange={setReason}
        onCancel={closeDecision}
        onSubmit={() => void submitDecision()}
      />
    </section>
  )
}
