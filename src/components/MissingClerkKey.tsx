import { Card, CardContent, CardDescription, CardTitle } from "./ui/Card";
import AppBackdrop from "./ui/AppBackdrop";

export default function MissingClerkKey() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center px-4 py-12 text-zinc-100">
      <AppBackdrop />
      <Card className="max-w-lg" glow>
        <CardContent>
          <CardTitle>Missing Clerk publishable key</CardTitle>
          <CardDescription className="mt-3 text-zinc-400">
            Set <code className="rounded-md bg-violet-500/15 px-1.5 py-0.5 text-violet-200">VITE_CLERK_PUBLISHABLE_KEY</code>{" "}
            in <strong className="text-zinc-300">deploysheild-frontend/.env</strong> or the monorepo root{" "}
            <strong className="text-zinc-300">deploysheild/.env</strong>, then restart{" "}
            <code className="rounded-md bg-zinc-900 px-1.5 py-0.5 text-zinc-400">pnpm dev</code>.
          </CardDescription>
          <p className="mt-4 text-sm text-zinc-600">
            Vite loads <code className="text-zinc-500">VITE_*</code> from the frontend folder and merges the parent
            folder.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
