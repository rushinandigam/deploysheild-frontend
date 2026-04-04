import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "success" | "warning" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "border border-violet-500/30 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-950/40 hover:brightness-110 active:brightness-95",
  secondary:
    "border border-white/10 bg-white/[0.04] text-zinc-100 hover:bg-white/[0.08] active:bg-white/[0.06]",
  ghost: "border border-transparent text-zinc-300 hover:bg-white/[0.06] hover:text-white",
  success: "border border-emerald-500/30 bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700",
  warning: "border border-amber-500/30 bg-amber-600 text-white hover:bg-amber-500 active:bg-amber-700",
  danger: "border border-rose-500/30 bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

export default function Button({
  variant = "secondary",
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
        variants[variant],
        className,
      )}
      {...rest}>
      {children}
    </button>
  );
}
