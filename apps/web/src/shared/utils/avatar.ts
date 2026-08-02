export function getInitials(value?: string | null): string {
  const normalized = value?.trim()
  if (!normalized) return 'PL'

  const parts = normalized.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()

  return `${parts[0]![0] ?? ''}${parts.at(-1)?.[0] ?? ''}`.toUpperCase()
}
