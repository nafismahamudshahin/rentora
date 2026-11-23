// backend-api/api/favorites.ts
// Read: customer favorites joined with equipment.
import { apiFetch, query } from "../client"
import type { FavoriteItem } from "../types"

/** A customer's favorites, joined with the equipment data. */
export async function getFavorites(
  customerId: string
): Promise<FavoriteItem[]> {
  return apiFetch<FavoriteItem[]>(`/favorites${query({ customerId })}`)
}
