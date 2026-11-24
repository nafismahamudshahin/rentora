// app/api/admin/users/route.ts
// GET /api/admin/users — list every user (admin only).
import { requireAdmin } from "@/lib/admin-api"
import { db } from "@/lib/auth"

export async function GET() {
  if (!(await requireAdmin())) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const docs = await db
    .collection("user")
    .find(
      {},
      { projection: { name: 1, email: 1, image: 1, role: 1, createdAt: 1 } }
    )
    .sort({ createdAt: -1 })
    .toArray()

  return Response.json({
    users: docs.map((u) => ({
      id: String(u._id),
      name: (u.name as string) ?? "",
      email: (u.email as string) ?? "",
      image: (u.image as string | null) ?? null,
      role: typeof u.role === "string" && u.role ? u.role : "customer", // users created before the field existed
      createdAt: u.createdAt ?? null,
    })),
  })
}
