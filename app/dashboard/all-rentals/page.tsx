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
import { cn } from "@/lib/utils"
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
    <span className="flex max-w-[220px] min-w-0 flex-col whitespace-normal">
      <span className="font-semibold break-words">{p.name}</span>
      <span className="text-xs break-all text-stone-500">{p.email}</span>
    </span>
  )
}

const columns: Column<Rental>[] = [
  {
    header: "Customer Information",
    value: (r) => `${r.customer.name} ${r.customer.email}`,
    cell: (r) => personCell(r.customer),
    className: "whitespace-normal",
  },
  {
    header: "Owner Information",
    value: (r) => `${r.owner.name} ${r.owner.email}`,
    cell: (r) => personCell(r.owner),
    className: "whitespace-normal",
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
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => update(r.id, "Cancelled", "Hold cancelled")}
                  disabled={pendingId !== null}
                  className={cn(btnDanger, "w-full justify-center sm:w-auto")}
                >
                  Cancel hold
                </Button>
              </div>
            )
          }
          if (r.status === "Active") {
            return (
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    update(r.id, "Completed", "Rental marked completed")
                  }
                  disabled={pendingId !== null}
                  className={cn(btnPrimary, "w-full justify-center sm:w-auto")}
                >
                  Complete
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => update(r.id, "Cancelled", "Rental cancelled")}
                  disabled={pendingId !== null}
                  className={cn(btnDanger, "w-full justify-center sm:w-auto")}
                >
                  Cancel
                </Button>
              </div>
            )
          }
          return <span className="text-xs text-stone-500">—</span>
        }}
      />
    </>
  )
}
