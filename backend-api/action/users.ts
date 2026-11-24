// backend-api/action/users.ts
// Admin changes another user's role (Express API, admin only).
import { apiFetch, segment } from "../client"
import type { ActionResult } from "../types"
import type { Role } from "@/components/dashboard/nav-config"

export async function changeUserRole(
  id: string,
  role: Role
): Promise<ActionResult> {
  try {
    await apiFetch(`/admin/users/${segment(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    })
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not update the role",
    }
  }
}
