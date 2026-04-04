import { useSignUp } from "@clerk/react/legacy";
import { type FormEvent, useEffect, useState } from "react";

import { clerkMessage } from "./clerkErrors";

function fieldLabel(field: string): string {
  const labels: Record<string, string> = {
    first_name: "First name",
    last_name: "Last name",
    legal_accepted: "I agree to the terms and privacy policy",
    password: "Password",
    username: "Username",
    email_address: "Email",
    phone_number: "Phone number",
  };
  return labels[field] ?? field.replace(/_/g, " ");
}

function isFormField(field: string): boolean {
  return !field.startsWith("oauth_") && !field.startsWith("enterprise_sso");
}

function buildSignUpUpdate(missingFields: string[], formData: Record<string, string>): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  for (const field of missingFields) {
    if (!isFormField(field)) continue;
    const raw = formData[field] ?? "";
    if (field === "first_name") patch.firstName = raw;
    else if (field === "last_name") patch.lastName = raw;
    else if (field === "legal_accepted") patch.legalAccepted = raw === "true";
    else if (field === "password") patch.password = raw;
    else if (field === "username") patch.username = raw;
    else if (field === "email_address") patch.emailAddress = raw;
    else if (field === "phone_number") patch.phoneNumber = raw;
    else {
      const camel = field.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
      patch[camel] = raw;
    }
  }
  return patch;
}

/**
 * After OAuth sign-up, Clerk may require extra fields (name, legal, etc.). This page collects them.
 */
export default function ContinueSignUpRoute() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!signUp?.id) {
      window.location.replace("/");
    }
  }, [isLoaded, signUp?.id]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-950 text-sm text-zinc-500">Loading…</div>
    );
  }

  if (!signUp?.id) {
    return null;
  }

  const status = signUp.status;
  const missingFields = (signUp.missingFields ?? []).filter(isFormField);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!signUp || !setActive) return;
    setError(null);
    setBusy(true);
    try {
      const patch = buildSignUpUpdate(missingFields, formData);
      await signUp.update(patch as Parameters<typeof signUp.update>[0]);
      if (signUp.status === "complete" && signUp.createdSessionId) {
        await setActive({ session: signUp.createdSessionId });
        window.location.replace("/");
        return;
      }
      if (signUp.status !== "missing_requirements") {
        setError("Could not finish sign-up. Try again or use another method.");
      }
    } catch (err) {
      setError(clerkMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (status === "complete") {
    window.location.replace("/");
    return null;
  }

  if (status === "missing_requirements" && missingFields.length > 0) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-zinc-950 px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-zinc-800/80 bg-zinc-950/60 px-6 py-8">
          <h1 className="font-[Instrument_Sans,sans-serif] text-xl font-semibold text-white">Finish sign-up</h1>
          <p className="mt-2 text-sm text-zinc-400">Your account needs a bit more information to continue.</p>
          {error && (
            <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
              {error}
            </div>
          )}
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {missingFields.map((field) =>
              field === "legal_accepted" ? (
                <label
                  key={field}
                  className="flex cursor-pointer items-start gap-3 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-600 bg-zinc-900"
                    checked={formData[field] === "true"}
                    onChange={(ev) =>
                      setFormData((prev) => ({ ...prev, [field]: ev.target.checked ? "true" : "" }))
                    }
                  />
                  <span>{fieldLabel(field)}</span>
                </label>
              ) : (
                <div key={field}>
                  <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
                    {fieldLabel(field)}
                  </label>
                  <input
                    type={field === "password" ? "password" : "text"}
                    required
                    value={formData[field] ?? ""}
                    onChange={(ev) => setFormData((prev) => ({ ...prev, [field]: ev.target.value }))}
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              ),
            )}
            <div id="clerk-captcha" />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
              {busy ? "Saving…" : "Continue"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-zinc-950 text-zinc-400">
      <div id="clerk-captcha" />
      <p className="text-sm">Setting up your account…</p>
    </div>
  );
}
