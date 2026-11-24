// backend-api/api/rentals.ts
// Read: role-scoped rentals and the customer filter.
import { apiFetch, query } from "../client"
import type { Rental } from "../types"

/** All rentals (admin "All Rentals"; role-scoped for owner/customer). */
export async function getRentals(): Promise<Rental[]> {
  return apiFetch<Rental[]>("/rentals")
}

/** One customer's rentals. Non-admins only receive their own rows. */
export async function getRentalsByCustomer(
  customerId: string
): Promise<Rental[]> {
  return apiFetch<Rental[]>(`/rentals${query({ customerId })}`)
}
