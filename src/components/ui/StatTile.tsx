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
    <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/45 p-5 shadow-inner shadow-black/25">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className={cn("mt-2 tracking-tight", valueClass)}>{value}</p>
    </div>
  );
}
