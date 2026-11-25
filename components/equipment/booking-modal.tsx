"use client"

// components/equipment/booking-modal.tsx
// One place for every booking choice: dates, quantity and delivery details.
// Availability is checked here and again by the checkout API before payment.

import { useEffect, useRef, useState } from "react"
import type { FormEvent } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Boxes,
  CalendarDays,
  Loader2,
  MapPin,
  ShieldCheck,
  X,
} from "lucide-react"

import {
  getAvailability,
  getUnavailableDates,
} from "@/backend-api/api/equipment"
import type { Equipment } from "@/backend-api/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAsync } from "@/hooks/use-async"
import { savePendingBooking } from "@/lib/pending-booking"
import { bdt, formatDateShort } from "@/lib/format"
import {
  bookingDays,
  todayIso,
  unitsOf,
  validateBookingQuantity,
  validateBookingRange,
} from "@/lib/booking"
import { cn } from "@/lib/utils"

type BookingModalProps = {
  item: Equipment
  open: boolean
  onClose: () => void
  signedIn: boolean
  customerOnly: boolean
  sessionPending: boolean
}

export function BookingModal({
  item,
  open,
  onClose,
  signedIn,
  customerOnly,
  sessionPending,
}: BookingModalProps) {
  const router = useRouter()
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    firstFieldRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onClose()
    }

    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, onClose, busy])

  const minDate = todayIso()
  const { data: blocked = [], error: blockedError } = useAsync(
    () => (open ? getUnavailableDates(item.id) : Promise.resolve([])),
    [open, item.id]
  )
  const {
    data: availability,
    loading: availabilityLoading,
    error: availabilityError,
  } = useAsync(
    () =>
      open && startDate && endDate
        ? getAvailability(item.id, startDate, endDate)
        : Promise.resolve(undefined),
    [open, item.id, startDate, endDate]
  )

  if (!open) return null

  const days = startDate && endDate ? bookingDays(startDate, endDate) : 0
  const stock = unitsOf(item.availableQuantity)
  const available = Math.min(stock, availability?.available ?? stock)
  const rangeError = validateBookingRange(startDate, endDate, blocked, minDate)
  const quantityError = validateBookingQuantity(quantity, available)
  const total = days > 0 ? item.pricePerDay * days * quantity : 0

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    if (sessionPending || customerOnly) return
    if (!startDate || !endDate) {
      setError("Choose a rental start date and end date.")
      return
    }
    if (!phone.trim() || !address.trim()) {
      setError("Enter your contact number and delivery address.")
      return
    }

    setBusy(true)
    try {
      // Fetch again when the customer confirms: dates can change while the
      // modal is open, and another customer may pay at the same moment.
      const [freshBlocked, freshAvailability] = await Promise.all([
        getUnavailableDates(item.id),
        getAvailability(item.id, startDate, endDate),
      ])

      const freshRangeError = validateBookingRange(
        startDate,
        endDate,
        freshBlocked,
        minDate
      )
      if (freshRangeError) throw new Error(freshRangeError)

      const freshAvailable = Math.min(
        unitsOf(item.availableQuantity),
        freshAvailability.available
      )
      const freshQuantityError = validateBookingQuantity(
        quantity,
        freshAvailable
      )
      if (freshQuantityError) throw new Error(freshQuantityError)

      savePendingBooking({
        equipmentId: item.id,
        startDate,
        endDate,
        quantity,
        phone: phone.trim(),
        address: address.trim(),
        notes: notes.trim(),
      })

      const paymentPath = `/payment?${new URLSearchParams({
        equipmentId: item.id,
        startDate,
        endDate,
        quantity: String(quantity),
      }).toString()}`

      onClose()
      if (!signedIn) {
        router.push(`/login?next=${encodeURIComponent(paymentPath)}`)
        return
      }
      router.push(paymentPath)
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not check availability. Try again."
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#111827]/60 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] border border-[#EDE6D8] bg-white shadow-2xl sm:rounded-[28px]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#EDE6D8] px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-[#9A3412] uppercase">
              Book equipment
            </p>
            <h2
              id="booking-title"
              className="mt-1 font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tracking-tight text-[#111827]"
            >
              {item.name}
            </h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
              <span>{bdt(item.pricePerDay)} / day</span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3" aria-hidden />
                {item.location}
              </span>
              <span className="flex items-center gap-1">
                <Boxes className="size-3" aria-hidden />
                {stock} unit{stock === 1 ? "" : "s"} in stock
              </span>
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close booking form"
            onClick={onClose}
            disabled={busy}
          >
            <X className="size-4" />
          </Button>
        </div>

        <form
          onSubmit={onSubmit}
          className="overflow-y-auto px-6 py-6 sm:px-8 sm:py-7"
        >
          {customerOnly ? (
            <p
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
            >
              Only customer accounts can book. Owners and admins manage listings
              instead.
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="booking-start">Rental start date</Label>
              <Input
                ref={firstFieldRef}
                id="booking-start"
                type="date"
                required
                min={minDate}
                value={startDate}
                onChange={(event) => {
                  const next = event.target.value
                  setStartDate(next)
                  if (endDate && next > endDate) setEndDate("")
                }}
                className="h-11 rounded-xl border-[#EDE6D8]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="booking-end">Rental end date</Label>
              <Input
                id="booking-end"
                type="date"
                required
                min={startDate || minDate}
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="h-11 rounded-xl border-[#EDE6D8]"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="booking-quantity">Required quantity</Label>
              <Input
                id="booking-quantity"
                type="number"
                required
                min="1"
                max={Math.max(1, available)}
                step="1"
                inputMode="numeric"
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className="h-11 rounded-xl border-[#EDE6D8]"
              />
              <p className="text-xs text-stone-500">
                {startDate && endDate
                  ? `${available} unit${available === 1 ? "" : "s"} free for these dates`
                  : `${stock} unit${stock === 1 ? "" : "s"} in stock`}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="booking-phone">Contact number</Label>
              <Input
                id="booking-phone"
                type="tel"
                required
                autoComplete="tel"
                placeholder="01XXXXXXXXX"
                maxLength={50}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="h-11 rounded-xl border-[#EDE6D8]"
              />
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            <Label htmlFor="booking-address">Delivery address</Label>
            <Input
              id="booking-address"
              required
              autoComplete="street-address"
              placeholder="House, road, area, city"
              maxLength={300}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="h-11 rounded-xl border-[#EDE6D8]"
            />
          </div>

          <div className="mt-4 space-y-1.5">
            <Label htmlFor="booking-notes">
              Additional notes{" "}
              <span className="font-normal text-stone-500">(optional)</span>
            </Label>
            <textarea
              id="booking-notes"
              rows={3}
              maxLength={500}
              placeholder="Pickup time, delivery details or anything the owner should know"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="w-full resize-none rounded-xl border border-[#EDE6D8] bg-white p-3 text-sm outline-none focus-visible:border-[#FF6B2C] focus-visible:ring-2 focus-visible:ring-[#FF6B2C]/20"
            />
            <p className="text-right text-xs text-stone-500">
              {notes.length}/500
            </p>
          </div>

          {blocked.length > 0 ? (
            <div className="mt-4 rounded-2xl bg-[#FFF7ED] p-3 text-xs text-[#9A3412]">
              <p className="font-bold">Fully booked — pick other dates</p>
              <ul className="mt-1 space-y-0.5">
                {blocked.slice(0, 3).map((range) => (
                  <li key={`${range.startDate}-${range.endDate}`}>
                    {formatDateShort(range.startDate)} –{" "}
                    {formatDateShort(range.endDate)}
                  </li>
                ))}
                {blocked.length > 3 ? (
                  <li>+{blocked.length - 3} more</li>
                ) : null}
              </ul>
            </div>
          ) : null}

          {rangeError ? (
            <p
              role="alert"
              className="mt-4 flex items-start gap-1.5 text-xs font-semibold text-red-600"
            >
              <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />
              {rangeError}
            </p>
          ) : null}

          {quantityError ? (
            <p
              role="alert"
              className="mt-4 flex items-start gap-1.5 text-xs font-semibold text-red-600"
            >
              <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />
              {quantityError}
            </p>
          ) : null}

          {blockedError || availabilityError ? (
            <p
              role="alert"
              className="mt-4 flex items-start gap-1.5 text-xs font-semibold text-red-600"
            >
              <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />
              Couldn&apos;t check live availability. We will check it again when
              you continue.
            </p>
          ) : null}

          <div className="mt-5 rounded-2xl border border-[#EDE6D8] bg-[#FAF7F2] p-4">
            <div className="flex items-center justify-between gap-3 text-sm text-stone-600">
              <span>
                {days > 0 ? (
                  <>
                    {bdt(item.pricePerDay)} × {days}{" "}
                    {days === 1 ? "day" : "days"} × {quantity}{" "}
                    {quantity === 1 ? "unit" : "units"}
                  </>
                ) : (
                  "Select dates to see the total"
                )}
              </span>
              <span className="font-semibold text-[#111827]">
                {days > 0 ? bdt(total) : "—"}
              </span>
            </div>
            {availabilityLoading && days > 0 ? (
              <p className="mt-2 text-xs text-stone-500">
                Checking availability…
              </p>
            ) : null}
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={busy}
              className="h-12 flex-1 rounded-full border-[#EDE6D8] font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={busy || sessionPending || customerOnly}
              className={cn(
                "h-12 flex-[1.4] rounded-full bg-[#FF6B2C] font-bold text-[#111827]",
                "hover:bg-[#FF6B2C]/90 disabled:opacity-60"
              )}
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <ShieldCheck className="size-4" aria-hidden />
              )}
              {busy
                ? "Checking availability..."
                : signedIn
                  ? "Continue to payment"
                  : "Sign in to continue"}
            </Button>
          </div>

          <p className="mt-3 text-center text-xs text-stone-500">
            <CalendarDays className="mr-1 inline size-3" aria-hidden />
            Your dates are checked again at secure Stripe checkout.
          </p>
        </form>
      </div>
    </div>
  )
}
