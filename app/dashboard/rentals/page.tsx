"use client"

// app/dashboard/rentals/page.tsx  (customer)

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DataTable, bdt } from "@/components/dashboard/data-table"
import type { Column } from "@/components/dashboard/data-table"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatusBadge } from "@/components/dashboard/status-badge"
import type { Tone } from "@/components/dashboard/status-badge"
import { btnDanger, btnPrimary } from "@/components/dashboard/styles"
import { authClient } from "@/lib/auth-client"
import { normalizeRole } from "@/components/dashboard/nav-config"
import { formatDate } from "@/lib/format"
import { getRentals, getRentalsByCustomer } from "@/backend-api/api/rentals"
import { cancelRental } from "@/backend-api/action/rentals"
import type { BookingStatus, PaymentStatus } from "@/backend-api/types"
import { useAsync } from "@/hooks/use-async"

type Rental = {
  id: string
  equipment: string
  startDate: string
  endDate: string
  bookingDate: string
  total: number
  payment: PaymentStatus
  status: BookingStatus
}

const BOOKING_TONE: Record<BookingStatus, Tone> = {
  Pending: "warning",
  Active: "info",
  Completed: "success",
  Cancelled: "danger",
}

const PAYMENT_TONE: Record<PaymentStatus, Tone> = {
  Paid: "success",
  Pending: "warning",
  Refunded: "neutral",
  Failed: "danger",
}

const columns: Column<Rental>[] = [
  {
    header: "Equipment Name",
    value: (r) => r.equipment,
    className: "font-bold",
  },
  { header: "Rental Start Date", value: (r) => r.startDate },
  { header: "Rental End Date", value: (r) => r.endDate },
  { header: "Booking Date", value: (r) => r.bookingDate },
  { header: "Total Amount", value: (r) => r.total, cell: (r) => bdt(r.total) },
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
      <StatusBadge tone={BOOKING_TONE[r.status]}>{r.status}</StatusBadge>
    ),
  },
]

export default function RentalsPage() {
  const { data: session } = authClient.useSession()
  const customerId = session?.user?.id
  const role = normalizeRole(
    (session?.user as { role?: string | null } | undefined)?.role
  )

  const toRows = (rentals: Awaited<ReturnType<typeof getRentals>>) =>
    rentals.map((r) => ({
      id: r.id,
      equipment: r.equipment,
      startDate: formatDate(r.startDate),
      endDate: formatDate(r.endDate),
      bookingDate: formatDate(r.bookingDate),
      total: r.amount,
      payment: r.paymentStatus,
      status: r.bookingStatus,
    }))

  const {
    data: rows = [],
    loading,
    error,
    setData,
    reload,
  } = useAsync(
    () => {
      // The API already scopes owners to their listings and admins to all rows.
      if (role !== "customer") return getRentals().then(toRows)
      return customerId ? getRentalsByCustomer(customerId).then(toRows) : Promise.resolve([])
    },
    [customerId, role]
  )
  const [pendingId, setPendingId] = useState<string | null>(null)

  async function cancel(id: string) {
    setPendingId(id)
    try {
      await cancelRental(id)
      setData((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "Cancelled" } : r))
      )
      toast.success("Rental cancelled")
    } catch {
      toast.error("Couldn't cancel the rental")
    } finally {
      setPendingId(null)
    }
  }

  return (
    <>
      <PageHeader
        title={role === "admin" ? "All Rentals" : role === "owner" ? "My Bookings" : "My Rentals"}
        description={
          role === "admin"
            ? "Every booking on Rentora."
            : role === "owner"
              ? "Bookings made for your equipment."
              : "Everything you've booked."
        }
      />
      <DataTable
        title="Rentals"
        rows={rows}
        columns={columns}
        exportName="rentals"
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
          ) : !loading ? (
            <Button
              render={<Link href="/equipment" />}
              nativeButton={false}
              size="sm"
              className={btnPrimary}
            >
              Browse equipment
            </Button>
          ) : null
        }
        actions={(r) =>
          r.status === "Pending" ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pendingId !== null}
              onClick={() => cancel(r.id)}
              className={btnDanger}
            >
              Cancel
            </Button>
          ) : null
        }
      />
    </>
  )
}
