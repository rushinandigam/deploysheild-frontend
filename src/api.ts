const apiBase =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

async function parseError(res: Response): Promise<string> {
  try {
    const j = await res.json();
    if (typeof j?.detail === "string") return j.detail;
    if (Array.isArray(j?.detail)) return j.detail.map((d: { msg?: string }) => d.msg).join("; ");
    return JSON.stringify(j);
  } catch {
    return await res.text();
  }
}

export type Assessment = {
  id: number;
  pr_url: string | null;
  repo_full_name: string;
  commit_sha: string | null;
  branch: string | null;
  service_name: string | null;
  source: string;
  signals: Record<string, unknown>;
  risk_score: number;
  risk_level: string;
  failure_probability: number;
  recommendation: string;
  explanation: string;
  created_at: string;
};

export type AssessmentSummary = Pick<
  Assessment,
  "id" | "repo_full_name" | "risk_score" | "risk_level" | "recommendation" | "created_at"
>;

export type AnalyticsSummary = {
  total_assessments: number;
  avg_risk_score: number;
  by_level: Record<string, number>;
  recent_high_risk: number;
};

export type ServiceRiskRow = {
  repo_full_name: string;
  assessment_count: number;
  avg_risk_score: number;
  last_assessment_at: string | null;
};

export async function analyzeRelease(body: {
  pr_url?: string;
  repo_full_name?: string;
  commit_sha?: string;
  branch?: string;
  base_branch?: string;
  service_name?: string;
}): Promise<Assessment> {
  const res = await fetch(`${apiBase}/api/v1/assessments/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function listAssessments(limit = 50): Promise<AssessmentSummary[]> {
  const res = await fetch(`${apiBase}/api/v1/assessments?limit=${limit}`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getAssessment(id: number): Promise<Assessment> {
  const res = await fetch(`${apiBase}/api/v1/assessments/${id}`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function recordDecision(
  assessmentId: number,
  body: { decision: "proceed" | "hold" | "review"; notes?: string; decided_by?: string },
) {
  const res = await fetch(`${apiBase}/api/v1/assessments/${assessmentId}/decisions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  const res = await fetch(`${apiBase}/api/v1/assessments/analytics/summary`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function fetchServiceRisk(limit = 20): Promise<ServiceRiskRow[]> {
  const res = await fetch(`${apiBase}/api/v1/assessments/analytics/services?limit=${limit}`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function checkHealth(): Promise<{ status: string }> {
  const res = await fetch(`${apiBase}/health`);
  if (!res.ok) throw new Error("health check failed");
  return res.json();
}

export { apiBase };
