// backend-api/action/favorites.ts
// Write: add/remove customer favorites.
import { apiFetch, segment } from "../client"
import type { FavoriteRecord } from "../types"

/** Save one equipment and return the favorite row (its `id` is used to remove it). */
export async function addFavorite(
  equipmentId: string
): Promise<FavoriteRecord> {
  return apiFetch<FavoriteRecord>("/favorites", {
    method: "POST",
    body: JSON.stringify({ equipmentId }),
  })
}

/** Remove one equipment from a customer's favorites. */
export async function removeFavorite(id: string): Promise<void> {
  await apiFetch(`/favorites/${segment(id)}`, { method: "DELETE" })
}
