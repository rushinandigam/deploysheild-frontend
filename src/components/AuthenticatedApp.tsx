import { useAuth, useUser } from "@clerk/react";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";

import { fetchGithubConnectionStatus } from "../api";
import DeployShieldApp from "../DeployShieldApp";
import { isRepoOnboardingDone, loadSelectedRepos } from "../lib/onboardingStorage";
import ConnectGithubStep from "./ConnectGithubStep";
import RepoScopeStep from "./RepoScopeStep";

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
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-950 text-zinc-500">Loading…</div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-950 text-zinc-500">Session loading…</div>
    );
  }

  if (githubConn === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-950 text-zinc-500">
        Checking GitHub link…
      </div>
    );
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
