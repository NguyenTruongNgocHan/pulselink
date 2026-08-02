import type { ReactNode } from 'react'

import { Icon, type IconName } from '@/components/ui/Icon'

interface EmptyStateProps {
  title: string
  description: string
  icon?: IconName
  action?: ReactNode
  compact?: boolean
}

export function EmptyState({
  title,
  description,
  icon = 'chat',
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div className={compact ? 'empty-state empty-state--compact' : 'empty-state'}>
      <span className="empty-state__icon">
        <Icon name={icon} size={compact ? 22 : 30} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action ? <div className="empty-state__action">{action}</div> : null}
    </div>
  )
}
