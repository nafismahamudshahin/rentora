"use client"

// app/dashboard/all-rentals/page.tsx  (admin)

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DataTable, bdt } from "@/components/dashboard/data-table"
import type { Column } from "@/components/dashboard/data-table"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatusBadge } from "@/components/dashboard/status-badge"
import type { Tone } from "@/components/dashboard/status-badge"
import {
  BOOKING_TONE,
  bookingLabel,
} from "@/components/dashboard/booking-status"
import { btnDanger, btnPrimary } from "@/components/dashboard/styles"
import { formatDateRange } from "@/lib/format"
import { getRentals } from "@/backend-api/api/rentals"
import { updateRentalStatus } from "@/backend-api/action/rentals"
import type { BookingStatus, PaymentStatus } from "@/backend-api/types"
import { useAsync } from "@/hooks/use-async"

type Person = { name: string; email: string }

type Rental = {
  id: string
  customer: Person
  owner: Person
  equipment: string
  duration: string
  quantity: number
  amount: number
  payment: PaymentStatus
  status: BookingStatus
}

const PAYMENT_TONE: Record<PaymentStatus, Tone> = {
  Paid: "success",
  Pending: "warning",
  Refunded: "neutral",
  Failed: "danger",
}

function personCell(p: Person) {
  return (
    <span className="flex flex-col">
      <span className="font-semibold">{p.name}</span>
      <span className="text-xs text-stone-500">{p.email}</span>
    </span>
  )
}

const columns: Column<Rental>[] = [
  {
    header: "Customer Information",
    value: (r) => `${r.customer.name} ${r.customer.email}`,
    cell: (r) => personCell(r.customer),
  },
  {
    header: "Owner Information",
    value: (r) => `${r.owner.name} ${r.owner.email}`,
    cell: (r) => personCell(r.owner),
  },
  {
    header: "Equipment Name",
    value: (r) => r.equipment,
    className: "font-bold",
  },
  { header: "Rental Duration", value: (r) => r.duration },
  { header: "Quantity", value: (r) => r.quantity },
  {
    header: "Booking Amount",
    value: (r) => r.amount,
    cell: (r) => bdt(r.amount),
  },
  {
    header: "Payment Status",
    value: (r) => r.payment,
    cell: (r) => (
      <StatusBadge tone={PAYMENT_TONE[r.payment]}>{r.payment}</StatusBadge>
    ),
  },
  {
    header: "Booking Status",
    value: (r) => r.status,
    cell: (r) => (
      <StatusBadge tone={BOOKING_TONE[r.status]}>
        {bookingLabel(r.status, r.payment)}
      </StatusBadge>
    ),
  },
]

export default function AllRentalsPage() {
  const {
    data: rows = [],
    loading,
    error,
    setData,
    reload,
  } = useAsync(
    () =>
      getRentals().then((rentals) =>
        rentals.map((r) => ({
          id: r.id,
          customer: { name: r.customerName, email: r.customerEmail },
          owner: { name: r.ownerName, email: r.ownerEmail },
          equipment: r.equipment,
          duration: formatDateRange(r.startDate, r.endDate),
          quantity: r.quantity ?? 1,
          amount: r.amount,
          payment: r.paymentStatus,
          status: r.bookingStatus,
        }))
      ),
    []
  )
  const [pendingId, setPendingId] = useState<string | null>(null)

  async function update(
    id: string,
    status: "Active" | "Completed" | "Cancelled",
    message: string
  ) {
    setPendingId(id)
    try {
      await updateRentalStatus(id, status)
      setData((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
      toast.success(message)
    } catch {
      toast.error("Couldn't update the rental")
    } finally {
      setPendingId(null)
    }
  }

  return (
    <>
      <PageHeader
        title="All Rentals"
        description="Monitor and manage every rental across the platform."
      />
      <DataTable
        title="Rentals"
        rows={rows}
        columns={columns}
        searchPlaceholder="Search rentals"
        exportName="all-rentals"
        emptyTitle={
          loading
            ? "Loading rentals…"
            : error
              ? "Couldn't load rentals"
              : "No rentals yet"
        }
        emptyAction={
          error ? (
            <Button type="button" size="sm" variant="outline" onClick={reload}>
              Try again
            </Button>
          ) : null
        }
        actions={(r) => {
          if (r.status === "Pending") {
            return (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => update(r.id, "Cancelled", "Hold cancelled")}
                disabled={pendingId !== null}
                className={btnDanger}
              >
                Cancel hold
              </Button>
            )
          }
          if (r.status === "Active") {
            return (
              <>
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    update(r.id, "Completed", "Rental marked completed")
                  }
                  disabled={pendingId !== null}
                  className={btnPrimary}
                >
                  Complete
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => update(r.id, "Cancelled", "Rental cancelled")}
                  disabled={pendingId !== null}
                  className={btnDanger}
                >
                  Cancel
                </Button>
              </>
            )
          }
          return <span className="text-xs text-stone-500">—</span>
        }}
      />
    </>
  )
}
