// backend-api/action/rentals.ts
// Write: customer cancel and admin status changes.
import { apiFetch, segment } from "../client"

/** Customer cancels one of their rentals. */
export async function cancelRental(id: string): Promise<void> {
  await apiFetch(`/rentals/${segment(id)}/cancel`, { method: "PATCH" })
}

/** Admin changes a rental to Active, Completed or Cancelled. */
export async function updateRentalStatus(
  id: string,
  status: "Active" | "Completed" | "Cancelled"
): Promise<void> {
  await apiFetch(`/rentals/${segment(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}
