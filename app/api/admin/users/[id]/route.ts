// app/api/admin/users/[id]/route.ts
// PATCH /api/admin/users/[id] — change a user's role (admin only).
import { ObjectId } from "mongodb"

import { requireAdmin } from "@/lib/admin-api"
import { db } from "@/lib/auth"

const ROLES = ["customer", "owner", "admin"] as const

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  if (!(await requireAdmin())) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = (await request.json().catch(() => null)) as {
    role?: unknown
  } | null
  const role = body?.role

  if (
    typeof role !== "string" ||
    !ROLES.includes(role as (typeof ROLES)[number])
  ) {
    return Response.json({ error: "Invalid role" }, { status: 400 })
  }

  // better-auth ids are stored as ObjectIds; fall back to the raw string
  // in case a custom id generator is ever configured.
  const _id = /^[0-9a-fA-F]{24}$/.test(id) ? new ObjectId(id) : id

  const result = await db
    .collection("user")
    .updateOne({ _id } as never, { $set: { role, updatedAt: new Date() } })

  if (result.matchedCount === 0) {
    return Response.json({ error: "User not found" }, { status: 404 })
  }

  return Response.json({ ok: true, role })
}
