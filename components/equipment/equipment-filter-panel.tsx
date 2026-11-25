"use client"

// components/equipment/equipment-filter-panel.tsx
// Side filters: category, rental type, availability and price.

import {
  RENTAL_TYPES,
  type EquipmentFilters,
  type FilterOptions,
} from "./filter-utils"

type Props = {
  filters: EquipmentFilters
  options: FilterOptions
  activeCount: number
  onChange: <K extends keyof EquipmentFilters>(
    key: K,
    value: EquipmentFilters[K]
  ) => void
  onReset: () => void
}

const input =
  "h-11 w-full rounded-xl border border-[#EDE6D8] bg-[#FAF7F2] px-3 text-sm text-[#111827] outline-none transition-colors placeholder:text-stone-400 focus-visible:border-[#FF6B2C] focus-visible:ring-2 focus-visible:ring-[#FF6B2C]/30 [color-scheme:light]"

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="border-t border-[#EDE6D8] pt-5">
      <h3 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-stone-500 uppercase">
        {title}
      </h3>
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
      className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111827] ${
        active
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
  options,
  activeCount,
  onChange,
  onReset,
}: Props) {
  return (
    <div className="flex flex-col gap-5 rounded-[26px] border border-[#EDE6D8] bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,.05),0_18px_36px_-22px_rgba(17,24,39,.25)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-[#111827]">
            Filters
          </h2>
          <p className="mt-0.5 text-xs text-stone-500">
            Narrow down your results
          </p>
        </div>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={onReset}
            className="rounded-full bg-[#FFF4ED] px-3 py-1.5 text-xs font-bold text-[#9A3412] transition-colors hover:bg-[#F6D9C8] focus-visible:outline-2 focus-visible:outline-[#111827]"
          >
            Clear all
          </button>
        ) : null}
      </div>

      {/* Category */}
      {options.categories.length > 0 ? (
        <Section title="Category">
          <div
            role="group"
            aria-label="Category"
            className="flex flex-col gap-1"
          >
            {["", ...options.categories].map((c) => {
              const active = filters.category === c
              return (
                <button
                  key={c || "all"}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange("category", c)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#111827] ${
                    active
                      ? "bg-[#111827] text-white"
                      : "text-[#111827] hover:bg-orange-50"
                  }`}
                >
                  {c || "All categories"}
                  <span
                    className={`size-1.5 rounded-full ${active ? "bg-[#FF6B2C]" : "bg-stone-300"}`}
                    aria-hidden
                  />
                </button>
              )
            })}
          </div>
        </Section>
      ) : null}

      {/* Rental type */}
      <Section title="Rental type">
        <div
          role="group"
          aria-label="Rental type"
          className="flex flex-wrap gap-2"
        >
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
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#EDE6D8] bg-[#FAF7F2] p-3">
          <input
            type="checkbox"
            checked={filters.availability === "available"}
            onChange={(e) =>
              onChange("availability", e.target.checked ? "available" : "")
            }
            className="mt-0.5 size-5 shrink-0 rounded accent-[#FF6B2C]"
          />
          <span>
            <span className="block text-sm font-semibold text-[#111827]">
              Available now only
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-stone-500">
              Hide gear that is rented today.
            </span>
          </span>
        </label>
      </Section>

      {/* Price */}
      <Section title="Price per day (৳)">
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
