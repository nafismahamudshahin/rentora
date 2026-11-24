// backend-api/api/listings.ts
// Read: one owner's equipment listings.
import { apiFetch, query } from "../client"
import type { Equipment } from "../types"

/** Equipment owned by one owner (owner "My Listings"). */
export async function getListings(ownerId: string): Promise<Equipment[]> {
  return apiFetch<Equipment[]>(`/listings${query({ ownerId })}`)
}
