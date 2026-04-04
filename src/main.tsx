import { ClerkProvider } from "@clerk/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import MissingClerkKey from "./components/MissingClerkKey.tsx";

const rootEl = document.getElementById("root")!;
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? "";

if (!clerkPublishableKey.trim()) {
  createRoot(rootEl).render(<MissingClerkKey />);
} else {
  createRoot(rootEl).render(
    <StrictMode>
      <ClerkProvider publishableKey={clerkPublishableKey} afterSignOutUrl="/">
        <App />
      </ClerkProvider>
    </StrictMode>,
  );
}
