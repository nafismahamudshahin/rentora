"use client"

// hooks/use-favorites.ts
// Shared favorite state for public equipment cards.

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { getFavorites } from "@/backend-api/api/favorites"
import { addFavorite, removeFavorite } from "@/backend-api/action/favorites"
import type { Equipment } from "@/backend-api/types"
import { useAsync } from "@/hooks/use-async"
import { authClient } from "@/lib/auth-client"

export function useFavorites() {
  const router = useRouter()
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const customerId = session?.user?.id
  const [pendingId, setPendingId] = useState<string | null>(null)

  const {
    data: favorites = [],
    loading: favoritesLoading,
    setData: setFavorites,
  } = useAsync(
    () => (customerId ? getFavorites(customerId) : Promise.resolve([])),
    [customerId]
  )

  const favoriteIds = new Set(favorites.map((favorite) => favorite.equipmentId))

  async function toggleFavorite(item: Equipment) {
    if (sessionPending) return

    if (!customerId) {
      toast.error("Sign in to save favorites")
      router.push("/login")
      return
    }

    const existing = favorites.find(
      (favorite) => favorite.equipmentId === item.id
    )
    setPendingId(item.id)

    try {
      if (existing) {
        await removeFavorite(existing.id)
        setFavorites((prev) =>
          prev.filter((favorite) => favorite.id !== existing.id)
        )
        toast.success("Removed from favorites")
      } else {
        const saved = await addFavorite(item.id)
        setFavorites((prev) => [
          ...prev,
          {
            id: saved.id,
            equipmentId: saved.equipmentId,
            name: item.name,
            category: item.category,
            pricePerDay: item.pricePerDay,
          },
        ])
        toast.success("Added to favorites")
      }
    } catch {
      toast.error("Couldn't update favorites")
    } finally {
      setPendingId(null)
    }
  }

  return {
    favoriteIds,
    pendingId,
    loading: favoritesLoading || sessionPending,
    toggleFavorite,
  }
}
