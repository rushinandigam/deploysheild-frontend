import { useSignUp } from "@clerk/react/legacy";
import { type FormEvent, useState } from "react";

import { oauthRedirectUrls } from "../../lib/oauthPaths";
import Button from "../ui/Button";
import { inputFieldClass, labelClass } from "../ui/input-classes";
import { clerkMessage } from "./clerkErrors";
import GoogleMark from "./GoogleMark";

export default function CustomSignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [step, setStep] = useState<"credentials" | "verify">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCredentials(e: FormEvent) {
    e.preventDefault();
    if (!signUp || !setActive) return;
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await signUp.create({
        emailAddress: email.trim(),
        password,
      });

      if (signUp.status === "complete") {
        await setActive({ session: signUp.createdSessionId });
        return;
      }

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err) {
      setError(clerkMessage(err) || "Could not create account.");
    } finally {
      setBusy(false);
    }
  }

  async function onVerify(e: FormEvent) {
    e.preventDefault();
    if (!signUp || !setActive) return;
    setError(null);
    setBusy(true);
    try {
      await signUp.attemptEmailAddressVerification({ code: code.trim() });
      if (signUp.status === "complete") {
        await setActive({ session: signUp.createdSessionId });
        return;
      }
      setError("Verification incomplete. Check the code and try again.");
    } catch (err) {
      setError(clerkMessage(err) || "Verification failed.");
    } finally {
      setBusy(false);
    }
  }

  async function signUpWithGoogle() {
    if (!signUp) return;
    setError(null);
    setBusy(true);
    try {
      const { callback, afterAuth } = oauthRedirectUrls();
      await signUp.authenticateWithRedirect({
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

  if (step === "verify") {
    return (
      <form onSubmit={onVerify} className="space-y-4 text-left">
        <p className="text-sm leading-relaxed text-zinc-400">
          Enter the verification code sent to <span className="font-medium text-violet-300">{email}</span>.
        </p>
        {error && (
          <div className="rounded-xl border border-rose-500/35 bg-rose-950/45 px-3.5 py-2.5 text-sm text-rose-100">
            {error}
          </div>
        )}
        <div>
          <label className={labelClass}>Code</label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={`mt-1.5 ${inputFieldClass}`}
            placeholder="123456"
          />
        </div>
        <Button type="submit" variant="primary" disabled={busy} className="w-full py-3">
          {busy ? "Verifying…" : "Verify & continue"}
        </Button>
        <button
          type="button"
          onClick={() => {
            setStep("credentials");
            setCode("");
            setError(null);
          }}
          className="w-full text-center text-xs font-medium text-zinc-500 transition hover:text-zinc-300">
          ← Back
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-4 text-left">
      <div id="clerk-captcha" className="empty:hidden" />
      {error && (
        <div className="rounded-xl border border-rose-500/35 bg-rose-950/45 px-3.5 py-2.5 text-sm text-rose-100">
          {error}
        </div>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={() => void signUpWithGoogle()}
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
      <form onSubmit={onCredentials} className="space-y-4">
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
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`mt-1.5 ${inputFieldClass}`}
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className={labelClass}>Confirm password</label>
          <input
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={`mt-1.5 ${inputFieldClass}`}
            placeholder="••••••••"
          />
        </div>
        <Button type="submit" variant="primary" disabled={busy} className="w-full py-3">
          {busy ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </div>
  );
}
