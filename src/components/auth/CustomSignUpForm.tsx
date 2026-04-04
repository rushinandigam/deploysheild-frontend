import { useSignUp } from "@clerk/react/legacy";
import { type FormEvent, useState } from "react";

function clerkMessage(err: unknown): string {
  if (err && typeof err === "object" && "errors" in err) {
    const first = (err as { errors?: { message?: string; longMessage?: string }[] }).errors?.[0];
    const m = first?.longMessage || first?.message;
    if (m) return m;
  }
  if (err instanceof Error) return err.message;
  return "Could not create account.";
}

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
      setError(clerkMessage(err));
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
      setError(clerkMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (!isLoaded) {
    return <p className="text-center text-sm text-zinc-500">Loading…</p>;
  }

  if (step === "verify") {
    return (
      <form onSubmit={onVerify} className="mt-6 space-y-4 text-left">
        <p className="text-sm text-zinc-400">
          Enter the verification code sent to <span className="text-zinc-200">{email}</span>.
        </p>
        {error && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
            {error}
          </div>
        )}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Code</label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            placeholder="123456"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
          {busy ? "Verifying…" : "Verify & continue"}
        </button>
        <button
          type="button"
          onClick={() => {
            setStep("credentials");
            setCode("");
            setError(null);
          }}
          className="w-full text-center text-xs text-zinc-500 hover:text-zinc-400">
            ← Back
          </button>
      </form>
    );
  }

  return (
    <form onSubmit={onCredentials} className="mt-6 space-y-4 text-left">
      <div id="clerk-captcha" className="empty:hidden" />
      {error && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
          {error}
        </div>
      )}
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
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          placeholder="••••••••"
        />
      </div>
      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Confirm password</label>
        <input
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
        {busy ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
