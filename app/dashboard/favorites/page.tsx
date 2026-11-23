"use client"

// app/dashboard/favorites/page.tsx  (customer)

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { bdt, Column, DataTable } from "@/components/dashboard/data-table"
import { PageHeader } from "@/components/dashboard/page-header"
import { btnOutline, btnPrimary } from "@/components/dashboard/styles"
import { authClient } from "@/lib/auth-client"
import { getFavorites } from "@/backend-api/api/favorites"
import { removeFavorite } from "@/backend-api/action/favorites"
import { useAsync } from "@/hooks/use-async"

type Favorite = {
  id: string
  equipmentId: string
  name: string
  category: string
  pricePerDay: number
}

const columns: Column<Favorite>[] = [
  { header: "Equipment", value: (r) => r.name, className: "font-bold" },
  { header: "Category", value: (r) => r.category },
  {
    header: "Price",
    value: (r) => r.pricePerDay,
    cell: (r) => `${bdt(r.pricePerDay)} / day`,
  },
]

export default function FavoritesPage() {
  const { data: session } = authClient.useSession()
  const customerId = session?.user?.id

  const {
    data: items = [],
    loading,
    error,
    setData,
    reload,
  } = useAsync(
    () => (customerId ? getFavorites(customerId) : Promise.resolve([])),
    [customerId]
  )
  const [pendingId, setPendingId] = useState<string | null>(null)

  async function remove(id: string) {
    setPendingId(id)
    try {
      await removeFavorite(id)
      setData((prev) => prev.filter((i) => i.id !== id))
      toast.success("Removed from favorites")
    } catch {
      toast.error("Couldn't remove the favorite")
    } finally {
      setPendingId(null)
    }
  }

  return (
    <>
      <PageHeader title="Favorites" description="Equipment you saved." />
      <DataTable
        title="Favorites"
        rows={items}
        columns={columns}
        exportName="favorites"
        emptyTitle={
          loading
            ? "Loading favorites…"
            : error
              ? "Couldn't load favorites"
              : "No favorites yet"
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
            <Button
              render={<Link href={`/equipment/${r.equipmentId}`} />}
              nativeButton={false}
              size="sm"
              className={btnPrimary}
            >
              View Details
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pendingId !== null}
              onClick={() => remove(r.id)}
              className={btnOutline}
            >
              Remove Favorite
            </Button>
          </>
        )}
      />
    </>
  )
}
