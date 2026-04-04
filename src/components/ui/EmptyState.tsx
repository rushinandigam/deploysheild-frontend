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
        "flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-zinc-950/30 px-8 py-12 text-center",
        className,
      )}>
      {icon && <div className="mb-4 text-violet-400/80">{icon}</div>}
      <p className="font-display text-base font-medium text-zinc-200">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">{description}</p>
    </div>
  );
}
