import { STATUSES } from "./schema";

export type StageCount = { stage: string; count: number };
export type CompanyCount = { name: string; value: number };

export function computeStageCounts(
  prospects: { status: string }[]
): StageCount[] {
  const counts: Record<string, number> = {};
  for (const s of STATUSES) counts[s] = 0;
  for (const p of prospects) {
    if (counts[p.status] !== undefined) counts[p.status]++;
  }
  return STATUSES.map((s) => ({ stage: s, count: counts[s] }));
}

export function computeCompanyCounts(
  prospects: { companyName: string }[]
): CompanyCount[] {
  const counts: Record<string, number> = {};
  for (const p of prospects) {
    counts[p.companyName] = (counts[p.companyName] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));
}
