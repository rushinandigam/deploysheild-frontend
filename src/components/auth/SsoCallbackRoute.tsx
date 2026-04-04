import { AuthenticateWithRedirectCallback } from "@clerk/react";

import { CONTINUE_SIGN_UP_PATH } from "../../lib/oauthPaths";

/**
 * Clerk redirects here after Google (or other OAuth). Completes session and sends user home
 * or to continue-sign-up if the instance requires extra fields.
 */
export default function SsoCallbackRoute() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-zinc-950 px-4 text-zinc-400">
      <AuthenticateWithRedirectCallback
        signInUrl="/"
        signUpUrl="/"
        continueSignUpUrl={CONTINUE_SIGN_UP_PATH}
      />
      <div id="clerk-captcha" />
      <p className="text-sm">Completing sign-in…</p>
    </div>
  );
}
