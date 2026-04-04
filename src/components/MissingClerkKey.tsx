export default function MissingClerkKey() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        padding: 24,
        fontFamily: "system-ui, sans-serif",
        background: "#09090b",
        color: "#e4e4e7",
        lineHeight: 1.6,
      }}>
      <h1 style={{ fontSize: "1.25rem", marginBottom: 12 }}>Missing Clerk publishable key</h1>
      <p style={{ color: "#a1a1aa", maxWidth: 520 }}>
        Set <code style={{ color: "#c4b5fd" }}>VITE_CLERK_PUBLISHABLE_KEY</code> in{" "}
        <strong>deploysheild-frontend/.env</strong> or the monorepo root <strong>deploysheild/.env</strong>, then
        restart <code style={{ color: "#c4b5fd" }}>pnpm dev</code>.
      </p>
      <p style={{ color: "#71717a", marginTop: 16, fontSize: 14 }}>
        Vite loads <code>VITE_*</code> from the frontend folder and merges the parent folder so keys in either place
        work.
      </p>
    </div>
  );
}
