"use client"

// app/dashboard/payments/page.tsx  (admin)

import { DataTable, bdt } from "@/components/dashboard/data-table"
import type { Column } from "@/components/dashboard/data-table"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatusBadge } from "@/components/dashboard/status-badge"
import type { Tone } from "@/components/dashboard/status-badge"
import { Button } from "@/components/ui/button"
import { formatDateShort } from "@/lib/format"
import { getPayments } from "@/backend-api/api/payments"
import type { TransactionStatus } from "@/backend-api/types"
import { useAsync } from "@/hooks/use-async"

type Payment = {
  id: string
  reference: string
  customer: string
  amount: number
  commission?: number
  ownerAmount?: number
  method: string
  date: string
  status: TransactionStatus
}

const TONE: Record<TransactionStatus, Tone> = {
  Succeeded: "success",
  Pending: "warning",
  Refunded: "info",
  Failed: "danger",
}

const columns: Column<Payment>[] = [
  { header: "Reference", value: (r) => r.reference, className: "font-bold" },
  { header: "Customer", value: (r) => r.customer },
  { header: "Amount", value: (r) => r.amount, cell: (r) => bdt(r.amount) },
  {
    header: "Rentora fee (2%)",
    value: (r) => r.commission ?? Math.round(r.amount * 0.02 * 100) / 100,
    cell: (r) => bdt(r.commission ?? Math.round(r.amount * 0.02 * 100) / 100),
  },
  {
    header: "Owner receives",
    value: (r) => r.ownerAmount ?? r.amount * 0.98,
    cell: (r) => bdt(r.ownerAmount ?? r.amount * 0.98),
  },
  { header: "Method", value: (r) => r.method },
  { header: "Date", value: (r) => r.date },
  {
    header: "Status",
    value: (r) => r.status,
    cell: (r) => <StatusBadge tone={TONE[r.status]}>{r.status}</StatusBadge>,
  },
]

export default function PaymentsPage() {
  const {
    data: rows = [],
    loading,
    error,
    reload,
  } = useAsync(
    () =>
      getPayments().then((payments) =>
        payments.map((p) => ({ ...p, date: formatDateShort(p.date) }))
      ),
    []
  )

  return (
    <>
      <PageHeader
        title="Payments"
        description="Transactions processed through Stripe."
      />
      <DataTable
        title="Payments"
        rows={rows}
        columns={columns}
        searchPlaceholder="Search payments"
        exportName="payments"
        emptyTitle={
          loading
            ? "Loading payments…"
            : error
              ? "Couldn't load payments"
              : "No payments yet"
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
