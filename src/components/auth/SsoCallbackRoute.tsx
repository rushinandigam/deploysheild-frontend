import { AuthenticateWithRedirectCallback } from "@clerk/react";

import { CONTINUE_SIGN_UP_PATH } from "../../lib/oauthPaths";
import AppBackdrop from "../ui/AppBackdrop";

/**
 * Clerk redirects here after Google (or other OAuth). Completes session and sends user home
 * or to continue-sign-up if the instance requires extra fields.
 */
export default function SsoCallbackRoute() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-zinc-400">
      <AppBackdrop />
      <AuthenticateWithRedirectCallback
        signInUrl="/"
        signUpUrl="/"
        continueSignUpUrl={CONTINUE_SIGN_UP_PATH}
      />
      <div id="clerk-captcha" />
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
        <p className="text-sm text-zinc-500">Completing sign-in…</p>
      </div>
    </div>
  );
}
