"use client"

// components/equipment/equipment-filter-panel.tsx
// Left-side filters: search, category, rental type, availability, price.

import { Search, X } from "lucide-react"

import {
  RENTAL_TYPES,
  type EquipmentFilters,
  type FilterOptions,
} from "./filter-utils"

type Props = {
  filters: EquipmentFilters
  search: string
  options: FilterOptions
  activeCount: number
  onSearchChange: (value: string) => void
  onChange: <K extends keyof EquipmentFilters>(
    key: K,
    value: EquipmentFilters[K]
  ) => void
  onReset: () => void
}

const input =
  "h-11 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm text-[#111827] outline-none transition-colors placeholder:text-stone-500 focus-visible:border-[#FF6B2C] focus-visible:ring-2 focus-visible:ring-[#FF6B2C]/30 dark:border-stone-300 dark:bg-white dark:text-[#111827]"

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="border-t border-[#EDE6D8] pt-5">
      <h3 className="mb-3 text-sm font-bold text-[#111827]">{title}</h3>
      {children}
    </section>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111827] ${active
          ? "border-[#111827] bg-[#111827] text-white"
          : "border-[#EDE6D8] bg-[#FAF7F2] text-[#111827] hover:border-[#FF6B2C] hover:bg-orange-50"
        }`}
    >
      {children}
    </button>
  )
}

export function EquipmentFilterPanel({
  filters,
  search,
  options,
  activeCount,
  onSearchChange,
  onChange,
  onReset,
}: Props) {
  return (
    <div className="flex flex-col gap-5 rounded-[26px] border border-[#EDE6D8] bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,.05),0_18px_36px_-22px_rgba(17,24,39,.25)] [color-scheme:light]">
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-[#111827]">
          Filters
        </h2>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={onReset}
            className="text-sm font-bold text-[#9A3412] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-[#111827]"
          >
            Clear all
          </button>
        ) : null}
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-500"
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Name or location"
          aria-label="Search equipment by name or location"
          className={`${input} bg-[#FAF7F2] pl-10 pr-9 dark:bg-[#FAF7F2] [&::-webkit-search-cancel-button]:hidden`}
        />
        {search ? (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-stone-500 hover:text-[#111827] focus-visible:outline-2 focus-visible:outline-[#111827]"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      {/* Category */}
      {options.categories.length > 0 ? (
        <Section title="Category">
          <div role="group" aria-label="Category" className="flex flex-col gap-1">
            {["", ...options.categories].map((c) => {
              const active = filters.category === c
              return (
                <button
                  key={c || "all"}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange("category", c)}
                  className={`rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#111827] ${active
                      ? "bg-[#111827] text-white"
                      : "text-[#111827] hover:bg-orange-50"
                    }`}
                >
                  {c || "All categories"}
                </button>
              )
            })}
          </div>
        </Section>
      ) : null}

      {/* Rental type */}
      <Section title="Rental type">
        <div role="group" aria-label="Rental type" className="flex flex-wrap gap-2">
          {["", ...RENTAL_TYPES].map((t) => (
            <Chip
              key={t || "any"}
              active={filters.rentalType === t}
              onClick={() => onChange("rentalType", t)}
            >
              {t || "Any"}
            </Chip>
          ))}
        </div>
      </Section>

      {/* Availability */}
      <Section title="Availability">
        <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-[#111827]">
          <input
            type="checkbox"
            checked={filters.availability === "available"}
            onChange={(e) =>
              onChange("availability", e.target.checked ? "available" : "")
            }
            className="size-5 rounded accent-[#FF6B2C]"
          />
          Available now only
        </label>
      </Section>

      {/* Price */}
      <Section title="Price range (৳)">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="f-min" className="sr-only">
              Minimum price
            </label>
            <input
              id="f-min"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => onChange("minPrice", e.target.value)}
              className={input}
            />
          </div>
          <div>
            <label htmlFor="f-max" className="sr-only">
              Maximum price
            </label>
            <input
              id="f-max"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => onChange("maxPrice", e.target.value)}
              className={input}
            />
          </div>
        </div>
      </Section>
    </div>
  )
}