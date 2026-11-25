"use client"

// app/dashboard/listings/page.tsx  (owner)

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DataTable, bdt } from "@/components/dashboard/data-table"
import type { Column } from "@/components/dashboard/data-table"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatusBadge } from "@/components/dashboard/status-badge"
import type { Tone } from "@/components/dashboard/status-badge"
import {
  btnDanger,
  btnOutline,
  btnPrimary,
} from "@/components/dashboard/styles"
import { authClient } from "@/lib/auth-client"
import { getListings } from "@/backend-api/api/listings"
import { deleteListing, setListingHidden } from "@/backend-api/action/listings"
import type { Equipment, ListingStatus } from "@/backend-api/types"
import { useAsync } from "@/hooks/use-async"

const TONE: Record<ListingStatus, Tone> = {
  Available: "success",
  Rented: "info",
  Hidden: "neutral",
}

const columns: Column<Equipment>[] = [
  { header: "Equipment", value: (r) => r.name, className: "font-bold" },
  { header: "Category", value: (r) => r.category },
  {
    header: "Price",
    value: (r) => r.pricePerDay,
    cell: (r) => `${bdt(r.pricePerDay)} / day`,
  },
  { header: "Quantity", value: (r) => r.availableQuantity ?? 1 },
  {
    header: "Status",
    value: (r) => r.status,
    cell: (r) => <StatusBadge tone={TONE[r.status]}>{r.status}</StatusBadge>,
  },
  {
    header: "Review",
    value: (r) => r.reviewStatus,
    cell: (r) => (
      <StatusBadge
        tone={
          r.reviewStatus === "Approved"
            ? "success"
            : r.reviewStatus === "Rejected"
              ? "danger"
              : "warning"
        }
      >
        {r.reviewStatus}
      </StatusBadge>
    ),
  },
]

export default function ListingsPage() {
  const { data: session } = authClient.useSession()
  const ownerId = session?.user?.id

  const {
    data: rows = [],
    loading,
    error,
    setData,
    reload,
  } = useAsync(
    () => (ownerId ? getListings(ownerId) : Promise.resolve([])),
    [ownerId]
  )
  const [pendingId, setPendingId] = useState<string | null>(null)

  async function toggleHidden(item: Equipment) {
    const hidden = item.status !== "Hidden"
    setPendingId(item.id)
    try {
      await setListingHidden(item.id, hidden)
      setData((prev) =>
        prev.map((r) =>
          r.id === item.id
            ? { ...r, status: hidden ? "Hidden" : "Available" }
            : r
        )
      )
    } catch {
      toast.error("Couldn't update the listing")
    } finally {
      setPendingId(null)
    }
  }

  async function remove(id: string) {
    setPendingId(id)
    try {
      await deleteListing(id)
      setData((prev) => prev.filter((r) => r.id !== id))
      toast.success("Listing deleted")
    } catch {
      toast.error("Couldn't delete the listing")
    } finally {
      setPendingId(null)
    }
  }

  return (
    <>
      <PageHeader
        title="My Listings"
        description="Equipment you offer for rent."
        actions={
          <Button
            render={<Link href="/dashboard/add-equipment" />}
            nativeButton={false}
            className={`h-10 px-5 ${btnPrimary}`}
          >
            Add equipment
          </Button>
        }
      />
      <DataTable
        title="Listings"
        rows={rows}
        columns={columns}
        exportName="listings"
        emptyTitle={
          loading
            ? "Loading listings…"
            : error
              ? "Couldn't load listings"
              : "You haven't listed any equipment"
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
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={r.status === "Rented" || pendingId !== null}
              onClick={() => toggleHidden(r)}
              className={btnOutline}
            >
              {r.status === "Hidden" ? "Show" : "Hide"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={r.status === "Rented" || pendingId !== null}
              onClick={() => remove(r.id)}
              className={btnDanger}
            >
              Delete
            </Button>
          </>
        )}
      />
    </>
  )
}
