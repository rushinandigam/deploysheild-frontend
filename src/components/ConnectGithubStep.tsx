import { useAuth } from "@clerk/react";
import { useState } from "react";

import { postGithubAuthorizeUrl } from "../api";

type Props = {
  oauthError?: boolean;
};

export default function ConnectGithubStep({ oauthError = false }: Props) {
  const { getToken } = useAuth();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(oauthError ? "GitHub authorization was cancelled or failed." : null);

  async function startOAuth() {
    setErr(null);
    setBusy(true);
    try {
      const url = await postGithubAuthorizeUrl(getToken);
      window.location.assign(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not start GitHub authorization");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
        <h2 className="font-[Instrument_Sans,sans-serif] text-xl font-semibold text-white">
          Authorize DeployShield on GitHub
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          This is <strong className="text-zinc-300">separate from Clerk</strong>. You sign in here with email/password;
          then you explicitly allow <strong className="text-zinc-300">our GitHub OAuth application</strong> to access
          repositories you grant. Tokens stay on <strong className="text-zinc-300">our backend</strong> and are used
          only to read repo metadata (branches, PRs, commits, Actions) for assessments you run.
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          Create an OAuth App in GitHub (or use your org&apos;s) and set the callback URL to your API&apos;s{" "}
          <code className="text-zinc-400">/api/v1/integrations/github/callback</code>.
        </p>
        {err && (
          <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
            {err}
          </div>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => startOAuth()}
          className="mt-8 w-full rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
          {busy ? "Redirecting to GitHub…" : "Continue with GitHub"}
        </button>
        <p className="mt-6 text-left text-xs text-zinc-600">
          After GitHub redirects back to DeployShield, you&apos;ll pick which repositories to prioritize. You can revoke
          access anytime by removing the OAuth app from GitHub or clearing the connection in a future settings screen.
        </p>
      </div>
    </div>
  );
}
