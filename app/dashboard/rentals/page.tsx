"use client"

// app/dashboard/rentals/page.tsx  (customer)

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Download, Loader2 } from "lucide-react"

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
import {
  btnDanger,
  btnOutline,
  btnPrimary,
} from "@/components/dashboard/styles"
import { authClient } from "@/lib/auth-client"
import { normalizeRole } from "@/components/dashboard/nav-config"
import { formatDate, formatDateRange } from "@/lib/format"
import { downloadReceipt as downloadReceiptPdf } from "@/lib/receipt"
import { getRentals, getRentalsByCustomer } from "@/backend-api/api/rentals"
import { getMyReviews } from "@/backend-api/api/reviews"
import { cancelRental } from "@/backend-api/action/rentals"
import { ReviewDialog } from "@/components/dashboard/review-dialog"
import type {
  BookingStatus,
  CustomerReview,
  PaymentStatus,
} from "@/backend-api/types"
import { useAsync } from "@/hooks/use-async"

type Rental = {
  id: string
  code: string
  equipment: string
  equipmentId: string
  period: string
  startDate: string
  endDate: string
  bookingDate: string
  quantity: number
  total: number
  payment: PaymentStatus
  status: BookingStatus
  reviewed: boolean
}

type ReviewTarget = {
  id: string
  equipment: string
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
  { header: "Quantity", value: (r) => r.quantity },
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
      <StatusBadge tone={BOOKING_TONE[r.status]}>
        {bookingLabel(r.status, r.payment)}
      </StatusBadge>
    ),
  },
]

export default function RentalsPage() {
  const { data: session } = authClient.useSession()
  const customerId = session?.user?.id
  const role = normalizeRole(
    (session?.user as { role?: string | null } | undefined)?.role
  )

  const toRows = (
    rentals: Awaited<ReturnType<typeof getRentals>>,
    reviewedIds: Set<string> = new Set()
  ) =>
    rentals.map((r) => ({
      id: r.id,
      code: r.code,
      equipment: r.equipment,
      equipmentId: r.equipmentId || "",
      period: formatDateRange(r.startDate, r.endDate),
      startDate: formatDate(r.startDate),
      endDate: formatDate(r.endDate),
      bookingDate: formatDate(r.bookingDate),
      quantity: r.quantity ?? 1,
      total: r.amount,
      payment: r.paymentStatus,
      status: r.bookingStatus,
      reviewed: reviewedIds.has(r.id),
    }))

  const {
    data: rows = [],
    loading,
    error,
    setData,
    reload,
  } = useAsync(() => {
    // The API already scopes owners to their listings and admins to all rows.
    if (role !== "customer") return getRentals().then((rows) => toRows(rows))
    if (!customerId) return Promise.resolve([])
    return Promise.all([getRentalsByCustomer(customerId), getMyReviews()]).then(
      ([rentals, reviews]) =>
        toRows(rentals, new Set(reviews.map((r) => r.rentalId)))
    )
  }, [customerId, role])
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [receiptId, setReceiptId] = useState<string | null>(null)
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null)

  async function downloadReceiptFor(rental: Rental) {
    setReceiptId(rental.id)
    try {
      await downloadReceiptPdf({
        number: rental.code || rental.id,
        issuedOn: rental.bookingDate,
        customer: session?.user?.name || "Customer",
        email: session?.user?.email || "",
        equipment: rental.equipment,
        period: rental.period,
        quantity: rental.quantity,
        amount: rental.total,
        method: "Stripe",
      })
      toast.success("Receipt downloaded")
    } catch {
      toast.error("Couldn't download the receipt")
    } finally {
      setReceiptId(null)
    }
  }

  function onReviewSubmitted(review: CustomerReview) {
    setData((prev) =>
      prev.map((r) => (r.id === review.rentalId ? { ...r, reviewed: true } : r))
    )
    setReviewTarget(null)
    toast.success("Thanks for your review!")
  }

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
        title={
          role === "admin"
            ? "All Rentals"
            : role === "owner"
              ? "My Bookings"
              : "My Rentals"
        }
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
        actions={(r) => (
          <>
            {r.status === "Pending" && r.payment !== "Paid" ? (
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
            ) : null}
            {role === "customer" && r.payment === "Paid" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={receiptId !== null}
                onClick={() => downloadReceiptFor(r)}
                className={btnOutline}
              >
                {receiptId === r.id ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                ) : (
                  <Download className="size-3.5" aria-hidden />
                )}
                Receipt
              </Button>
            ) : null}
            {role === "customer" &&
            r.payment === "Paid" &&
            r.status !== "Cancelled" ? (
              r.reviewed ? (
                <span className="text-xs font-semibold whitespace-nowrap text-emerald-700">
                  Reviewed
                </span>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    setReviewTarget({ id: r.id, equipment: r.equipment })
                  }
                  className={btnPrimary}
                >
                  Review
                </Button>
              )
            ) : null}
          </>
        )}
      />
      <ReviewDialog
        key={reviewTarget?.id ?? "none"}
        rental={reviewTarget}
        onClose={() => setReviewTarget(null)}
        onSubmitted={onReviewSubmitted}
      />
    </>
  )
}
