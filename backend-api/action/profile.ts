// backend-api/action/profile.ts
// Profile updates go through better-auth — this one is REAL.
import { authClient } from "@/lib/auth-client"
import type { ActionResult, ProfileUpdate } from "../types"

export type { ProfileUpdate } from "../types"

export async function updateProfile(
  input: ProfileUpdate
): Promise<ActionResult> {
  const { error } = await authClient.updateUser({
    name: input.name,
    image: input.image,
    phone: input.phone,
    address: input.address,
  })

  if (error) {
    return {
      ok: false,
      error: error.message ?? "Could not update your profile.",
    }
  }
  return { ok: true }
}
