import { labelClass } from "./ui/input-classes";

type Props = {
  rules: string;
};

/** Rule-engine narrative only; OpenAI addendum is shown in AiInsightModal. */
export default function AssessmentExplanation({ rules }: Props) {
  const body = rules.trim() || "—";

  return (
    <div className="animate-[fadeUp_0.45s_ease-out]">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/25">
          <RuleIcon className="h-4 w-4" />
        </span>
        <p className={labelClass}>Rule engine narrative</p>
      </div>
      <div className="mt-3 rounded-2xl border border-white/[0.08] border-l-[3px] border-l-violet-500/70 bg-gradient-to-br from-zinc-900/80 to-zinc-950/90 p-5 shadow-inner shadow-black/40">
        <div className="max-h-[min(22rem,45vh)] overflow-y-auto pr-1">
          <p className="whitespace-pre-wrap font-sans text-[13px] leading-[1.75] text-zinc-300">{body}</p>
        </div>
      </div>
    </div>
  );
}

function RuleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.42 15.17 17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655-5.653a2.548 2.548 0 010-3.586L11.42 15.17z"
      />
    </svg>
  );
}

