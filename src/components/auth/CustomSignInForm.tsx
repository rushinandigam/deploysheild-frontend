import { useSignIn } from "@clerk/react/legacy";
import { type FormEvent, useState } from "react";

import { oauthRedirectUrls } from "../../lib/oauthPaths";
import Button from "../ui/Button";
import { inputFieldClass, labelClass } from "../ui/input-classes";
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
        setError(
          "This account uses an extra sign-in step. Complete it in Clerk’s account settings or use email without MFA for now.",
        );
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
    return <p className="py-4 text-center text-sm text-zinc-500">Loading…</p>;
  }

  return (
    <div className="space-y-4 text-left">
      {error && (
        <div className="rounded-xl border border-rose-500/35 bg-rose-950/45 px-3.5 py-2.5 text-sm text-rose-100">
          {error}
        </div>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={() => void signInWithGoogle()}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-100 shadow-inner shadow-black/20 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50">
        <GoogleMark />
        Continue with Google
      </button>
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-white/[0.08]" />
        </div>
        <div className="relative flex justify-center text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
          <span className="bg-zinc-950/90 px-3">or email</span>
        </div>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-1.5 ${inputFieldClass}`}
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label className={labelClass}>Password</label>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`mt-1.5 ${inputFieldClass}`}
            placeholder="••••••••"
          />
        </div>
        <Button type="submit" variant="primary" disabled={busy} className="w-full py-3">
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
