import { cn } from "../../lib/cn";

export function riskBadgeClass(level: string): string {
  if (level === "low") return "bg-emerald-500/15 text-emerald-200 ring-emerald-500/35";
  if (level === "medium") return "bg-amber-500/15 text-amber-200 ring-amber-500/35";
  return "bg-rose-500/15 text-rose-200 ring-rose-500/35";
}

type Props = {
  level: string;
  className?: string;
  /** "low risk" vs just "low" */
  withSuffix?: boolean;
};

export default function RiskBadge({ level, className, withSuffix }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1",
        riskBadgeClass(level),
        className,
      )}>
      {level}
      {withSuffix ? " risk" : ""}
    </span>
  );
}
