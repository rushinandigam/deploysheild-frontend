export function clerkMessage(err: unknown): string {
  if (err && typeof err === "object" && "errors" in err) {
    const first = (err as { errors?: { message?: string; longMessage?: string }[] }).errors?.[0];
    const m = first?.longMessage || first?.message;
    if (m) return m;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong. Try again.";
}
