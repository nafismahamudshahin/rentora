// backend-api/action/listings.ts
// Write: owner hide/show/delete listing actions.
import { apiFetch, segment } from "../client"

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
