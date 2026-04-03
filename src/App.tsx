import { useCallback, useEffect, useState } from "react";
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

type Tab = "analyze" | "history" | "intelligence";

const recLabel: Record<string, string> = {
  safe_to_deploy: "Safe to deploy",
  needs_review: "Needs review",
  do_not_deploy: "Do not deploy",
};

function levelStyles(level: string) {
  if (level === "low") return "bg-emerald-500/15 text-emerald-200 ring-emerald-500/40";
  if (level === "medium") return "bg-amber-500/15 text-amber-200 ring-amber-500/40";
  return "bg-rose-500/15 text-rose-200 ring-rose-500/40";
}

export default function App() {
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
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 font-sans antialiased">
      <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-900/40">
              <span className="font-[Instrument_Sans,sans-serif] text-lg font-semibold text-white">
                DS
              </span>
            </div>
            <div className="text-left">
              <h1 className="font-[Instrument_Sans,sans-serif] text-lg font-semibold tracking-tight text-white sm:text-xl">
                DeployShield
              </h1>
              <p className="text-xs text-zinc-500">
                Pre-deployment decision support — analyze, explain, you decide.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span
              className={
                health.includes("connected")
                  ? "rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-400 ring-1 ring-emerald-500/30"
                  : "rounded-full bg-rose-500/10 px-2 py-1 text-rose-300 ring-1 ring-rose-500/30"
              }>
              {health}
            </span>
            <code className="rounded bg-zinc-900 px-2 py-1 text-[10px] text-zinc-400">{apiBase}</code>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 border-t border-zinc-800/60 px-4 sm:px-6">
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
                  ? "border-b-2 border-violet-500 px-3 py-3 text-sm font-medium text-white"
                  : "border-b-2 border-transparent px-3 py-3 text-sm text-zinc-500 hover:text-zinc-300"
              }>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {err && (
          <div className="mb-6 rounded-xl border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
            {err}
          </div>
        )}

        {tab === "analyze" && (
          <div className="grid gap-8 lg:grid-cols-5">
            <section className="lg:col-span-2">
              <h2 className="font-[Instrument_Sans,sans-serif] text-base font-semibold text-white">
                Ingest signals
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Use a <strong className="text-zinc-400">PR link</strong>, a{" "}
                <strong className="text-zinc-400">branch (tree) link</strong>, or{" "}
                <strong className="text-zinc-400">owner/repo + deploy branch</strong> for direct
                branch promotes. Optional <code className="text-zinc-400">GITHUB_TOKEN</code> on the
                API enables live GitHub compare + Actions signals.
              </p>
              <form onSubmit={onAnalyze} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
                    GitHub PR or branch URL
                  </label>
                  <input
                    value={prUrl}
                    onChange={(e) => setPrUrl(e.target.value)}
                    placeholder="https://github.com/org/repo/pull/123 or …/tree/release-candidate"
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <p className="text-center text-xs text-zinc-600">or branch deployment</p>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Repository <span className="normal-case text-zinc-600">(owner/repo)</span>
                  </label>
                  <input
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                    placeholder="acme/platform-api"
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Deploy branch{" "}
                    <span className="normal-case text-zinc-600">(head ref to ship)</span>
                  </label>
                  <input
                    value={deployBranch}
                    onChange={(e) => setDeployBranch(e.target.value)}
                    placeholder="main, release/v2, feature/observability"
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Base branch <span className="normal-case text-zinc-600">(optional)</span>
                  </label>
                  <input
                    value={baseBranch}
                    onChange={(e) => setBaseBranch(e.target.value)}
                    placeholder="Defaults to repo default branch for compare"
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Service name <span className="normal-case text-zinc-600">(optional)</span>
                  </label>
                  <input
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder="checkout-api"
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={
                    loading ||
                    (!prUrl.trim() && !repo.trim()) ||
                    (!prUrl.trim() && deployBranch.trim().length > 0 && repo.trim().length === 0)
                  }
                  className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
                  {loading ? "Analyzing…" : "Run risk analysis"}
                </button>
              </form>
            </section>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 lg:col-span-3">
              {!current ? (
                <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center text-sm text-zinc-500">
                  <p className="max-w-sm">
                    Results appear here with score, level, failure probability, and a rule-based
                    narrative. Your team always makes the final call.
                  </p>
                </div>
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
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ${levelStyles(current.risk_level)}`}>
                        {current.risk_level} risk
                      </span>
                      <p className="mt-3 text-4xl font-semibold tabular-nums text-white">
                        {current.risk_score}
                        <span className="text-lg text-zinc-500">/100</span>
                      </p>
                      <p className="text-xs text-zinc-500">
                        Failure probability ~{(current.failure_probability * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                    <p className="text-xs uppercase tracking-wider text-zinc-500">Recommendation</p>
                    <p className="mt-1 text-lg font-medium text-zinc-100">
                      {recLabel[current.recommendation] ?? current.recommendation}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-500">Explanation</p>
                    <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-zinc-800 bg-black/30 p-4 text-xs leading-relaxed text-zinc-400">
                      {current.explanation}
                    </pre>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Human decision
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      DeployShield does not block releases. Record what the release manager decides.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <input
                        value={decidedBy}
                        onChange={(e) => setDecidedBy(e.target.value)}
                        placeholder="Your name (optional)"
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600"
                      />
                      <input
                        value={decisionNote}
                        onChange={(e) => setDecisionNote(e.target.value)}
                        placeholder="Notes (optional)"
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 sm:col-span-2"
                      />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onDecision("proceed")}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500">
                        Proceed to deployment
                      </button>
                      <button
                        type="button"
                        onClick={() => onDecision("hold")}
                        className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500">
                        Hold deployment
                      </button>
                      <button
                        type="button"
                        onClick={() => onDecision("review")}
                        className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-600">
                        Send for review
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {tab === "history" && (
          <section>
            <h2 className="font-[Instrument_Sans,sans-serif] text-base font-semibold text-white">
              Recent assessments
            </h2>
            <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-900/50 text-xs uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Repo</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Level</th>
                    <th className="px-4 py-3">Rec</th>
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {history.map((h) => (
                    <tr key={h.id} className="hover:bg-zinc-900/40">
                      <td className="px-4 py-3 font-mono text-zinc-400">#{h.id}</td>
                      <td className="px-4 py-3 text-zinc-200">{h.repo_full_name}</td>
                      <td className="px-4 py-3 tabular-nums">{h.risk_score}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ring-1 ${levelStyles(h.risk_level)}`}>
                          {h.risk_level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">
                        {recLabel[h.recommendation] ?? h.recommendation}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {new Date(h.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
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
                          className="text-xs font-medium text-violet-400 hover:underline">
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {history.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-zinc-500">No assessments yet.</p>
              )}
            </div>
          </section>
        )}

        {tab === "intelligence" && intelLoading && (
          <p className="text-sm text-zinc-500">Loading intelligence…</p>
        )}

        {tab === "intelligence" && !intelLoading && analytics && (
          <section className="space-y-8">
            <div>
              <h2 className="font-[Instrument_Sans,sans-serif] text-base font-semibold text-white">
                Portfolio snapshot
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                  <p className="text-xs text-zinc-500">Assessments</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
                    {analytics.total_assessments}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                  <p className="text-xs text-zinc-500">Avg risk score</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
                    {analytics.avg_risk_score.toFixed(1)}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                  <p className="text-xs text-zinc-500">High risk (7d)</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-rose-300">
                    {analytics.recent_high_risk}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                  <p className="text-xs text-zinc-500">By level</p>
                  <p className="mt-1 text-sm text-zinc-300">
                    {Object.entries(analytics.by_level)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" · ") || "—"}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Repos by average risk</h3>
              <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-800">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="border-b border-zinc-800 bg-zinc-900/50 text-xs uppercase tracking-wider text-zinc-500">
                    <tr>
                      <th className="px-4 py-3">Repository</th>
                      <th className="px-4 py-3">Count</th>
                      <th className="px-4 py-3">Avg score</th>
                      <th className="px-4 py-3">Last run</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80">
                    {services.map((s) => (
                      <tr key={s.repo_full_name} className="hover:bg-zinc-900/40">
                        <td className="px-4 py-3 text-zinc-200">{s.repo_full_name}</td>
                        <td className="px-4 py-3 tabular-nums text-zinc-400">{s.assessment_count}</td>
                        <td className="px-4 py-3 tabular-nums">{s.avg_risk_score.toFixed(1)}</td>
                        <td className="px-4 py-3 text-xs text-zinc-500">
                          {s.last_assessment_at
                            ? new Date(s.last_assessment_at).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {services.length === 0 && (
                  <p className="px-4 py-8 text-center text-sm text-zinc-500">No data yet.</p>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="mx-auto max-w-6xl border-t border-zinc-800/60 px-4 py-6 text-center text-xs text-zinc-600 sm:px-6">
        DeployShield — decision support only. Wire CI/CD and Git providers via backend configuration.
      </footer>
    </div>
  );
}
