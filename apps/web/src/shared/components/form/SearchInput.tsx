import type { ChangeEventHandler, InputHTMLAttributes } from 'react'

import { Icon } from '@/components/ui/Icon'

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string
  onChange: ChangeEventHandler<HTMLInputElement>
  onClear?: () => void
}

export function SearchInput({ label, value, onChange, onClear, ...inputProps }: SearchInputProps) {
  const hasValue = typeof value === 'string' && value.length > 0

  return (
    <label className="searchbox">
      <span className="sr-only">{label}</span>
      <Icon name="search" size={18} />
      <input value={value} onChange={onChange} {...inputProps} />
      {hasValue && onClear ? (
        <button type="button" className="searchbox__clear" onClick={onClear} aria-label="Clear search">
          <Icon name="x" size={15} />
        </button>
      ) : null}
    </label>
  )
}
