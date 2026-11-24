// backend-api/api/earnings.ts
// Read: owner earnings chart and payouts.
import { apiFetch, query } from "../client"
import type { EarningsData } from "../types"

/** Monthly chart + payouts for one owner. */
export async function getEarnings(ownerId: string): Promise<EarningsData> {
  return apiFetch<EarningsData>(`/earnings${query({ ownerId })}`)
}
