import { useSignUp } from "@clerk/react/legacy";
import { type FormEvent, useEffect, useState } from "react";

import AppBackdrop from "../ui/AppBackdrop";
import { Card, CardContent } from "../ui/Card";
import { inputFieldClass, labelClass } from "../ui/input-classes";
import Button from "../ui/Button";
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
      <div className="relative flex min-h-dvh items-center justify-center text-sm text-zinc-500">
        <AppBackdrop />
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
      </div>
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
      <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-12">
        <AppBackdrop />
        <Card glow className="w-full max-w-md">
          <CardContent>
            <h1 className="font-display text-xl font-semibold text-white">Finish sign-up</h1>
            <p className="mt-2 text-sm text-zinc-400">Your account needs a bit more information to continue.</p>
            {error && (
              <div className="mt-4 rounded-xl border border-rose-500/35 bg-rose-950/45 px-3.5 py-2.5 text-sm text-rose-100">
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
                      className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-600 bg-zinc-900 text-violet-600"
                      checked={formData[field] === "true"}
                      onChange={(ev) =>
                        setFormData((prev) => ({ ...prev, [field]: ev.target.checked ? "true" : "" }))
                      }
                    />
                    <span>{fieldLabel(field)}</span>
                  </label>
                ) : (
                  <div key={field}>
                    <label className={labelClass}>{fieldLabel(field)}</label>
                    <input
                      type={field === "password" ? "password" : "text"}
                      required
                      value={formData[field] ?? ""}
                      onChange={(ev) => setFormData((prev) => ({ ...prev, [field]: ev.target.value }))}
                      className={`mt-1.5 ${inputFieldClass}`}
                    />
                  </div>
                ),
              )}
              <div id="clerk-captcha" />
              <Button type="submit" variant="primary" disabled={busy} className="w-full py-3">
                {busy ? "Saving…" : "Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-4 text-zinc-400">
      <AppBackdrop />
      <div id="clerk-captcha" />
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
        <p className="text-sm text-zinc-500">Setting up your account…</p>
      </div>
    </div>
  );
}
