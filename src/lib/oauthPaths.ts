/** Paths used by Clerk OAuth redirect flow (must match Clerk Dashboard → allowed redirect URLs). */
export const SSO_CALLBACK_PATH = "/sso-callback";
export const CONTINUE_SIGN_UP_PATH = "/continue-sign-up";

export function oauthRedirectUrls() {
  if (typeof window === "undefined") {
    return { callback: SSO_CALLBACK_PATH, afterAuth: "/" };
  }
  const origin = window.location.origin;
  return {
    callback: `${origin}${SSO_CALLBACK_PATH}`,
    afterAuth: `${origin}/`,
  };
}
