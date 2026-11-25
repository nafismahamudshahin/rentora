"use client"

// app/dashboard/payments/page.tsx  (admin)

import { DataTable, bdt } from "@/components/dashboard/data-table"
import type { Column } from "@/components/dashboard/data-table"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatusBadge } from "@/components/dashboard/status-badge"
import type { Tone } from "@/components/dashboard/status-badge"
import { card } from "@/components/dashboard/styles"
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

function round2(value: number) {
  return Math.round(value * 100) / 100
}

function feeOf(p: Payment) {
  if (p.status !== "Succeeded") return 0
  return p.commission ?? round2(p.amount * 0.02)
}

function ownerNetOf(p: Payment) {
  if (p.status !== "Succeeded") return 0
  return p.ownerAmount ?? round2(p.amount - feeOf(p))
}

const columns: Column<Payment>[] = [
  { header: "Reference", value: (r) => r.reference, className: "font-bold" },
  { header: "Customer", value: (r) => r.customer },
  { header: "Amount", value: (r) => r.amount, cell: (r) => bdt(r.amount) },
  {
    header: "Rentora fee (2%)",
    value: (r) => feeOf(r),
    cell: (r) => bdt(feeOf(r)),
  },
  {
    header: "Owner receives",
    value: (r) => ownerNetOf(r),
    cell: (r) => bdt(ownerNetOf(r)),
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

  const succeeded = rows.filter((p) => p.status === "Succeeded")
  const total = succeeded.reduce((sum, p) => sum + p.amount, 0)
  const fees = succeeded.reduce((sum, p) => sum + feeOf(p), 0)
  const ownerNet = succeeded.reduce((sum, p) => sum + ownerNetOf(p), 0)

  return (
    <>
      <PageHeader
        title="Payments"
        description="Transactions processed through Stripe."
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className={`${card} p-5`}>
          <p className="text-sm font-medium text-stone-600">Total collected</p>
          <p className="mt-2 font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tracking-tight">
            {bdt(total)}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            {succeeded.length} successful payments
          </p>
        </div>
        <div className={`${card} p-5`}>
          <p className="text-sm font-medium text-stone-600">Rentora fee</p>
          <p className="mt-2 font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tracking-tight">
            {bdt(fees)}
          </p>
          <p className="mt-1 text-xs text-stone-500">2% platform commission</p>
        </div>
        <div className={`${card} p-5`}>
          <p className="text-sm font-medium text-stone-600">Owner payouts</p>
          <p className="mt-2 font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tracking-tight">
            {bdt(ownerNet)}
          </p>
          <p className="mt-1 text-xs text-stone-500">Net after commission</p>
        </div>
        <div className={`${card} p-5`}>
          <p className="text-sm font-medium text-stone-600">All transactions</p>
          <p className="mt-2 font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tracking-tight">
            {rows.length}
          </p>
          <p className="mt-1 text-xs text-stone-500">Including pending/failed</p>
        </div>
      </div>

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
