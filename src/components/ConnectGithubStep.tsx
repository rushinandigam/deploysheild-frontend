import { useAuth } from "@clerk/react";
import { useState } from "react";

import { postGithubAuthorizeUrl } from "../api";
import LogoMark from "./brand/LogoMark";
import { Card, CardContent } from "./ui/Card";
import AppBackdrop from "./ui/AppBackdrop";
import Button from "./ui/Button";

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
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <AppBackdrop />
      <Card glow className="w-full max-w-lg text-center shadow-2xl shadow-black/50">
        <CardContent className="p-0">
          <div className="px-8 py-10 sm:px-10">
            <div className="mx-auto flex w-fit flex-col items-center gap-3">
              <LogoMark size="md" />
              <p className="font-display text-lg font-semibold text-white">Connect GitHub</p>
            </div>
            <h2 className="mt-6 font-display text-xl font-semibold tracking-tight text-white">
              Authorize DeployShield
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              This is <strong className="font-medium text-zinc-200">separate from Clerk</strong>. You signed in with
              email/password or Google; now allow{" "}
              <strong className="font-medium text-zinc-200">DeployShield&apos;s GitHub OAuth app</strong> to read
              metadata for repos you choose. Tokens stay on{" "}
              <strong className="font-medium text-zinc-200">the backend</strong>.
            </p>
            <p className="mt-3 rounded-xl border border-white/[0.06] bg-zinc-950/50 px-3 py-2 text-left text-xs text-zinc-500">
              OAuth callback on your API:{" "}
              <code className="text-violet-300/90">/api/v1/integrations/github/callback</code>
            </p>
            {err && (
              <div className="mt-4 rounded-xl border border-rose-500/35 bg-rose-950/45 px-3.5 py-2.5 text-sm text-rose-100">
                {err}
              </div>
            )}
            <Button
              variant="primary"
              disabled={busy}
              onClick={() => void startOAuth()}
              className="mt-8 w-full py-3.5 text-base">
              {busy ? "Redirecting to GitHub…" : "Continue with GitHub"}
            </Button>
            <p className="mt-6 text-left text-xs leading-relaxed text-zinc-600">
              Next you&apos;ll pick repositories to prioritize. You can revoke the OAuth app in GitHub anytime.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
