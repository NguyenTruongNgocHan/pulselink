interface PrivacyToggleProps {
  title: string
  description: string
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}

export function PrivacyToggle({
  title,
  description,
  checked,
  disabled = false,
  onChange,
}: PrivacyToggleProps) {
  return (
    <label className="privacy-toggle">
      <span>
        <b>{title}</b>
        <small>{description}</small>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <i aria-hidden="true" />
    </label>
  )
}
