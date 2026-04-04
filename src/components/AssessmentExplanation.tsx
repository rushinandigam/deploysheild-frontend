import { labelClass } from "./ui/input-classes";

type Props = {
  rules: string;
  ai: string | null;
};

export default function AssessmentExplanation({ rules, ai }: Props) {
  const body = rules.trim() || "—";

  return (
    <div className="space-y-5 animate-[fadeUp_0.45s_ease-out]">
      <div>
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

      {ai ? (
        <div className="relative">
          <div
            className="absolute -inset-px rounded-2xl bg-gradient-to-br from-cyan-500/25 via-violet-500/20 to-fuchsia-500/25 opacity-90 blur-[1px]"
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-2xl border border-cyan-500/25 bg-zinc-950/95 shadow-xl shadow-cyan-950/20">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(34,211,238,0.12),transparent)]" />
            <div className="relative px-5 pb-5 pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/30 to-fuchsia-500/20 text-cyan-200 ring-1 ring-cyan-400/30">
                  <SparklesIcon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200/90">
                    AI-assisted insight
                  </p>
                  <p className="text-[10px] text-zinc-500">OpenAI · metadata &amp; paths, not a line-by-line audit</p>
                </div>
              </div>
              <div className="mt-4 max-h-[min(28rem,50vh)] overflow-y-auto rounded-xl border border-white/[0.06] bg-black/25 px-4 py-3.5">
                <p className="whitespace-pre-wrap font-sans text-[13px] leading-[1.8] text-zinc-200">{ai}</p>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-zinc-600">
                Use alongside the rule narrative; verify critical changes in your own review process.
              </p>
            </div>
          </div>
        </div>
      ) : null}
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

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}
