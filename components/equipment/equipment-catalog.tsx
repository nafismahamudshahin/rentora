"use client"

// components/equipment/equipment-catalog.tsx
// Public equipment page: filters -> query params -> API -> cards.

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import type { Variants } from "framer-motion"
import { SearchX, SlidersHorizontal } from "lucide-react"

import { getEquipment } from "@/backend-api/api/equipment"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAsync } from "@/hooks/use-async"
import { useFavorites } from "@/hooks/use-favorites"

import { EquipmentCard } from "./equipment-card"
import { EquipmentFilterPanel } from "./equipment-filter-panel"
import {
  countActiveFilters,
  DEFAULT_FILTERS,
  filtersFromSearchParams,
  getFilterOptions,
  SORT_OPTIONS,
  toEquipmentQuery,
  toSearchParams,
  type EquipmentFilters,
} from "./filter-utils"

const EASE = [0.22, 1, 0.36, 1] as const

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const card: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

export function EquipmentCatalog() {
  const reduce = useReducedMotion() ?? false
  const favorites = useFavorites()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // The URL is the single source of truth for every filter.
  const urlString = searchParams.toString()
  const filters = useMemo(
    () => filtersFromSearchParams(new URLSearchParams(urlString)),
    [urlString]
  )

  function updateUrl(next: EquipmentFilters) {
    const qs = toSearchParams(next).toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  // Typed fields (search + price) are held locally and written to the URL
  // after a short pause, so the backend is not called on every keystroke.
  const [draft, setDraft] = useState({
    q: filters.q,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
  })
  const urlKey = `${filters.q}|${filters.minPrice}|${filters.maxPrice}`
  const draftKey = `${draft.q}|${draft.minPrice}|${draft.maxPrice}`
  const committed = useRef(urlKey)

  // URL changed from outside (back button, a link): copy it into the inputs.
  useEffect(() => {
    if (urlKey !== committed.current) {
      committed.current = urlKey
      setDraft({
        q: filters.q,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      })
    }
  }, [urlKey, filters.q, filters.minPrice, filters.maxPrice])

  // Inputs changed: push them to the URL after 400ms.
  useEffect(() => {
    if (draftKey === urlKey) return
    const timer = window.setTimeout(() => {
      committed.current = draftKey
      updateUrl({ ...filters, ...draft })
    }, 400)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey, urlKey])

  // What the backend receives: built from the URL, never from the drafts.
  const query = useMemo(() => toEquipmentQuery(filters), [filters])
  const queryKey = JSON.stringify(query)

  const {
    data: items = [],
    loading,
    error,
    reload,
  } = useAsync(() => getEquipment(query), [queryKey])

  // One unfiltered read supplies the category list and total count.
  const { data: allItems = [] } = useAsync(() => getEquipment(), [])
  const options = useMemo(() => getFilterOptions(allItems), [allItems])

  // The panel shows the drafts so typing feels instant.
  const shown: EquipmentFilters = { ...filters, ...draft }
  const activeCount = countActiveFilters(shown)

  function changeFilter<K extends keyof EquipmentFilters>(
    key: K,
    value: EquipmentFilters[K]
  ) {
    if (key === "minPrice" || key === "maxPrice") {
      setDraft((prev) => ({ ...prev, [key]: value as string }))
      return
    }
    // Clicks (category, rental type, availability, sort) update the URL at once.
    updateUrl({ ...filters, ...draft, [key]: value })
  }

  function setSearch(value: string) {
    setDraft((prev) => ({ ...prev, q: value }))
  }

  function resetFilters() {
    committed.current = "||"
    setDraft({ q: "", minPrice: "", maxPrice: "" })
    updateUrl(DEFAULT_FILTERS)
  }

  const panel = (
    <EquipmentFilterPanel
      filters={shown}
      search={draft.q}
      options={options}
      activeCount={activeCount}
      onSearchChange={setSearch}
      onChange={changeFilter}
      onReset={resetFilters}
    />
  )

  return (
    <div>
      <span
        className="mb-3.5 block h-[5px] w-11 rounded-full bg-[#FF6B2C]"
        aria-hidden
      />
      <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-bold tracking-tight text-[#111827] sm:text-5xl">
        All equipment
      </h1>
      <p className="mt-3 max-w-[560px] text-stone-600">
        Find the right gear from trusted local owners. Search, filter and book
        in minutes.
      </p>

      <div className="mt-9 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">{panel}</div>
        </aside>

        <div className="min-w-0">
          <details className="mb-6 rounded-[22px] border border-[#EDE6D8] bg-white lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-bold text-[#111827] [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="size-4" aria-hidden />
                Filters
              </span>
              {activeCount > 0 ? (
                <span className="rounded-full bg-[#FF6B2C] px-2 py-0.5 text-xs text-[#111827]">
                  {activeCount}
                </span>
              ) : null}
            </summary>
            <div className="border-t border-[#EDE6D8] p-4">{panel}</div>
          </details>

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-stone-600" aria-live="polite">
              {loading
                ? "Loading equipment…"
                : `Showing ${items.length} of ${allItems.length} items`}
            </p>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
              Sort by
              <select
                value={filters.sort}
                onChange={(e) => changeFilter("sort", e.target.value)}
                className="h-10 rounded-xl border border-stone-300 bg-white px-3 text-sm outline-none focus-visible:border-[#FF6B2C] focus-visible:ring-2 focus-visible:ring-[#FF6B2C]/30 dark:border-stone-300 dark:bg-white dark:text-[#111827]"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {loading ? (
            <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
            <div className="rounded-[26px] border border-[#EDE6D8] bg-white p-10 text-center">
              <p className="font-bold text-[#111827]">Couldn&apos;t load equipment.</p>
              <p className="mt-1 text-sm text-stone-600">Check your connection and try again.</p>
              <Button
                type="button"
                variant="outline"
                className="mt-5 rounded-full dark:border-stone-300 dark:bg-white dark:text-[#111827]"
                onClick={reload}
              >
                Try again
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center rounded-[26px] border border-dashed border-stone-300 bg-white/60 p-12 text-center">
              <span className="grid size-14 place-items-center rounded-full bg-orange-100 text-[#9A3412]">
                <SearchX className="size-6" aria-hidden />
              </span>
              <p className="mt-4 font-bold text-[#111827]">No equipment matched.</p>
              <p className="mt-1 text-sm text-stone-600">
                Try a broader search or clear some filters.
              </p>
              <Button
                type="button"
                className="mt-6 h-11 rounded-xl bg-[#FF6B2C] px-6 font-bold text-[#111827] hover:bg-[#FF6B2C]/90"
                onClick={resetFilters}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <motion.ul
              // Re-run the entrance animation when the result set changes.
              key={queryKey}
              variants={list}
              initial={reduce ? false : "hidden"}
              animate="show"
              className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
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
      </div>
    </div>
  )
}

export default EquipmentCatalog