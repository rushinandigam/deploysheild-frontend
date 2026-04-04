import { Show } from "@clerk/react";

import AuthenticatedApp from "./components/AuthenticatedApp";
import LandingAuth from "./components/LandingAuth";

export default function App() {
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
