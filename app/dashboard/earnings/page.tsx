"use client"

// app/dashboard/earnings/page.tsx  (owner)

import { motion, useReducedMotion } from "framer-motion"

import { DataTable, bdt } from "@/components/dashboard/data-table"
import type { Column } from "@/components/dashboard/data-table"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { card } from "@/components/dashboard/styles"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { formatDateShort } from "@/lib/format"
import { getEarnings } from "@/backend-api/api/earnings"
import { useAsync } from "@/hooks/use-async"

type Payout = {
  id: string
  reference: string
  date: string
  amount: number
  status: "Paid" | "Pending"
}

const columns: Column<Payout>[] = [
  { header: "Reference", value: (r) => r.reference, className: "font-bold" },
  { header: "Date", value: (r) => r.date },
  { header: "Amount", value: (r) => r.amount, cell: (r) => bdt(r.amount) },
  {
    header: "Status",
    value: (r) => r.status,
    cell: (r) => (
      <StatusBadge tone={r.status === "Paid" ? "success" : "warning"}>
        {r.status}
      </StatusBadge>
    ),
  },
]

export default function EarningsPage() {
  const reduce = useReducedMotion() ?? false
  const { data: session } = authClient.useSession()
  const ownerId = session?.user?.id

  const { data, loading, error, reload } = useAsync(
    () =>
      ownerId
        ? getEarnings(ownerId).then((earnings) => ({
            months: earnings.monthly,
            payouts: earnings.payouts.map((p) => ({
              ...p,
              date: formatDateShort(p.date),
            })),
          }))
        : Promise.resolve({ months: [], payouts: [] }),
    [ownerId]
  )

  const months = data?.months ?? []
  const payouts = data?.payouts ?? []
  const max = Math.max(1, ...months.map((m) => m.amount))
  const thisMonth = months[months.length - 1]?.amount ?? 0

  return (
    <>
      <PageHeader
        title="Earnings"
        description="What your equipment has earned."
      />

      <motion.section
        initial={reduce ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className={`${card} mb-4`}
      >
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-stone-600">This month</p>
            <p className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight">
              {bdt(thisMonth)}
            </p>
          </div>
          <p className="text-xs text-stone-500">Last 6 months</p>
        </div>

        <div
          className="flex h-44 items-end gap-3 sm:gap-5"
          role="img"
          aria-label="Monthly earnings chart"
        >
          {months.map((m, i) => (
            <div
              key={m.m}
              className="flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              <motion.div
                initial={reduce ? false : { height: 0 }}
                animate={{ height: `${(m.amount / max) * 100}%` }}
                transition={{
                  duration: 0.7,
                  delay: reduce ? 0 : 0.15 + i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                title={bdt(m.amount)}
                className={`w-full rounded-t-lg ${i === months.length - 1 ? "bg-[#FF6B2C]" : "bg-[#111827]/15"}`}
              />
              <span className="text-xs font-medium text-stone-600">{m.m}</span>
            </div>
          ))}
        </div>
      </motion.section>

      <DataTable
        title="Payouts"
        rows={payouts}
        columns={columns}
        exportName="payouts"
        emptyTitle={
          loading
            ? "Loading payouts…"
            : error
              ? "Couldn't load payouts"
              : "No payouts yet"
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
