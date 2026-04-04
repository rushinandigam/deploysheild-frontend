import { useCallback, useEffect, useState } from "react";

import { fetchMyGithubRepos, type GithubRepoRow } from "../api";
import { loadSelectedRepos, saveSelectedRepos, setRepoOnboardingDone } from "../lib/onboardingStorage";
import LogoMark from "./brand/LogoMark";
import { Card, CardContent } from "./ui/Card";
import AppBackdrop from "./ui/AppBackdrop";
import Button from "./ui/Button";

type Props = {
  userId: string;
  getToken: () => Promise<string | null>;
  onComplete: () => void;
};

export default function RepoScopeStep({ userId, getToken, onComplete }: Props) {
  const [rows, setRows] = useState<GithubRepoRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(loadSelectedRepos(userId)));
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    setLoading(true);
    try {
      const list = await fetchMyGithubRepos(getToken);
      setRows(list);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load repositories");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  function toggle(full: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(full)) next.delete(full);
      else next.add(full);
      return next;
    });
  }

  function selectAllVisible() {
    setSelected(new Set(rows.map((r) => r.full_name)));
  }

  function clearAll() {
    setSelected(new Set());
  }

  function finish() {
    saveSelectedRepos(userId, [...selected]);
    setRepoOnboardingDone(userId);
    onComplete();
  }

  function skipEmpty() {
    saveSelectedRepos(userId, []);
    setRepoOnboardingDone(userId);
    onComplete();
  }

  return (
    <div className="relative min-h-dvh px-4 py-10 text-zinc-100">
      <AppBackdrop />
      <div className="relative mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <LogoMark size="sm" />
          <div>
            <p className="font-display text-lg font-semibold text-white">Repository scope</p>
            <p className="text-xs text-zinc-500">Stored on this device for your account</p>
          </div>
        </div>

        <Card glow>
          <CardContent>
            <h2 className="font-display text-xl font-semibold text-white">Choose repositories</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Select repos DeployShield should prioritize. You can still type any{" "}
              <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-zinc-400">owner/repo</code> later on the assess
              tab.
            </p>

            {err && (
              <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-rose-500/35 bg-rose-950/45 px-4 py-3 text-sm text-rose-100">
                <span>{err}</span>
                <button type="button" onClick={() => load()} className="text-sm font-semibold text-violet-400 hover:text-violet-300">
                  Retry
                </button>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={loading || rows.length === 0}
                onClick={selectAllVisible}
                className="text-xs">
                Select all visible
              </Button>
              <Button variant="secondary" onClick={clearAll} className="text-xs">
                Clear
              </Button>
              <Button variant="ghost" onClick={() => load()} className="text-xs">
                Reload list
              </Button>
            </div>

            {loading && (
              <div className="mt-8 flex items-center gap-3 text-sm text-zinc-500">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
                Loading from GitHub…
              </div>
            )}

            {!loading && rows.length > 0 && (
              <ul className="mt-6 max-h-[min(420px,50vh)] space-y-1 overflow-y-auto rounded-2xl border border-white/[0.08] bg-zinc-950/50 p-2 shadow-inner shadow-black/30">
                {rows.map((r) => (
                  <li key={r.full_name}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/[0.04]">
                      <input
                        type="checkbox"
                        checked={selected.has(r.full_name)}
                        onChange={() => toggle(r.full_name)}
                        className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-violet-600 focus:ring-violet-500"
                      />
                      <span className="flex-1 font-mono text-sm text-zinc-200">{r.full_name}</span>
                      {r.private && (
                        <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                          private
                        </span>
                      )}
                    </label>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="primary" onClick={finish} className="px-6 py-3">
                Continue with {selected.size} repo{selected.size === 1 ? "" : "s"}
              </Button>
              <Button variant="secondary" onClick={skipEmpty} className="px-6 py-3">
                Skip — type repos manually
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
