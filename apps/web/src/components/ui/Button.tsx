import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...buttonProps
}: ButtonProps) {
  const classes = ["button", variant, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={classes}
      type={type}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
