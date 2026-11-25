"use client"

// lib/pending-booking.ts
// The booking modal collects delivery details before login. Keep them in the
// tab session instead of the URL so phone numbers and addresses are not saved
// in browser history or server logs.

import { useMemo, useSyncExternalStore } from "react"

export type PendingBooking = {
  equipmentId: string
  startDate: string
  endDate: string
  quantity: number
  phone: string
  address: string
  notes: string
}

type PendingBookingMatch = Pick<
  PendingBooking,
  "equipmentId" | "startDate" | "endDate" | "quantity"
>

const STORAGE_KEY = "rentora:pending-booking"
const MAX_AGE_MS = 30 * 60_000

export function savePendingBooking(details: PendingBooking) {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...details, savedAt: Date.now() })
    )
  } catch {
    // Private browsing can block sessionStorage; checkout still works without it.
  }
}

export function clearPendingBooking() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}

function subscribe(onChange: () => void) {
  if (typeof window === "undefined") return () => {}
  window.addEventListener("storage", onChange)
  return () => window.removeEventListener("storage", onChange)
}

function getSnapshot() {
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function getServerSnapshot() {
  return null
}

function parsePendingBooking(
  raw: string | null,
  expected: PendingBookingMatch
): PendingBooking | null {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<PendingBooking> & {
      savedAt?: number
    }
    const expired =
      typeof parsed.savedAt !== "number" ||
      Date.now() - parsed.savedAt > MAX_AGE_MS

    if (
      expired ||
      parsed.equipmentId !== expected.equipmentId ||
      parsed.startDate !== expected.startDate ||
      parsed.endDate !== expected.endDate ||
      parsed.quantity !== expected.quantity ||
      typeof parsed.phone !== "string" ||
      typeof parsed.address !== "string" ||
      typeof parsed.notes !== "string"
    ) {
      return null
    }

    return {
      equipmentId: parsed.equipmentId,
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      quantity: parsed.quantity,
      phone: parsed.phone,
      address: parsed.address,
      notes: parsed.notes,
    }
  } catch {
    return null
  }
}

/**
 * Read the modal's saved details after hydration. useSyncExternalStore gives
 * the server snapshot during SSR, so this cannot cause a hydration mismatch.
 */
export function usePendingBooking(
  expected: PendingBookingMatch
): PendingBooking | null {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const { equipmentId, startDate, endDate, quantity } = expected

  return useMemo(
    () =>
      parsePendingBooking(raw, {
        equipmentId,
        startDate,
        endDate,
        quantity,
      }),
    [raw, equipmentId, startDate, endDate, quantity]
  )
}
