// backend-api/api/overview.ts
// The API computes the dashboard stats from the session's role and user id.
import { apiFetch } from "../client"
import type { Stat } from "../types"

export async function getOverview(): Promise<Stat[]> {
  return apiFetch<Stat[]>("/overview")
}
