// lib/admin-api.ts
// Shared guard for admin-only route handlers.
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

/**
 * Returns the caller's session when they are an admin, otherwise null.
 * Use it at the top of an admin route handler:
 *
 *   if (!(await requireAdmin())) {
 *     return Response.json({ error: "Forbidden" }, { status: 403 })
 *   }
 */
export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== "admin") return null
  return session
}
