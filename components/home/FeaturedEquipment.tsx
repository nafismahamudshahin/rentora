"use client"

// components/home/FeaturedEquipment.tsx
// First six listings from /api/equipment/home with a favorite toggle.

import { motion, useReducedMotion } from "framer-motion"
import type { Variants } from "framer-motion"

import { getHomeEquipment } from "@/backend-api/api/equipment"
import { EquipmentCard } from "@/components/equipment/equipment-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useFavorites } from "@/hooks/use-favorites"
import { useAsync } from "@/hooks/use-async"

const EASE = [0.22, 1, 0.36, 1] as const

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const card: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

export function FeaturedEquipment() {
  const reduce = useReducedMotion() ?? false
  const favorites = useFavorites()
  const {
    data: items = [],
    loading,
    error,
    reload,
  } = useAsync(() => getHomeEquipment(), [])

  return (
    <section className="bg-[#FAF7F2]">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <span
          className="mb-3.5 block h-[5px] w-11 rounded-full bg-[#FF6B2C]"
          aria-hidden
        />
        <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
          Featured equipment
        </h2>
        <p className="mt-2 max-w-[560px] text-stone-600">
          Popular gear from trusted owners, ready for your next project.
        </p>

        {loading ? (
          <ul className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <li
                key={i}
                className="overflow-hidden rounded-[22px] border border-[#EDE6D8] bg-white"
              >
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </li>
            ))}
          </ul>
        ) : error ? (
          <div className="mt-9 rounded-[22px] border border-[#EDE6D8] bg-white p-8 text-center">
            <p className="text-stone-600">Couldn&apos;t load equipment.</p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 rounded-full"
              onClick={reload}
            >
              Try again
            </Button>
          </div>
        ) : items.length === 0 ? (
          <p className="mt-9 rounded-[22px] border border-[#EDE6D8] bg-white p-8 text-center text-stone-600">
            No equipment yet. Check back soon.
          </p>
        ) : (
          <motion.ul
            variants={list}
            initial={reduce ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {items.map((item) => (
              <motion.li key={item.id} variants={card}>
                <EquipmentCard
                  item={item}
                  isFavorite={favorites.favoriteIds.has(item.id)}
                  pending={favorites.pendingId === item.id || favorites.loading}
                  onToggleFavorite={favorites.toggleFavorite}
                />
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </section>
  )
}

export default FeaturedEquipment
