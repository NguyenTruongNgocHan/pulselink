export type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  initials: string;
  tone?: string;
  online?: boolean;
  size?: AvatarSize;
}

export function Avatar({
  initials,
  tone = "violet",
  online = false,
  size = "md",
}: AvatarProps) {
  return (
    <span className={`avatar avatar-${tone} avatar-${size}`}>
      {initials}
      {online ? <i aria-label="Online" /> : null}
    </span>
  );
}
