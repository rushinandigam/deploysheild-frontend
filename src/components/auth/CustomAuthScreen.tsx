import { useState } from "react";

import LogoMark from "../brand/LogoMark";
import AppBackdrop from "../ui/AppBackdrop";
import { Card, CardContent } from "../ui/Card";
import CustomSignInForm from "./CustomSignInForm";
import CustomSignUpForm from "./CustomSignUpForm";

type Mode = "sign-in" | "sign-up";

const features = [
  {
    title: "Release risk in one pass",
    body: "PRs, branches, and CI signals summarized before you ship.",
    icon: ChartIcon,
  },
  {
    title: "Your repos, your OAuth",
    body: "Clerk for identity; GitHub tokens stay on your backend.",
    icon: LockIcon,
  },
  {
    title: "Team decisions on record",
    body: "Proceed, hold, or review — captured next to each assessment.",
    icon: ClipboardIcon,
  },
];

export default function CustomAuthScreen() {
  const [mode, setMode] = useState<Mode>("sign-in");

  return (
    <div className="relative min-h-dvh text-zinc-100">
      <AppBackdrop />
      <div className="grid min-h-dvh lg:grid-cols-[1fr_min(28rem,100%)]">
        <aside className="relative hidden flex-col justify-between border-r border-white/[0.06] bg-zinc-950/20 px-12 py-14 lg:flex">
          <div>
            <div className="flex items-center gap-4">
              <LogoMark size="lg" />
              <div>
                <p className="font-display text-xl font-semibold tracking-tight text-white">DeployShield</p>
                <p className="text-sm text-zinc-500">Pre-deployment intelligence</p>
              </div>
            </div>
            <ul className="mt-14 space-y-8">
              {features.map((f) => (
                <li key={f.title} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-300">
                    <f.icon />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-100">{f.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-500">{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs leading-relaxed text-zinc-600">
            Built for teams who want signal before the deploy button — not another blocking gate.
          </p>
        </aside>

        <div className="flex flex-col items-center justify-center px-4 py-12 sm:px-8">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <LogoMark size="md" />
            <div className="text-left">
              <p className="font-display text-lg font-semibold text-white">DeployShield</p>
              <p className="text-xs text-zinc-500">Sign in to continue</p>
            </div>
          </div>

          <div className="w-full max-w-md">
            <Card glow className="shadow-black/50">
              <CardContent className="p-0">
                <div className="border-b border-white/[0.06] px-6 pb-1 pt-6 text-center lg:text-left">
                  <h1 className="font-display text-2xl font-semibold tracking-tight text-white">
                    {mode === "sign-in" ? "Welcome back" : "Create your workspace"}
                  </h1>
                  <p className="mt-2 text-sm text-zinc-500">
                    {mode === "sign-in"
                      ? "Sign in to run assessments and connect GitHub."
                      : "Set up your account, then authorize repositories."}
                  </p>
                </div>

                <div className="px-2 pt-4">
                  <div className="mx-4 flex rounded-xl border border-white/[0.06] bg-zinc-950/60 p-1">
                    <button
                      type="button"
                      onClick={() => setMode("sign-in")}
                      className={
                        mode === "sign-in"
                          ? "flex-1 rounded-lg bg-white/[0.1] py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-white/10"
                          : "flex-1 rounded-lg py-2.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-300"
                      }>
                      Sign in
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("sign-up")}
                      className={
                        mode === "sign-up"
                          ? "flex-1 rounded-lg bg-white/[0.1] py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-white/10"
                          : "flex-1 rounded-lg py-2.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-300"
                      }>
                      Create account
                    </button>
                  </div>
                </div>

                <div className="px-6 pb-8 pt-2">{mode === "sign-in" ? <CustomSignInForm /> : <CustomSignUpForm />}</div>
              </CardContent>
            </Card>

            <p className="mt-8 text-center text-xs leading-relaxed text-zinc-600">
              Secured by Clerk. GitHub access uses DeployShield&apos;s OAuth after you connect.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664M5.25 12.75h3.75m-3.75 3h3.75m-3.75 3h3.75m-3.75-9h3.75m0-3h3.75m-3.75 0h3.75"
      />
    </svg>
  );
}
