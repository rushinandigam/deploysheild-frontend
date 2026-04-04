import { useSignIn } from "@clerk/react/legacy";
import { type FormEvent, useState } from "react";

import { oauthRedirectUrls } from "../../lib/oauthPaths";
import { clerkMessage } from "./clerkErrors";
import GoogleMark from "./GoogleMark";

export default function CustomSignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!signIn || !setActive) return;
    setError(null);
    setBusy(true);
    try {
      await signIn.create({
        identifier: email.trim(),
        password,
      });

      if (signIn.status === "complete") {
        await setActive({ session: signIn.createdSessionId });
        return;
      }

      if (signIn.status === "needs_second_factor") {
        setError("This account uses an extra sign-in step. Complete it in Clerk’s account settings or use email without MFA for now.");
        return;
      }

      setError(`Sign-in not complete (status: ${signIn.status}). Try again or contact support.`);
    } catch (err) {
      setError(clerkMessage(err) || "Sign-in failed. Check your email and password.");
    } finally {
      setBusy(false);
    }
  }

  async function signInWithGoogle() {
    if (!signIn) return;
    setError(null);
    setBusy(true);
    try {
      const { callback, afterAuth } = oauthRedirectUrls();
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: callback,
        redirectUrlComplete: afterAuth,
      });
    } catch (err) {
      setError(clerkMessage(err));
      setBusy(false);
    }
  }

  if (!isLoaded) {
    return <p className="text-center text-sm text-zinc-500">Loading…</p>;
  }

  return (
    <div className="mt-6 space-y-4 text-left">
      {error && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
          {error}
        </div>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={() => void signInWithGoogle()}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-sm font-medium text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-800/80 disabled:cursor-not-allowed disabled:opacity-50">
        <GoogleMark />
        Continue with Google
      </button>
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wider">
          <span className="bg-zinc-950/60 px-2 text-zinc-500">or email</span>
        </div>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Email</label>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          placeholder="you@company.com"
        />
      </div>
      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Password</label>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
        {busy ? "Signing in…" : "Sign in"}
      </button>
      </form>
    </div>
  );
}
