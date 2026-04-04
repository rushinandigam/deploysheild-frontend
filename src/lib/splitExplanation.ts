/**
 * Mirrors backend `app/api/routes/assessments.py` — LLM addendum is appended after this marker.
 * Keep in sync if the server string changes.
 */
const AI_ADDENDUM_MARKERS = [
  "\n\n---\nAI-assisted review (OpenAI — from change metadata and paths, not a full code audit):\n\n",
  "\n\n---\nAI-assisted review (OpenAI - from change metadata and paths, not a full code audit):\n\n",
] as const;

export function splitExplanation(raw: string): { rules: string; ai: string | null } {
  const text = raw ?? "";
  for (const marker of AI_ADDENDUM_MARKERS) {
    const i = text.indexOf(marker);
    if (i !== -1) {
      return {
        rules: text.slice(0, i).trim(),
        ai: text.slice(i + marker.length).trim(),
      };
    }
  }
  return { rules: text.trim(), ai: null };
}
