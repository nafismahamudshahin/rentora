// lib/booking.ts
// Small date helpers shared by the details and payment pages.
// Dates stay as "YYYY-MM-DD" strings so they can be sent in the URL/API.

import type { UnavailableRange } from "@/backend-api/types"

export function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function todayIso(): string {
  return toIsoDate(new Date())
}

/** Nov 25 → Nov 27 counts as 3 rental days. */
export function bookingDays(start: string, end: string): number {
  const from = Date.parse(`${start}T00:00:00Z`)
  const to = Date.parse(`${end}T00:00:00Z`)
  if (Number.isNaN(from) || Number.isNaN(to)) return 0
  return Math.round((to - from) / 86400000) + 1
}

/** Older listings/rentals did not store quantity; they use one unit. */
export function unitsOf(value?: number): number {
  const quantity = Math.floor(Number(value))
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1
}

/** Empty string means the requested quantity fits; otherwise a user message. */
export function validateBookingQuantity(
  quantity: number,
  available: number
): string {
  if (!Number.isInteger(quantity) || quantity < 1) {
    return "Choose at least one unit"
  }
  if (quantity > available) {
    return available < 1
      ? "Every unit is booked for these dates"
      : `Only ${available} unit${available === 1 ? " is" : "s are"} available for these dates`
  }
  return ""
}

export function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  return aStart <= bEnd && bStart <= aEnd
}

/** Empty string means the range is valid; otherwise it is a user message. */
export function validateBookingRange(
  start: string,
  end: string,
  blocked: UnavailableRange[],
  today = todayIso()
): string {
  if (!start || !end) return ""
  if (start < today) return "Start date cannot be in the past"
  if (end < start) return "End date cannot be before the start date"

  const days = bookingDays(start, end)
  if (days < 1) return "Choose at least one day"
  if (days > 60) return "You can book up to 60 days at a time"

  const taken = blocked.find((range) =>
    rangesOverlap(start, end, range.startDate, range.endDate)
  )
  if (taken) {
    return `Already booked ${taken.startDate} → ${taken.endDate}. Choose other dates.`
  }
  return ""
}
