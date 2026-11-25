// backend-api/action/account.ts
// Self-service role choice during sign-up. The API only accepts customer/owner.
import { apiFetch } from "../client"
import type { ActionResult } from "../types"

export type SignUpRole = "customer" | "owner"

export async function setMyRole(role: SignUpRole): Promise<ActionResult> {
  try {
    await apiFetch("/me/role", {
      method: "POST",
      body: JSON.stringify({ role }),
    })
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not save your role",
    }
  }
}
