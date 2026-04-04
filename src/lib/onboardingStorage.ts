const repoKey = (userId: string) => `deploysheild:repoScope:${userId}`;
const doneKey = (userId: string) => `deploysheild:repoOnboardingDone:${userId}`;

export function loadSelectedRepos(userId: string): string[] {
  try {
    const raw = localStorage.getItem(repoKey(userId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string" && x.includes("/"))
      : [];
  } catch {
    return [];
  }
}

export function saveSelectedRepos(userId: string, names: string[]) {
  localStorage.setItem(repoKey(userId), JSON.stringify(names));
}

export function isRepoOnboardingDone(userId: string): boolean {
  return localStorage.getItem(doneKey(userId)) === "1";
}

export function setRepoOnboardingDone(userId: string) {
  localStorage.setItem(doneKey(userId), "1");
}
