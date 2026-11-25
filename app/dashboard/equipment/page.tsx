"use client"

// app/dashboard/equipment/page.tsx  (admin)

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DataTable, bdt } from "@/components/dashboard/data-table"
import type { Column } from "@/components/dashboard/data-table"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { btnDanger, btnPrimary } from "@/components/dashboard/styles"
import { getAdminEquipment } from "@/backend-api/api/equipment"
import {
  approveEquipment,
  rejectEquipment,
  removeEquipment,
} from "@/backend-api/action/equipment"
import type { Equipment } from "@/backend-api/types"
import { useAsync } from "@/hooks/use-async"

const REVIEW_TONE = {
  Approved: "success",
  "Pending review": "warning",
  Rejected: "danger",
} as const

const columns: Column<Equipment>[] = [
  { header: "Equipment", value: (r) => r.name, className: "font-bold" },
  { header: "Owner", value: (r) => r.ownerName },
  { header: "Category", value: (r) => r.category },
  {
    header: "Price",
    value: (r) => r.pricePerDay,
    cell: (r) => `${bdt(r.pricePerDay)} / day`,
  },
  { header: "Quantity", value: (r) => r.availableQuantity ?? 1 },
  {
    header: "Status",
    value: (r) => r.reviewStatus,
    cell: (r) => (
      <StatusBadge tone={REVIEW_TONE[r.reviewStatus] ?? "warning"}>
        {r.reviewStatus}
      </StatusBadge>
    ),
  },
]

export default function AdminEquipmentPage() {
  const {
    data: rows = [],
    loading,
    error,
    setData,
    reload,
  } = useAsync(() => getAdminEquipment(), [])
  const [pendingId, setPendingId] = useState<string | null>(null)

  async function reject(id: string) {
    setPendingId(id)
    try {
      await rejectEquipment(id)
      setData((prev) =>
        prev.map((r) => (r.id === id ? { ...r, reviewStatus: "Rejected" } : r))
      )
      toast.success("Equipment rejected — it is hidden from public pages")
    } catch {
      toast.error("Couldn't reject the equipment")
    } finally {
      setPendingId(null)
    }
  }

  async function approve(id: string) {
    setPendingId(id)
    try {
      await approveEquipment(id)
      setData((prev) =>
        prev.map((r) => (r.id === id ? { ...r, reviewStatus: "Approved" } : r))
      )
      toast.success("Equipment approved")
    } catch {
      toast.error("Couldn't approve the equipment")
    } finally {
      setPendingId(null)
    }
  }

  async function remove(id: string) {
    setPendingId(id)
    try {
      await removeEquipment(id)
      setData((prev) => prev.filter((r) => r.id !== id))
      toast.success("Equipment removed")
    } catch {
      toast.error("Couldn't remove the equipment")
    } finally {
      setPendingId(null)
    }
  }

  return (
    <>
      <PageHeader
        title="All Equipment"
        description="Review and manage every listing."
      />
      <DataTable
        title="Equipment"
        rows={rows}
        columns={columns}
        searchPlaceholder="Search equipment"
        exportName="equipment"
        emptyTitle={
          loading
            ? "Loading equipment…"
            : error
              ? "Couldn't load equipment"
              : "No equipment yet"
        }
        emptyAction={
          error ? (
            <Button type="button" size="sm" variant="outline" onClick={reload}>
              Try again
            </Button>
          ) : null
        }
        actions={(r) => (
          <>
            {r.reviewStatus !== "Approved" && (
              <Button
                type="button"
                size="sm"
                onClick={() => approve(r.id)}
                disabled={pendingId !== null}
                className={btnPrimary}
              >
                Approve
              </Button>
            )}
            {r.reviewStatus !== "Rejected" && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => reject(r.id)}
                disabled={pendingId !== null}
              >
                Reject
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => remove(r.id)}
              disabled={pendingId !== null}
              className={btnDanger}
            >
              Remove
            </Button>
          </>
        )}
      />
    </>
  )
}
