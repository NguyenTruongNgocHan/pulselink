export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  initials: string
  src?: string | null | undefined
  alt?: string | undefined
  tone?: string | undefined
  online?: boolean | undefined
  size?: AvatarSize | undefined
}

export function Avatar({
  initials,
  src,
  alt = '',
  tone = 'violet',
  online = false,
  size = 'md',
}: AvatarProps) {
  return (
    <span className={`avatar avatar-${tone} avatar-${size}`}>
      {src ? <img src={src} alt={alt} loading="lazy" /> : initials}
      {online ? <i aria-label="Online" /> : null}
    </span>
  )
}
