import { useState } from "react";

import CustomSignInForm from "./CustomSignInForm";
import CustomSignUpForm from "./CustomSignUpForm";

type Mode = "sign-in" | "sign-up";

export default function CustomAuthScreen() {
  const [mode, setMode] = useState<Mode>("sign-in");

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-900/40">
            <span className="font-[Instrument_Sans,sans-serif] text-2xl font-semibold text-white">DS</span>
          </div>
          <h1 className="mt-8 font-[Instrument_Sans,sans-serif] text-3xl font-semibold tracking-tight text-white">
            DeployShield
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            Pre-deployment risk signals — connect GitHub after you sign in, then choose repo scope.
          </p>
        </div>

        <div className="mt-8 flex rounded-xl border border-zinc-800 bg-zinc-900/30 p-1">
          <button
            type="button"
            onClick={() => setMode("sign-in")}
            className={
              mode === "sign-in"
                ? "flex-1 rounded-lg bg-zinc-800 py-2.5 text-sm font-semibold text-white shadow"
                : "flex-1 rounded-lg py-2.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-300"
            }>
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("sign-up")}
            className={
              mode === "sign-up"
                ? "flex-1 rounded-lg bg-zinc-800 py-2.5 text-sm font-semibold text-white shadow"
                : "flex-1 rounded-lg py-2.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-300"
            }>
            Create account
          </button>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 px-6 pb-8 pt-2">
          {mode === "sign-in" ? <CustomSignInForm /> : <CustomSignUpForm />}
        </div>

        <p className="mt-8 text-center text-xs text-zinc-600">
          Secured by Clerk — your password never touches our API. GitHub access uses tokens Clerk stores after you
          connect your account.
        </p>
      </div>
    </div>
  );
}
