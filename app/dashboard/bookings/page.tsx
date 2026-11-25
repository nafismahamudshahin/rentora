"use client"

// app/dashboard/bookings/page.tsx  (admin)

import { DataTable, bdt } from "@/components/dashboard/data-table"
import type { Column } from "@/components/dashboard/data-table"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatusBadge } from "@/components/dashboard/status-badge"
import type { Tone } from "@/components/dashboard/status-badge"
import {
  BOOKING_TONE,
  bookingLabel,
} from "@/components/dashboard/booking-status"
import { Button } from "@/components/ui/button"
import { formatDateShort } from "@/lib/format"
import { getBookings } from "@/backend-api/api/bookings"
import type { BookingStatus, PaymentStatus } from "@/backend-api/types"
import { useAsync } from "@/hooks/use-async"

type Booking = {
  id: string
  code: string
  customer: string
  equipment: string
  dates: string
  quantity: number
  total: number
  payment: PaymentStatus
  status: BookingStatus
}

const PAYMENT_TONE: Record<PaymentStatus, Tone> = {
  Paid: "success",
  Pending: "warning",
  Refunded: "neutral",
  Failed: "danger",
}

const columns: Column<Booking>[] = [
  { header: "Booking", value: (r) => r.code, className: "font-bold" },
  { header: "Customer", value: (r) => r.customer },
  { header: "Equipment", value: (r) => r.equipment },
  { header: "Dates", value: (r) => r.dates },
  { header: "Quantity", value: (r) => r.quantity },
  { header: "Total", value: (r) => r.total, cell: (r) => bdt(r.total) },
  {
    header: "Payment",
    value: (r) => r.payment,
    cell: (r) => (
      <StatusBadge tone={PAYMENT_TONE[r.payment]}>{r.payment}</StatusBadge>
    ),
  },
  {
    header: "Status",
    value: (r) => bookingLabel(r.status, r.payment),
    cell: (r) => (
      <StatusBadge tone={BOOKING_TONE[r.status]}>
        {bookingLabel(r.status, r.payment)}
      </StatusBadge>
    ),
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
          quantity: b.quantity ?? 1,
          total: b.amount,
          payment: b.paymentStatus,
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
