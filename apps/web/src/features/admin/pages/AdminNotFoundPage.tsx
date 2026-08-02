import { Link } from 'react-router-dom'

import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { routes } from '@/shared/constants/routes'

export function AdminNotFoundPage() {
  return (
    <section className="admin-page">
      <EmptyState
        icon="shield"
        title="Admin page not found"
        description="This administration route does not exist."
        action={<Link to={routes.admin}>Return to dashboard</Link>}
      />
    </section>
  )
}
