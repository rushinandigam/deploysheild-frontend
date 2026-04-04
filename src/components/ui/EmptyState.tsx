import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

type Props = {
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
};

export default function EmptyState({ title, description, icon, className }: Props) {
  return (
    <div
      className={cn(
        "relative flex min-h-[240px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-violet-500/20 bg-zinc-950/40 px-8 py-12 text-center shadow-inner shadow-violet-950/10 ring-1 ring-inset ring-white/[0.04] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(139,92,246,0.08),transparent)]",
        className,
      )}>
      {icon && <div className="mb-4 text-violet-400/80">{icon}</div>}
      <p className="font-display text-base font-medium text-zinc-200">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">{description}</p>
    </div>
  );
}
