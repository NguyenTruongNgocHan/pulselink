import { Icon, type IconName } from '@/components/ui/Icon'

interface PrivacyToggleProps {
  icon: IconName
  title: string
  description: string
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}

export function PrivacyToggle({
  icon,
  title,
  description,
  checked,
  disabled = false,
  onChange,
}: PrivacyToggleProps) {
  return (
    <label
      className={[
        'privacy-toggle-v2',
        checked ? 'enabled' : '',
        disabled ? 'disabled' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="privacy-toggle-v2__icon" aria-hidden="true">
        <Icon name={icon} size={18} />
      </span>

      <span className="privacy-toggle-v2__copy">
        <strong>{title}</strong>
        <small>{description}</small>
      </span>

      <span className="privacy-toggle-v2__control">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          aria-label={title}
        />

        <span className="privacy-toggle-v2__switch" aria-hidden="true">
          <i />
        </span>
      </span>
    </label>
  )
}