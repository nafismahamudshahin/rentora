// backend-api/action/requests.ts
// Write: owner accept/decline a booking request.
import { apiFetch, segment } from "../client"
import type { RequestStatus } from "../types"

/** Owner accepts or declines a booking request. */
export async function respondToRequest(
  id: string,
  status: RequestStatus
): Promise<void> {
  await apiFetch(`/requests/${segment(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}
