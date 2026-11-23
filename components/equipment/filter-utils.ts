// components/equipment/filter-utils.ts
//
// Filters live in the URL, e.g.
//   /equipment?q=excavator&category=Construction&rentalType=Daily
//             &availability=available&minPrice=1000&maxPrice=20000&sort=price_asc
//
// The same names are sent to the backend by getEquipment(query):
//   GET {API_URL}/equipment?q=...&category=...&rentalType=...
//
// Empty / default values are left out, so /equipment is the clean default URL.

export type EquipmentFilters = {
  q: string
  category: string
  rentalType: string
  availability: string
  minPrice: string
  maxPrice: string
  sort: string
}

/** What getEquipment() receives (and what the backend will read). */
export type EquipmentQuery = Partial<Record<keyof EquipmentFilters, string>>

export const DEFAULT_FILTERS: EquipmentFilters = {
  q: "",
  category: "",
  rentalType: "",
  availability: "",
  minPrice: "",
  maxPrice: "",
  sort: "newest",
}

export const RENTAL_TYPES = ["Daily", "Weekly", "Monthly"] as const

export const SORT_OPTIONS = [
  { value: "newest", label: "Recently added" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
] as const

const digits = (v: string | null) => (v && /^\d+$/.test(v) ? v : "")

/** URL -> filters (invalid values are ignored). */
export function filtersFromSearchParams(
  params: URLSearchParams
): EquipmentFilters {
  const rentalType = params.get("rentalType") ?? ""
  const sort = params.get("sort") ?? ""

  return {
    q: (params.get("q") ?? "").slice(0, 100),
    category: params.get("category") ?? "",
    rentalType: (RENTAL_TYPES as readonly string[]).includes(rentalType)
      ? rentalType
      : "",
    availability: params.get("availability") === "available" ? "available" : "",
    minPrice: digits(params.get("minPrice")),
    maxPrice: digits(params.get("maxPrice")),
    sort: SORT_OPTIONS.some((o) => o.value === sort)
      ? sort
      : DEFAULT_FILTERS.sort,
  }
}

/** filters -> URL params (only non-empty, non-default values). */
export function toSearchParams(filters: EquipmentFilters) {
  const params = new URLSearchParams()
  if (filters.q.trim()) params.set("q", filters.q.trim())
  if (filters.category) params.set("category", filters.category)
  if (filters.rentalType) params.set("rentalType", filters.rentalType)
  if (filters.availability) params.set("availability", filters.availability)
  if (filters.minPrice) params.set("minPrice", filters.minPrice)
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice)
  if (filters.sort && filters.sort !== DEFAULT_FILTERS.sort) {
    params.set("sort", filters.sort)
  }
  return params
}

/** filters -> the object passed to getEquipment(). Same keys as the URL. */
export function toEquipmentQuery(filters: EquipmentFilters): EquipmentQuery {
  return Object.fromEntries(toSearchParams(filters)) as EquipmentQuery
}

/** Category list comes from the data, so it never goes out of date. */
export function getFilterOptions(items: { category?: string | null }[]) {
  const categories = Array.from(
    new Set(items.map((i) => i.category).filter((c): c is string => !!c))
  ).sort((a, b) => a.localeCompare(b))
  return { categories }
}

export type FilterOptions = ReturnType<typeof getFilterOptions>

export function countActiveFilters(filters: EquipmentFilters) {
  return [
    filters.q.trim(),
    filters.category,
    filters.rentalType,
    filters.availability,
    filters.minPrice,
    filters.maxPrice,
  ].filter(Boolean).length
}