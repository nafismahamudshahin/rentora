// backend-api/action/listings.ts
// Write: owner hide/show/delete listing actions.
import { apiFetch, segment } from "../client"
import type { Equipment, EquipmentUpdate } from "../types"

/** Owner edits an existing listing. The API returns the updated row. */
export async function updateListing(
  id: string,
  input: EquipmentUpdate
): Promise<Equipment> {
  return apiFetch<Equipment>(`/equipment/${segment(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  })
}

/** Owner hides or shows a listing. */
export async function setListingHidden(
  id: string,
  hidden: boolean
): Promise<void> {
  await apiFetch(`/equipment/${segment(id)}/visibility`, {
    method: "PATCH",
    body: JSON.stringify({ hidden }),
  })
}

/** Owner deletes a listing. */
export async function deleteListing(id: string): Promise<void> {
  await apiFetch(`/equipment/${segment(id)}`, { method: "DELETE" })
}
