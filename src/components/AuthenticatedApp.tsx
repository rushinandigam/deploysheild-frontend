import { useAuth, useUser } from "@clerk/react";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";

import { fetchGithubConnectionStatus } from "../api";
import DeployShieldApp from "../DeployShieldApp";
import { isRepoOnboardingDone, loadSelectedRepos } from "../lib/onboardingStorage";
import LogoMark from "./brand/LogoMark";
import { Card, CardContent } from "./ui/Card";
import AppBackdrop from "./ui/AppBackdrop";
import ConnectGithubStep from "./ConnectGithubStep";
import RepoScopeStep from "./RepoScopeStep";

function AuthLoading({ message }: { message: string }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4">
      <AppBackdrop />
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <LogoMark size="md" />
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
          <p className="text-sm text-zinc-500">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function readInitialGithubOauthError(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("github_oauth") === "error";
}

export default function AuthenticatedApp() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [repoGateDone, setRepoGateDone] = useState(false);
  const [githubConn, setGithubConn] = useState<{ connected: boolean } | null>(null);
  const [oauthErr] = useState(readInitialGithubOauthError);

  const refreshGithub = useCallback(async () => {
    try {
      const s = await fetchGithubConnectionStatus(getToken);
      setGithubConn({ connected: s.connected });
    } catch {
      setGithubConn({ connected: false });
    }
  }, [getToken]);

  useLayoutEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const g = p.get("github_oauth");
    if (g === "success" || g === "error") {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !user) return;
    const id = window.setTimeout(() => {
      void refreshGithub();
    }, 0);
    return () => window.clearTimeout(id);
  }, [isLoaded, user, refreshGithub]);

  if (!isLoaded) {
    return <AuthLoading message="Loading…" />;
  }

  if (!user) {
    return <AuthLoading message="Restoring session…" />;
  }

  if (githubConn === null) {
    return <AuthLoading message="Checking GitHub link…" />;
  }

  if (!githubConn.connected) {
    return <ConnectGithubStep oauthError={oauthErr} />;
  }

  const onboardingComplete =
    repoGateDone || (user.id ? isRepoOnboardingDone(user.id) : false);

  if (!onboardingComplete) {
    return (
      <RepoScopeStep
        userId={user.id}
        getToken={getToken}
        onComplete={() => setRepoGateDone(true)}
      />
    );
  }

  return <DeployShieldApp selectedRepoScope={loadSelectedRepos(user.id)} />;
}
