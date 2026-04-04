import { useSignIn } from "@clerk/react/legacy";
import { type FormEvent, useState } from "react";

function clerkMessage(err: unknown): string {
  if (err && typeof err === "object" && "errors" in err) {
    const first = (err as { errors?: { message?: string; longMessage?: string }[] }).errors?.[0];
    const m = first?.longMessage || first?.message;
    if (m) return m;
  }
  if (err instanceof Error) return err.message;
  return "Sign-in failed. Check your email and password.";
}

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
      setError(clerkMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (!isLoaded) {
    return <p className="text-center text-sm text-zinc-500">Loading…</p>;
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4 text-left">
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
  );
}
