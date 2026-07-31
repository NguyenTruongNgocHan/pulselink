import type { HTMLAttributes } from 'react'
import { Link } from 'react-router-dom'

interface BrandProps extends HTMLAttributes<HTMLAnchorElement> {
  compact?: boolean
}

export function Brand({
  compact = false,
  className = '',
  ...brandProps
}: BrandProps) {
  const classes = [
    'brand',
    compact ? 'brand-compact' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Link
      to="/"
      className={classes}
      aria-label="pulselink home"
      {...brandProps}
    >
      <span className="mini-logo">
        <img
          src="/pulselink_logo_1.png"
          alt=""
          draggable={false}
        />
      </span>

      {!compact && (
        <span className="brand-name">
          pulselink
        </span>
      )}
    </Link>
  )
}