"use client"

// app/dashboard/requests/page.tsx  (owner)

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DataTable, bdt } from "@/components/dashboard/data-table"
import type { Column } from "@/components/dashboard/data-table"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatusBadge } from "@/components/dashboard/status-badge"
import type { Tone } from "@/components/dashboard/status-badge"
import { btnDanger, btnPrimary } from "@/components/dashboard/styles"
import { authClient } from "@/lib/auth-client"
import { formatDateRange } from "@/lib/format"
import { getRequests } from "@/backend-api/api/requests"
import { respondToRequest } from "@/backend-api/action/requests"
import type { RequestStatus } from "@/backend-api/types"
import { useAsync } from "@/hooks/use-async"

type Req = {
  id: string
  customer: string
  equipment: string
  dates: string
  total: number
  status: RequestStatus
}

const TONE: Record<RequestStatus, Tone> = {
  Pending: "warning",
  Accepted: "success",
  Declined: "danger",
}

const columns: Column<Req>[] = [
  { header: "Customer", value: (r) => r.customer, className: "font-bold" },
  { header: "Equipment", value: (r) => r.equipment },
  { header: "Dates", value: (r) => r.dates },
  { header: "Total", value: (r) => r.total, cell: (r) => bdt(r.total) },
  {
    header: "Status",
    value: (r) => r.status,
    cell: (r) => <StatusBadge tone={TONE[r.status]}>{r.status}</StatusBadge>,
  },
]

export default function RequestsPage() {
  const { data: session } = authClient.useSession()
  const ownerId = session?.user?.id

  const {
    data: rows = [],
    loading,
    error,
    setData,
    reload,
  } = useAsync(
    () =>
      ownerId
        ? getRequests(ownerId).then((requests) =>
            requests.map((q) => ({
              id: q.id,
              customer: q.customerName,
              equipment: q.equipment,
              dates: formatDateRange(q.startDate, q.endDate),
              total: q.amount,
              status: q.status,
            }))
          )
        : Promise.resolve([]),
    [ownerId]
  )
  const [pendingId, setPendingId] = useState<string | null>(null)

  async function decide(id: string, status: RequestStatus) {
    setPendingId(id)
    try {
      await respondToRequest(id, status)
      setData((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
      toast.success(
        status === "Accepted" ? "Request accepted" : "Request declined"
      )
    } catch {
      toast.error("Couldn't update the request")
    } finally {
      setPendingId(null)
    }
  }

  return (
    <>
      <PageHeader
        title="Booking Requests"
        description="Approve or decline rental requests."
      />
      <DataTable
        title="Requests"
        rows={rows}
        columns={columns}
        exportName="booking-requests"
        emptyTitle={
          loading
            ? "Loading requests…"
            : error
              ? "Couldn't load requests"
              : "No requests yet"
        }
        emptyAction={
          error ? (
            <Button type="button" size="sm" variant="outline" onClick={reload}>
              Try again
            </Button>
          ) : null
        }
        actions={(r) =>
          r.status === "Pending" ? (
            <>
              <Button
                type="button"
                size="sm"
                onClick={() => decide(r.id, "Accepted")}
                disabled={pendingId !== null}
                className={btnPrimary}
              >
                Accept
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => decide(r.id, "Declined")}
                disabled={pendingId !== null}
                className={btnDanger}
              >
                Decline
              </Button>
            </>
          ) : (
            <span className="text-xs text-stone-500">Done</span>
          )
        }
      />
    </>
  )
}
