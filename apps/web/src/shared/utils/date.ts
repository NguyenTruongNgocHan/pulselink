const relativeFormatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

export function formatRelativeTime(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  const seconds = Math.round((date.getTime() - Date.now()) / 1000)
  const absoluteSeconds = Math.abs(seconds)

  if (absoluteSeconds < 60) return relativeFormatter.format(seconds, 'second')

  const minutes = Math.round(seconds / 60)
  if (Math.abs(minutes) < 60) return relativeFormatter.format(minutes, 'minute')

  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return relativeFormatter.format(hours, 'hour')

  const days = Math.round(hours / 24)
  if (Math.abs(days) < 7) return relativeFormatter.format(days, 'day')

  return new Intl.DateTimeFormat(undefined, {
    year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function formatDateTime(value: string | Date): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value instanceof Date ? value : new Date(value))
}

export function formatMessageTime(value: string | Date): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(value instanceof Date ? value : new Date(value))
}
