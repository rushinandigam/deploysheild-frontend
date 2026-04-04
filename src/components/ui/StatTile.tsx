import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

type Props = {
  label: string;
  value: ReactNode;
  /** Emphasize value (e.g. high risk count) */
  accent?: "rose" | "none";
  /** Smaller text for long string values */
  dense?: boolean;
};

export default function StatTile({ label, value, accent = "none", dense }: Props) {
  const valueClass = dense
    ? cn("text-sm font-medium leading-relaxed", accent === "rose" ? "text-rose-300" : "text-zinc-300")
    : cn(
        "font-display text-2xl font-semibold tabular-nums",
        accent === "rose" ? "text-rose-300" : "text-white",
      );

  return (
    <div className="group rounded-2xl border border-white/[0.1] bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 p-5 shadow-inner shadow-black/30 ring-1 ring-inset ring-white/[0.04] transition duration-300 hover:border-violet-500/25 hover:shadow-violet-950/20">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 transition group-hover:text-violet-300/80">
        {label}
      </p>
      <p className={cn("mt-2 tracking-tight", valueClass)}>{value}</p>
    </div>
  );
}
