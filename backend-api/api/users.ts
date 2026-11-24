// backend-api/api/users.ts
// The Express API serves the admin-only users endpoint.
import { apiFetch } from "../client"
import type { AdminUser } from "../types"

export async function getUsers(): Promise<AdminUser[]> {
  const data = await apiFetch<{ users: AdminUser[] }>("/admin/users")
  return data.users
}
