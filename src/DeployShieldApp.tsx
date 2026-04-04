import { UserButton } from "@clerk/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  analyzeRelease,
  apiBase,
  checkHealth,
  fetchAnalyticsSummary,
  fetchServiceRisk,
  getAssessment,
  listAssessments,
  recordDecision,
  type AnalyticsSummary,
  type Assessment,
  type AssessmentSummary,
  type ServiceRiskRow,
} from "./api";
import LogoMark from "./components/brand/LogoMark";
import { Card, CardContent } from "./components/ui/Card";
import AppBackdrop from "./components/ui/AppBackdrop";
import Button from "./components/ui/Button";
import EmptyState from "./components/ui/EmptyState";
import RiskBadge, { riskBadgeClass } from "./components/ui/RiskBadge";
import StatTile from "./components/ui/StatTile";
import { inputFieldClass, labelClass } from "./components/ui/input-classes";

export type DeployShieldAppProps = {
  selectedRepoScope: string[];
};

type Tab = "analyze" | "history" | "intelligence";

const recLabel: Record<string, string> = {
  safe_to_deploy: "Safe to deploy",
  needs_review: "Needs review",
  do_not_deploy: "Do not deploy",
};

export default function DeployShieldApp({ selectedRepoScope }: DeployShieldAppProps) {
  const [tab, setTab] = useState<Tab>("analyze");
  const [health, setHealth] = useState<string>("…");
  const [prUrl, setPrUrl] = useState("");
  const [repo, setRepo] = useState("");
  const [deployBranch, setDeployBranch] = useState("");
  const [baseBranch, setBaseBranch] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [current, setCurrent] = useState<Assessment | null>(null);
  const [history, setHistory] = useState<AssessmentSummary[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [services, setServices] = useState<ServiceRiskRow[]>([]);
  const [intelLoading, setIntelLoading] = useState(false);
  const [decisionNote, setDecisionNote] = useState("");
  const [decidedBy, setDecidedBy] = useState("");

  const refreshHistory = useCallback(async () => {
    const rows = await listAssessments(80);
    setHistory(rows);
  }, []);

  useEffect(() => {
    checkHealth()
      .then(() => setHealth("API connected"))
      .catch(() => setHealth("API offline"));
  }, []);

  const didSeedRepo = useRef(false);
  useEffect(() => {
    if (didSeedRepo.current || selectedRepoScope.length === 0) return;
    didSeedRepo.current = true;
    setRepo((r) => (r.trim() ? r : selectedRepoScope[0]));
  }, [selectedRepoScope]);

  useEffect(() => {
    if (tab === "history") {
      refreshHistory().catch((e) => setErr(String(e.message)));
    }
    if (tab === "intelligence") {
      setIntelLoading(true);
      Promise.all([fetchAnalyticsSummary(), fetchServiceRisk(25)])
        .then(([a, s]) => {
          setAnalytics(a);
          setServices(s);
        })
        .catch((e) => setErr(String(e.message)))
        .finally(() => setIntelLoading(false));
    }
  }, [tab, refreshHistory]);

  async function onAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const body =
        prUrl.trim().length > 0
          ? { pr_url: prUrl.trim(), service_name: serviceName || undefined }
          : deployBranch.trim().length > 0
            ? {
                repo_full_name: repo.trim(),
                branch: deployBranch.trim(),
                base_branch: baseBranch.trim() || undefined,
                service_name: serviceName || undefined,
              }
            : {
                repo_full_name: repo.trim(),
                service_name: serviceName || undefined,
              };
      const a = await analyzeRelease(body);
      setCurrent(a);
      await refreshHistory();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  async function onDecision(decision: "proceed" | "hold" | "review") {
    if (!current) return;
    setErr(null);
    try {
      await recordDecision(current.id, {
        decision,
        notes: decisionNote || undefined,
        decided_by: decidedBy || undefined,
      });
      setDecisionNote("");
      const fresh = await getAssessment(current.id);
      setCurrent(fresh);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Request failed");
    }
  }

  return (
    <div className="relative min-h-dvh text-zinc-100 antialiased">
      <AppBackdrop intensity="subtle" />
      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#050508]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <LogoMark size="sm" />
            <div className="text-left">
              <h1 className="font-display text-lg font-semibold tracking-tight text-white sm:text-xl">
                DeployShield
              </h1>
              <p className="text-xs text-zinc-500">Pre-deployment signals — you keep the final call.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={
                health.includes("connected")
                  ? "rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-500/30"
                  : "rounded-full bg-rose-500/15 px-2.5 py-1 text-[11px] font-medium text-rose-200 ring-1 ring-rose-500/30"
              }>
              {health}
            </span>
            <code className="hidden rounded-lg border border-white/[0.06] bg-zinc-950/80 px-2 py-1 font-mono text-[10px] text-zinc-500 sm:inline">
              {apiBase}
            </code>
            <UserButton
              appearance={{
                elements: { userButtonAvatarBox: "h-9 w-9 ring-1 ring-white/10" },
                variables: { colorPrimary: "#7c3aed" },
              }}
            />
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-3 sm:px-6">
          <nav className="inline-flex rounded-xl border border-white/[0.08] bg-zinc-950/50 p-1 shadow-inner shadow-black/30">
            {(
              [
                ["analyze", "Assess release"],
                ["history", "History"],
                ["intelligence", "Intelligence"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setTab(id);
                  setErr(null);
                }}
                className={
                  tab === id
                    ? "rounded-lg bg-white/[0.12] px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-white/10"
                    : "rounded-lg px-4 py-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-200"
                }>
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {err && (
          <div className="mb-6 rounded-2xl border border-rose-500/35 bg-rose-950/40 px-4 py-3.5 text-sm text-rose-100 shadow-lg shadow-rose-950/20">
            {err}
          </div>
        )}

        {tab === "analyze" && (
          <div className="grid gap-8 lg:grid-cols-5">
            <Card glow className="lg:col-span-2">
              <CardContent>
                <h2 className="font-display text-base font-semibold text-white">Ingest signals</h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                  Use a <strong className="font-medium text-zinc-300">PR link</strong>, a{" "}
                  <strong className="font-medium text-zinc-300">branch (tree) link</strong>, or{" "}
                  <strong className="font-medium text-zinc-300">owner/repo + deploy branch</strong> for direct promotes.
                  Optional <code className="rounded bg-zinc-900 px-1 py-0.5 text-zinc-400">GITHUB_TOKEN</code> on the
                  API improves shared ingest; onboarding OAuth drives repo listing.
                </p>
                <form onSubmit={onAnalyze} className="mt-6 space-y-4">
                  <div>
                    <label className={labelClass}>GitHub PR or branch URL</label>
                    <input
                      value={prUrl}
                      onChange={(e) => setPrUrl(e.target.value)}
                      placeholder="https://github.com/org/repo/pull/123 or …/tree/release-candidate"
                      className={`mt-1.5 ${inputFieldClass}`}
                    />
                  </div>
                  <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
                    or branch deployment
                  </p>
                  <div>
                    <label className={labelClass}>
                      Repository <span className="font-normal normal-case tracking-normal text-zinc-600">(owner/repo)</span>
                    </label>
                    <input
                      value={repo}
                      onChange={(e) => setRepo(e.target.value)}
                      placeholder="acme/platform-api"
                      className={`mt-1.5 ${inputFieldClass}`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Deploy branch{" "}
                      <span className="font-normal normal-case tracking-normal text-zinc-600">(head ref)</span>
                    </label>
                    <input
                      value={deployBranch}
                      onChange={(e) => setDeployBranch(e.target.value)}
                      placeholder="main, release/v2, feature/observability"
                      className={`mt-1.5 ${inputFieldClass}`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Base branch{" "}
                      <span className="font-normal normal-case tracking-normal text-zinc-600">(optional)</span>
                    </label>
                    <input
                      value={baseBranch}
                      onChange={(e) => setBaseBranch(e.target.value)}
                      placeholder="Defaults to repo default branch for compare"
                      className={`mt-1.5 ${inputFieldClass}`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Service name{" "}
                      <span className="font-normal normal-case tracking-normal text-zinc-600">(optional)</span>
                    </label>
                    <input
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      placeholder="checkout-api"
                      className={`mt-1.5 ${inputFieldClass}`}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={
                      loading ||
                      (!prUrl.trim() && !repo.trim()) ||
                      (!prUrl.trim() && deployBranch.trim().length > 0 && repo.trim().length === 0)
                    }
                    className="w-full py-3">
                    {loading ? "Analyzing…" : "Run risk analysis"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="min-h-[320px] lg:col-span-3" glow>
              <CardContent className="min-h-[280px]">
              {!current ? (
                <EmptyState
                  className="min-h-[260px] border-0 bg-transparent"
                  title="Ready when you are"
                  description="Run an assessment to see risk score, level, failure probability, and a narrative. Your team always makes the final call."
                  icon={
                    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                      />
                    </svg>
                  }
                />
              ) : (
                <div className="space-y-6 text-left">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-500">Repository</p>
                      <p className="font-medium text-white">{current.repo_full_name}</p>
                      {current.pr_url && (
                        <a
                          href={current.pr_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-block text-xs text-violet-400 hover:underline">
                          Open link
                        </a>
                      )}
                      {!current.pr_url && current.branch && (
                        <a
                          href={`https://github.com/${current.repo_full_name}/tree/${current.branch.split("/").map(encodeURIComponent).join("/")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-block text-xs text-violet-400 hover:underline">
                          View branch on GitHub
                        </a>
                      )}
                      {typeof current.signals?.deployment_channel === "string" && (
                        <p className="mt-2 text-xs text-zinc-500">
                          Channel:{" "}
                          <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">
                            {String(current.signals.deployment_channel).replace(/_/g, " ")}
                          </span>
                          {typeof current.signals?.base_branch === "string" && (
                            <>
                              {" "}
                              · vs base{" "}
                              <code className="text-zinc-400">{String(current.signals.base_branch)}</code>
                            </>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <RiskBadge level={current.risk_level} withSuffix />
                      <p className="mt-3 font-display text-4xl font-semibold tabular-nums text-white">
                        {current.risk_score}
                        <span className="text-lg text-zinc-500">/100</span>
                      </p>
                      <p className="text-xs text-zinc-500">
                        Failure probability ~{(current.failure_probability * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.08] bg-violet-500/[0.06] p-4 ring-1 ring-violet-500/10">
                    <p className={labelClass}>Recommendation</p>
                    <p className="mt-2 font-display text-lg font-medium text-zinc-100">
                      {recLabel[current.recommendation] ?? current.recommendation}
                    </p>
                  </div>

                  <div>
                    <p className={labelClass}>Explanation</p>
                    <pre className="mt-2 max-h-[min(28rem,50vh)] overflow-auto whitespace-pre-wrap rounded-2xl border border-white/[0.08] bg-black/40 p-4 font-mono text-xs leading-relaxed text-zinc-400 shadow-inner shadow-black/30">
                      {current.explanation}
                    </pre>
                  </div>

                  <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/50 p-5">
                    <p className={labelClass}>Human decision</p>
                    <p className="mt-2 text-sm text-zinc-400">
                      DeployShield does not block releases. Record what the release manager decides.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <input
                        value={decidedBy}
                        onChange={(e) => setDecidedBy(e.target.value)}
                        placeholder="Your name (optional)"
                        className={inputFieldClass}
                      />
                      <input
                        value={decisionNote}
                        onChange={(e) => setDecisionNote(e.target.value)}
                        placeholder="Notes (optional)"
                        className={`sm:col-span-2 ${inputFieldClass}`}
                      />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="success" onClick={() => onDecision("proceed")}>
                        Proceed to deployment
                      </Button>
                      <Button variant="warning" onClick={() => onDecision("hold")}>
                        Hold deployment
                      </Button>
                      <Button variant="secondary" onClick={() => onDecision("review")}>
                        Send for review
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              </CardContent>
            </Card>
          </div>
        )}

        {tab === "history" && (
          <section>
            <h2 className="font-display text-lg font-semibold text-white">Recent assessments</h2>
            <p className="mt-1 text-sm text-zinc-500">Open a row to load it into the assess tab.</p>
            <Card className="mt-5 overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-white/[0.08] bg-zinc-950/80 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                    <tr>
                      <th className="px-4 py-3.5">ID</th>
                      <th className="px-4 py-3.5">Repo</th>
                      <th className="px-4 py-3.5">Score</th>
                      <th className="px-4 py-3.5">Level</th>
                      <th className="px-4 py-3.5">Rec</th>
                      <th className="px-4 py-3.5">When</th>
                      <th className="px-4 py-3.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {history.map((h) => (
                      <tr key={h.id} className="transition hover:bg-white/[0.03]">
                        <td className="px-4 py-3.5 font-mono text-xs text-zinc-500">#{h.id}</td>
                        <td className="px-4 py-3.5 text-zinc-200">{h.repo_full_name}</td>
                        <td className="px-4 py-3.5 tabular-nums text-zinc-300">{h.risk_score}</td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${riskBadgeClass(h.risk_level)}`}>
                            {h.risk_level}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-zinc-400">
                          {recLabel[h.recommendation] ?? h.recommendation}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-zinc-500">
                          {new Date(h.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={async () => {
                              setErr(null);
                              try {
                                const a = await getAssessment(h.id);
                                setCurrent(a);
                                setTab("analyze");
                              } catch (ex) {
                                setErr(ex instanceof Error ? ex.message : "Load failed");
                              }
                            }}
                            className="text-xs font-semibold text-violet-400 transition hover:text-violet-300">
                            Open →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {history.length === 0 && (
                  <p className="px-4 py-12 text-center text-sm text-zinc-500">No assessments yet.</p>
                )}
              </div>
            </Card>
          </section>
        )}

        {tab === "intelligence" && intelLoading && (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
            <p className="text-sm text-zinc-500">Loading intelligence…</p>
          </div>
        )}

        {tab === "intelligence" && !intelLoading && analytics && (
          <section className="space-y-10">
            <div>
              <h2 className="font-display text-lg font-semibold text-white">Portfolio snapshot</h2>
              <p className="mt-1 text-sm text-zinc-500">Aggregates from assessments stored in your workspace.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatTile label="Assessments" value={analytics.total_assessments} />
                <StatTile label="Avg risk score" value={analytics.avg_risk_score.toFixed(1)} />
                <StatTile label="High risk (7d)" value={analytics.recent_high_risk} accent="rose" />
                <StatTile
                  label="By level"
                  dense
                  value={
                    Object.entries(analytics.by_level)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" · ") || "—"
                  }
                />
              </div>
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-white">Repos by average risk</h3>
              <Card className="mt-4 overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead className="border-b border-white/[0.08] bg-zinc-950/80 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                      <tr>
                        <th className="px-4 py-3.5">Repository</th>
                        <th className="px-4 py-3.5">Count</th>
                        <th className="px-4 py-3.5">Avg score</th>
                        <th className="px-4 py-3.5">Last run</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {services.map((s) => (
                        <tr key={s.repo_full_name} className="transition hover:bg-white/[0.03]">
                          <td className="px-4 py-3.5 text-zinc-200">{s.repo_full_name}</td>
                          <td className="px-4 py-3.5 tabular-nums text-zinc-400">{s.assessment_count}</td>
                          <td className="px-4 py-3.5 tabular-nums text-zinc-300">{s.avg_risk_score.toFixed(1)}</td>
                          <td className="px-4 py-3.5 text-xs text-zinc-500">
                            {s.last_assessment_at ? new Date(s.last_assessment_at).toLocaleString() : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {services.length === 0 && (
                    <p className="px-4 py-12 text-center text-sm text-zinc-500">No data yet.</p>
                  )}
                </div>
              </Card>
            </div>
          </section>
        )}
      </main>

      <footer className="mx-auto max-w-6xl border-t border-white/[0.06] px-4 py-8 text-center text-xs leading-relaxed text-zinc-600 sm:px-6">
        <span className="text-zinc-500">DeployShield</span> — decision support only. Configure CI/CD and providers on
        the backend.
      </footer>
    </div>
  );
}
