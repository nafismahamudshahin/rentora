// components/dashboard/booking-status.ts
// Shared status wording for the customer, owner and admin booking tables.

import type { BookingStatus, PaymentStatus } from "@/backend-api/types"
import type { Tone } from "./status-badge"

export const BOOKING_TONE: Record<BookingStatus, Tone> = {
  Pending: "warning",
  Active: "info",
  Completed: "success",
  Cancelled: "danger",
}

export function bookingLabel(
  status: BookingStatus,
  payment?: PaymentStatus
): string {
  if (status === "Pending") {
    return payment === "Paid" ? "Awaiting approval" : "Awaiting payment"
  }
  return status
}
