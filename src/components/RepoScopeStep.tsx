import { useCallback, useEffect, useState } from "react";

import { fetchMyGithubRepos, type GithubRepoRow } from "../api";
import { loadSelectedRepos, saveSelectedRepos, setRepoOnboardingDone } from "../lib/onboardingStorage";

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
    <div className="min-h-dvh bg-zinc-950 px-4 py-10 text-zinc-100">
      <div className="mx-auto max-w-3xl">
        <h2 className="font-[Instrument_Sans,sans-serif] text-xl font-semibold text-white">
          Choose repository scope
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Select every repository DeployShield should prioritize (you can still type any{" "}
          <code className="text-zinc-500">owner/repo</code> later). Selection is stored on this device for your
          account.
        </p>

        {err && (
          <div className="mt-6 rounded-xl border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
            {err}
            <button type="button" onClick={() => load()} className="ml-3 text-violet-400 hover:underline">
              Retry
            </button>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={selectAllVisible}
            disabled={loading || rows.length === 0}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800 disabled:opacity-40">
            Select all (this page)
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800">
            Clear
          </button>
          <button
            type="button"
            onClick={() => load()}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800">
            Reload list
          </button>
        </div>

        {loading && <p className="mt-8 text-sm text-zinc-500">Loading repositories from GitHub…</p>}

        {!loading && rows.length > 0 && (
          <ul className="mt-6 max-h-[min(420px,50vh)] space-y-1 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900/40 p-2">
            {rows.map((r) => (
              <li key={r.full_name}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-zinc-800/60">
                  <input
                    type="checkbox"
                    checked={selected.has(r.full_name)}
                    onChange={() => toggle(r.full_name)}
                    className="h-4 w-4 rounded border-zinc-600 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="flex-1 font-mono text-sm text-zinc-200">{r.full_name}</span>
                  {r.private && (
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase text-zinc-500">
                      private
                    </span>
                  )}
                </label>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={finish}
            className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 hover:brightness-110">
            Continue with {selected.size} repo{selected.size === 1 ? "" : "s"}
          </button>
          <button
            type="button"
            onClick={skipEmpty}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800">
            Skip — I&apos;ll type repos manually
          </button>
        </div>
      </div>
    </div>
  );
}
