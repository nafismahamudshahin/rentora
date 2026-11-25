// backend-api/api/equipment.ts
// Read: public catalog and single-item lookup.
import { ApiError, apiFetch, query, segment } from "../client"
import type {
  Availability,
  Equipment,
  EquipmentQuery,
  UnavailableRange,
} from "../types"

/** First six listings for the home page. */
export async function getHomeEquipment(): Promise<Equipment[]> {
  return apiFetch<Equipment[]>("/equipment/home")
}

/** Every piece of equipment, optionally filtered by URL query params. */
export async function getEquipment(
  params: EquipmentQuery = {}
): Promise<Equipment[]> {
  return apiFetch<Equipment[]>(`/equipment${query(params)}`)
}

/** Admin-only: every listing, including pending and rejected ones. */
export async function getAdminEquipment(): Promise<Equipment[]> {
  return apiFetch<Equipment[]>("/admin/equipment")
}

/** Units still free for one item over a chosen date range. */
export async function getAvailability(
  id: string,
  startDate: string,
  endDate: string
): Promise<Availability> {
  return apiFetch<Availability>(
    `/equipment/${segment(id)}/availability${query({ startDate, endDate })}`
  )
}

/** Date ranges where every unit is already booked. */
export async function getUnavailableDates(
  id: string
): Promise<UnavailableRange[]> {
  return apiFetch<UnavailableRange[]>(`/equipment/${segment(id)}/unavailable-dates`)
}

/** One item by id, or undefined. */
export async function getEquipmentById(
  id: string
): Promise<Equipment | undefined> {
  try {
    return await apiFetch<Equipment>(`/equipment/${segment(id)}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined
    throw error
  }
}
