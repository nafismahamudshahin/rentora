// backend-api/api/requests.ts
// Read: booking requests sent to an owner.
import { apiFetch, query } from "../client"
import type { RentalRequest } from "../types"

/** Booking requests sent to one owner. */
export async function getRequests(ownerId: string): Promise<RentalRequest[]> {
  return apiFetch<RentalRequest[]>(`/requests${query({ ownerId })}`)
}
