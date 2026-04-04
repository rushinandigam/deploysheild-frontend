import { Show } from "@clerk/react";
import { useSyncExternalStore } from "react";

import AuthenticatedApp from "./components/AuthenticatedApp";
import ContinueSignUpRoute from "./components/auth/ContinueSignUpRoute";
import SsoCallbackRoute from "./components/auth/SsoCallbackRoute";
import LandingAuth from "./components/LandingAuth";
import { CONTINUE_SIGN_UP_PATH, SSO_CALLBACK_PATH } from "./lib/oauthPaths";

function subscribePath(cb: () => void) {
  window.addEventListener("popstate", cb);
  return () => window.removeEventListener("popstate", cb);
}

function getPath() {
  return window.location.pathname;
}

function usePathname() {
  return useSyncExternalStore(subscribePath, getPath, () => "/");
}

export default function App() {
  const path = usePathname();

  if (path === SSO_CALLBACK_PATH) {
    return <SsoCallbackRoute />;
  }
  if (path === CONTINUE_SIGN_UP_PATH) {
    return <ContinueSignUpRoute />;
  }

  return (
    <>
      <Show when="signed-out">
        <LandingAuth />
      </Show>
      <Show when="signed-in">
        <AuthenticatedApp />
      </Show>
    </>
  );
}
