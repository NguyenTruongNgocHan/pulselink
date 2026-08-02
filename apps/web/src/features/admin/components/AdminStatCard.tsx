import { Icon, type IconName } from '@/components/ui/Icon'

interface AdminStatCardProps {
  label: string
  value: number
  description: string
  icon: IconName
  tone?: 'default' | 'success' | 'warning' | 'danger'
}

export function AdminStatCard({
  label,
  value,
  description,
  icon,
  tone = 'default',
}: AdminStatCardProps) {
  return (
    <article className={`admin-stat-card admin-stat-card--${tone}`}>
      <span>
        <Icon name={icon} />
      </span>
      <div>
        <small>{label}</small>
        <strong>{new Intl.NumberFormat().format(value)}</strong>
        <p>{description}</p>
      </div>
    </article>
  )
}
