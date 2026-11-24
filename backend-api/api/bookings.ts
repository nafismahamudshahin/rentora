// backend-api/api/bookings.ts
// Admin "All Bookings" — the same records as rentals, presented per booking.
import { apiFetch } from "../client"
import type { Rental } from "../types"

export async function getBookings(): Promise<Rental[]> {
  return apiFetch<Rental[]>("/bookings")
}
