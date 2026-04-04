import { cn } from "../lib/cn";

type Props = {
  score: number;
  max?: number;
  level: string;
  className?: string;
};

/** Circular score ring + center readout for jury-friendly at-a-glance risk. */
export default function ScoreGauge({ score, max = 100, level, className }: Props) {
  const pct = Math.min(1, Math.max(0, score / max));
  const r = 40;
  const circumference = 2 * Math.PI * r;
  const dash = circumference * (1 - pct);

  const stroke =
    level === "low"
      ? "stroke-emerald-400"
      : level === "medium"
        ? "stroke-amber-400"
        : "stroke-rose-400";

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="relative">
        <svg viewBox="0 0 96 96" className="h-24 w-24 -rotate-90 drop-shadow-lg" aria-hidden>
          <defs>
            <linearGradient id="gaugeTrack" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(39 39 42)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="rgb(24 24 27)" stopOpacity="1" />
            </linearGradient>
          </defs>
          <circle cx="48" cy="48" r={r} className="fill-none stroke-[url(#gaugeTrack)]" strokeWidth="10" />
          <circle
            cx="48"
            cy="48"
            r={r}
            className={cn("fill-none transition-all duration-700 ease-out", stroke)}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dash}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-0.5">
          <span className="font-display text-2xl font-bold tabular-nums tracking-tight text-white">{score}</span>
          <span className="text-[9px] font-semibold uppercase tracking-widest text-zinc-500">/{max}</span>
        </div>
      </div>
    </div>
  );
}
