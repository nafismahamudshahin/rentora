"use client"

// app/dashboard/bookings/page.tsx  (admin)

import { DataTable, bdt } from "@/components/dashboard/data-table"
import type { Column } from "@/components/dashboard/data-table"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatusBadge } from "@/components/dashboard/status-badge"
import type { Tone } from "@/components/dashboard/status-badge"
import { Button } from "@/components/ui/button"
import { formatDateShort } from "@/lib/format"
import { getBookings } from "@/backend-api/api/bookings"
import type { BookingStatus } from "@/backend-api/types"
import { useAsync } from "@/hooks/use-async"

type Booking = {
  id: string
  code: string
  customer: string
  equipment: string
  dates: string
  total: number
  status: BookingStatus
}

const TONE: Record<BookingStatus, Tone> = {
  Pending: "warning",
  Active: "info",
  Completed: "success",
  Cancelled: "danger",
}

const columns: Column<Booking>[] = [
  { header: "Booking", value: (r) => r.code, className: "font-bold" },
  { header: "Customer", value: (r) => r.customer },
  { header: "Equipment", value: (r) => r.equipment },
  { header: "Dates", value: (r) => r.dates },
  { header: "Total", value: (r) => r.total, cell: (r) => bdt(r.total) },
  {
    header: "Status",
    value: (r) => r.status,
    cell: (r) => <StatusBadge tone={TONE[r.status]}>{r.status}</StatusBadge>,
  },
]

export default function BookingsPage() {
  const {
    data: rows = [],
    loading,
    error,
    reload,
  } = useAsync(
    () =>
      getBookings().then((bookings) =>
        bookings.map((b) => ({
          id: b.id,
          code: b.code,
          customer: b.customerName,
          equipment: b.equipment,
          dates: `${formatDateShort(b.startDate)} – ${formatDateShort(b.endDate)}`,
          total: b.amount,
          status: b.bookingStatus,
        }))
      ),
    []
  )

  return (
    <>
      <PageHeader
        title="All Bookings"
        description="Every rental across the platform."
      />
      <DataTable
        title="Bookings"
        rows={rows}
        columns={columns}
        searchPlaceholder="Search bookings"
        exportName="bookings"
        emptyTitle={
          loading
            ? "Loading bookings…"
            : error
              ? "Couldn't load bookings"
              : "No bookings yet"
        }
        emptyAction={
          error ? (
            <Button type="button" size="sm" variant="outline" onClick={reload}>
              Try again
            </Button>
          ) : null
        }
      />
    </>
  )
}
