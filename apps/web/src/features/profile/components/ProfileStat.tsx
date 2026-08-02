interface ProfileStatProps {
  value: number
  label: string
}

export function ProfileStat({ value, label }: ProfileStatProps) {
  return (
    <div className="profile-stat-v2">
      <strong>{new Intl.NumberFormat().format(value)}</strong>
      <span>{label}</span>
    </div>
  )
}
