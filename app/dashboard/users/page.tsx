"use client"

// app/dashboard/users/page.tsx  (admin — change user roles)

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/dashboard/data-table"
import type { Column } from "@/components/dashboard/data-table"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatusBadge } from "@/components/dashboard/status-badge"
import type { Tone } from "@/components/dashboard/status-badge"
import {
  normalizeRole,
  ROLE_LABEL,
  type Role,
} from "@/components/dashboard/nav-config"
import { btnOutline } from "@/components/dashboard/styles"
import { authClient } from "@/lib/auth-client"
import { getUsers } from "@/backend-api/api/users"
import { changeUserRole } from "@/backend-api/action/users"
import { useAsync } from "@/hooks/use-async"

type User = {
  id: string
  name: string
  email: string
  role: Role
}

const ROLE_TONE: Record<Role, Tone> = {
  admin: "info",
  owner: "success",
  customer: "neutral",
}

const columns: Column<User>[] = [
  { header: "Name", value: (r) => r.name, className: "font-bold" },
  { header: "Email", value: (r) => r.email },
  {
    header: "Role",
    value: (r) => ROLE_LABEL[r.role],
    cell: (r) => (
      <StatusBadge tone={ROLE_TONE[r.role]}>{ROLE_LABEL[r.role]}</StatusBadge>
    ),
  },
]

export default function UsersPage() {
  const { data: session } = authClient.useSession()
  const me = session?.user?.id

  const {
    data: rows = [],
    loading,
    error,
    setData,
    reload,
  } = useAsync(
    () =>
      getUsers().then((users) =>
        users.map((u) => ({ ...u, role: normalizeRole(u.role) }))
      ),
    []
  )
  const [pendingId, setPendingId] = useState<string | null>(null)

  async function changeRole(id: string, role: Role) {
    setPendingId(id)
    try {
      const result = await changeUserRole(id, role)
      if (!result.ok) {
        toast.error(result.error ?? "Couldn't update the role")
        return
      }
      setData((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
      toast.success(`Role updated to ${ROLE_LABEL[role]}`)
    } catch {
      toast.error("Couldn't update the role")
    } finally {
      setPendingId(null)
    }
  }

  return (
    <>
      <PageHeader title="Users" description="Everyone on Rentora." />
      <DataTable
        title="Users"
        rows={rows}
        columns={columns}
        searchPlaceholder="Search users"
        exportName="users"
        emptyTitle={
          loading
            ? "Loading users…"
            : error
              ? "Couldn't load users"
              : "No users yet"
        }
        emptyAction={
          error ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={reload}
              className={btnOutline}
            >
              Try again
            </Button>
          ) : null
        }
        actions={(r) => {
          // The admin can't demote themselves — it would lock the platform.
          if (r.id === me) {
            return (
              <span
                className="text-xs text-stone-500"
                title="You can't change your own role"
              >
                —
              </span>
            )
          }
          return (
            <select
              value={r.role}
              disabled={pendingId !== null}
              aria-label={`Change role for ${r.name}`}
              onChange={(e) => changeRole(r.id, e.target.value as Role)}
              className="h-9 rounded-lg border border-stone-300 bg-white px-2 text-sm font-semibold"
            >
              {(Object.keys(ROLE_LABEL) as Role[]).map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABEL[role]}
                </option>
              ))}
            </select>
          )
        }}
      />
    </>
  )
}
