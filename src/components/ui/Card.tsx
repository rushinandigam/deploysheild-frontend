import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

type CardProps = {
  children: ReactNode;
  className?: string;
  /** Extra inner highlight on top edge */
  glow?: boolean;
};

export function Card({ children, className, glow }: CardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/50 shadow-2xl shadow-black/40 backdrop-blur-xl",
        glow && "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-violet-400/40 before:to-transparent",
        className,
      )}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("border-b border-white/[0.06] px-6 py-5", className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn("font-display text-lg font-semibold tracking-tight text-white", className)}>{children}</h2>
  );
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("mt-1.5 text-sm leading-relaxed text-zinc-400", className)}>{children}</p>;
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}
