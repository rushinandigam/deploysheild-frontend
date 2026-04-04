import { useEffect, useId, useRef } from "react";

import { cn } from "../lib/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  aiText: string | null;
  requestError: string | null;
};

/** Separate, focused surface for the OpenAI addendum with a clear loading state. */
export default function AiInsightModal({ open, onClose, loading, aiText, requestError }: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
  }, [open, loading]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-[#030306]/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "relative z-[101] flex max-h-[min(88vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-cyan-500/30 bg-zinc-950 shadow-2xl shadow-cyan-950/40 ring-1 ring-inset ring-white/[0.06]",
          "animate-[fadeUp_0.25s_ease-out]",
        )}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_50%_at_50%_-10%,rgba(34,211,238,0.12),transparent)] pointer-events-none" />
        <header className="relative flex shrink-0 items-start justify-between gap-4 border-b border-white/[0.08] px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/35 to-fuchsia-500/25 text-cyan-100 ring-1 ring-cyan-400/35">
              <SparklesIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 id={titleId} className="font-display text-lg font-semibold tracking-tight text-white">
                OpenAI-assisted review
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                Generated from change metadata and paths — not a full line-by-line audit. Shown when your backend has an
                OpenAI API key configured.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-white/[0.1] bg-zinc-900/80 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-white/20 hover:bg-zinc-800 hover:text-white">
            Close
          </button>
        </header>

        <div className="relative min-h-[200px] flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
              <div
                className="relative h-14 w-14"
                role="status"
                aria-live="polite"
                aria-label="Loading OpenAI-assisted review">
                <div className="absolute inset-0 animate-spin rounded-full border-2 border-cyan-500/20 border-t-cyan-400" />
                <div
                  className="absolute inset-2 animate-spin rounded-full border-2 border-fuchsia-500/15 border-b-fuchsia-400/80"
                  style={{ animationDirection: "reverse", animationDuration: "1.2s" }}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">Waiting for OpenAI…</p>
                <p className="mt-2 max-w-sm text-xs leading-relaxed text-zinc-500">
                  Your assessment runs on the server: signals, risk scoring, and the optional OpenAI addendum arrive in
                  one response. This can take a few seconds.
                </p>
              </div>
            </div>
          ) : requestError ? (
            <div className="rounded-xl border border-rose-500/35 bg-rose-950/30 px-4 py-3 text-sm text-rose-100">
              {requestError}
            </div>
          ) : aiText && aiText.trim().length > 0 ? (
            <div className="rounded-xl border border-white/[0.08] bg-black/35 px-4 py-4 shadow-inner shadow-black/40">
              <p className="whitespace-pre-wrap font-sans text-[13px] leading-[1.85] text-zinc-200">{aiText.trim()}</p>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-600/50 bg-zinc-900/40 px-4 py-8 text-center">
              <p className="text-sm text-zinc-300">No AI-assisted text for this assessment</p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                The server may not have <code className="rounded bg-zinc-800 px-1 py-0.5 text-zinc-400">OPENAI_API_KEY</code>{" "}
                set, or the model returned nothing. The rule-engine narrative on the main panel still applies.
              </p>
            </div>
          )}
        </div>

        {!loading ? (
          <footer className="relative shrink-0 border-t border-white/[0.06] px-5 py-3 sm:px-6">
            <p className="text-[11px] leading-relaxed text-zinc-600">
              Use this output alongside your team&apos;s review; do not treat it as approval to deploy on its own.
            </p>
          </footer>
        ) : null}
      </div>
    </div>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}
