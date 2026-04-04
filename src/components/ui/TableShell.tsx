import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Framed data table with gradient header strip and hover rows. */
export default function TableShell({ children, className }: Props) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-b from-zinc-900/50 to-zinc-950/90 shadow-2xl shadow-violet-950/15 ring-1 ring-inset ring-white/[0.05]",
        className,
      )}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export const tableHeadRowClass =
  "border-b border-violet-500/25 bg-gradient-to-r from-violet-950/55 via-zinc-900/95 to-zinc-950/90";

export const thClass =
  "px-4 py-4 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-violet-100/75 first:pl-5 last:pr-5";

export const tdClass = "px-4 py-3.5 align-middle text-sm first:pl-5 last:pr-5";

export const trBodyClass =
  "border-b border-white/[0.04] transition-colors duration-150 last:border-0 hover:bg-gradient-to-r hover:from-violet-500/[0.07] hover:via-transparent hover:to-fuchsia-500/[0.04]";
