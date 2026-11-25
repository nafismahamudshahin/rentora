"use client"

// components/equipment/equipment-catalog.tsx
// Public equipment page: filters -> query params -> API -> cards.

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import type { Variants } from "framer-motion"
import { Search, SearchX, SlidersHorizontal, X } from "lucide-react"

import { getEquipment } from "@/backend-api/api/equipment"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { bdt } from "@/lib/format"
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

type Chip = { label: string; remove: () => void }

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

  const chips: Chip[] = []
  if (shown.q.trim()) {
    chips.push({
      label: `Search: ${shown.q.trim()}`,
      remove: () => changeFilter("q", ""),
    })
  }
  if (shown.category) {
    chips.push({
      label: shown.category,
      remove: () => changeFilter("category", ""),
    })
  }
  if (shown.rentalType) {
    chips.push({
      label: shown.rentalType,
      remove: () => changeFilter("rentalType", ""),
    })
  }
  if (shown.availability) {
    chips.push({
      label: "Available now",
      remove: () => changeFilter("availability", ""),
    })
  }
  if (shown.minPrice) {
    chips.push({
      label: `From ${bdt(Number(shown.minPrice))}`,
      remove: () => changeFilter("minPrice", ""),
    })
  }
  if (shown.maxPrice) {
    chips.push({
      label: `Up to ${bdt(Number(shown.maxPrice))}`,
      remove: () => changeFilter("maxPrice", ""),
    })
  }

  const panel = (
    <EquipmentFilterPanel
      filters={shown}
      options={options}
      activeCount={activeCount}
      onChange={changeFilter}
      onReset={resetFilters}
    />
  )

  return (
    <div>
      {/* Search and sort toolbar */}
      <div className="rounded-[24px] border border-[#EDE6D8] bg-white p-4 shadow-[0_1px_2px_rgba(17,24,39,.05),0_18px_44px_-30px_rgba(17,24,39,.35)] sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-stone-500"
              aria-hidden
            />
            <label htmlFor="catalog-search" className="sr-only">
              Search equipment by name or location
            </label>
            <input
              id="catalog-search"
              type="search"
              value={draft.q}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search excavator, camera, tractor..."
              className="h-12 w-full rounded-xl border border-[#EDE6D8] bg-[#FAF7F2] pr-11 pl-12 text-sm text-[#111827] transition-colors outline-none placeholder:text-stone-400 focus-visible:border-[#FF6B2C] focus-visible:ring-2 focus-visible:ring-[#FF6B2C]/30 [&::-webkit-search-cancel-button]:hidden"
            />
            {draft.q ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1.5 text-stone-500 transition-colors hover:bg-stone-200 hover:text-[#111827] focus-visible:outline-2 focus-visible:outline-[#111827]"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          <label className="flex items-center gap-2.5 text-sm font-semibold text-[#111827]">
            <span className="text-xs font-bold tracking-[0.12em] text-stone-500 uppercase">
              Sort
            </span>
            <select
              value={filters.sort}
              onChange={(e) => changeFilter("sort", e.target.value)}
              className="h-12 min-w-[190px] rounded-xl border border-[#EDE6D8] bg-[#FAF7F2] px-3 text-sm font-semibold text-[#111827] transition-colors outline-none focus-visible:border-[#FF6B2C] focus-visible:ring-2 focus-visible:ring-[#FF6B2C]/30"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {chips.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#EDE6D8] pt-4">
            <span className="mr-1 text-xs font-semibold text-stone-500">
              Active filters
            </span>
            {chips.map((chip, index) => (
              <button
                key={`${chip.label}-${index}`}
                type="button"
                onClick={chip.remove}
                className="flex items-center gap-1.5 rounded-full bg-[#FFF4ED] px-3 py-1.5 text-xs font-bold text-[#9A3412] transition-colors hover:bg-[#F6D9C8] focus-visible:outline-2 focus-visible:outline-[#111827]"
              >
                {chip.label}
                <X className="size-3.5" aria-hidden />
                <span className="sr-only">Remove filter</span>
              </button>
            ))}
            <button
              type="button"
              onClick={resetFilters}
              className="ml-1 text-xs font-bold text-[#111827] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-[#111827]"
            >
              Clear all
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-7 grid gap-7 lg:grid-cols-[272px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">{panel}</div>
        </aside>

        <div className="min-w-0">
          <details className="mb-5 rounded-[22px] border border-[#EDE6D8] bg-white lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-bold text-[#111827] [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="size-4" aria-hidden />
                Filters
              </span>
              {activeCount > 0 ? (
                <span className="rounded-full bg-[#FF6B2C] px-2 py-0.5 text-xs font-bold text-[#111827]">
                  {activeCount}
                </span>
              ) : (
                <span className="text-xs font-semibold text-stone-400">
                  Show all
                </span>
              )}
            </summary>
            <div className="border-t border-[#EDE6D8] p-4">{panel}</div>
          </details>

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-stone-600" aria-live="polite">
              {loading
                ? "Loading equipment…"
                : `Showing ${items.length} of ${allItems.length} items`}
            </p>
            {activeCount > 0 ? (
              <p className="hidden text-xs text-stone-500 sm:block">
                Filters are saved in the URL, so you can share this search.
              </p>
            ) : null}
          </div>

          {loading ? (
            <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <li
                  key={i}
                  className="overflow-hidden rounded-[24px] border border-[#EDE6D8] bg-white"
                >
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <div className="space-y-3 p-5">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <div className="flex items-center justify-between border-t border-[#EDE6D8] px-5 py-4">
                    <Skeleton className="h-7 w-24" />
                    <Skeleton className="h-9 w-20 rounded-full" />
                  </div>
                </li>
              ))}
            </ul>
          ) : error ? (
            <div className="rounded-[26px] border border-[#EDE6D8] bg-white p-10 text-center shadow-[0_18px_44px_-30px_rgba(17,24,39,.35)]">
              <p className="font-bold text-[#111827]">
                Couldn&apos;t load equipment.
              </p>
              <p className="mt-1 text-sm text-stone-600">
                Check your connection and try again.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-5 h-11 rounded-full border-[#EDE6D8] bg-white font-bold text-[#111827] hover:bg-stone-50"
                onClick={reload}
              >
                Try again
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center rounded-[26px] border border-dashed border-stone-300 bg-white/70 p-12 text-center">
              <span className="grid size-14 place-items-center rounded-full bg-orange-100 text-[#9A3412]">
                <SearchX className="size-6" aria-hidden />
              </span>
              <p className="mt-4 font-bold text-[#111827]">
                No equipment matched.
              </p>
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
                    pending={
                      favorites.pendingId === item.id || favorites.loading
                    }
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
