"use client"

// components/payment/payment-page.tsx
// The step between choosing dates and paying. It shows the real listing, a
// day-by-day price breakdown, and the delivery form Stripe needs before we
// can create a booking.

import Link from "next/link"
import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Loader2,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react"
import { toast } from "sonner"

import { getEquipmentById, getUnavailableDates } from "@/backend-api/api/equipment"
import { cancelHold, createCheckout } from "@/backend-api/action/payments"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useAsync } from "@/hooks/use-async"
import { authClient } from "@/lib/auth-client"
import { bdt, formatDateRange } from "@/lib/format"
import { bookingDays, todayIso, validateBookingRange } from "@/lib/booking"
import { cn } from "@/lib/utils"

type PaymentPageProps = {
  equipmentId: string
  startDate: string
  endDate: string
  cancelled: boolean
  holdId: string
}

export function PaymentPage({
  equipmentId,
  startDate,
  endDate,
  cancelled,
  holdId,
}: PaymentPageProps) {
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState("")

  const {
    data: item,
    loading,
    error,
  } = useAsync(
    () =>
      equipmentId
        ? getEquipmentById(equipmentId)
        : Promise.resolve(undefined),
    [equipmentId]
  )
  const { data: blocked = [] } = useAsync(
    () => (equipmentId ? getUnavailableDates(equipmentId) : Promise.resolve([])),
    [equipmentId]
  )

  // When Stripe is cancelled, release the dates we held at checkout.
  useEffect(() => {
    if (cancelled && holdId) {
      cancelHold(holdId).catch(() => {
        // The hold expires by itself after 30 minutes, so this is not fatal.
      })
    }
  }, [cancelled, holdId])

  const days = startDate && endDate ? bookingDays(startDate, endDate) : 0
  const rangeError = validateBookingRange(startDate, endDate, blocked, todayIso())
  const validRange = days > 0 && !rangeError
  const total = item && validRange ? item.pricePerDay * days : 0

  const backHref = equipmentId
    ? `/equipment/${encodeURIComponent(equipmentId)}`
    : "/equipment"
  const paymentHref = `/payment?${new URLSearchParams({
    equipmentId,
    startDate,
    endDate,
  }).toString()}`

  async function pay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPayError("")

    if (!item || !validRange) return
    if (!phone.trim() || !address.trim()) {
      setPayError("Enter your phone number and delivery address.")
      return
    }

    setPaying(true)
    try {
      const checkout = await createCheckout({
        equipmentId: item.id,
        startDate,
        endDate,
        phone: phone.trim(),
        address: address.trim(),
      })
      window.location.href = checkout.url
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Could not start checkout"
      setPayError(message)
      toast.error(message)
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <Skeleton className="h-96 rounded-[26px]" />
        <Skeleton className="h-96 rounded-[26px]" />
      </div>
    )
  }

  if (error || !item) {
    return (
      <Card className="mx-auto max-w-xl rounded-[26px] border-[#EDE6D8] bg-white p-10 text-center">
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-[#111827]">
          This listing is not available
        </h1>
        <p className="mt-2 text-stone-600">
          Go back to the equipment page and choose a listing again.
        </p>
        <Button render={<Link href="/equipment" />} nativeButton={false} className="mt-6 rounded-full">
          Browse equipment
        </Button>
      </Card>
    )
  }

  if (!validRange) {
    return (
      <Card className="mx-auto max-w-xl rounded-[26px] border-[#EDE6D8] bg-white p-10 text-center">
        <CalendarDays className="mx-auto size-8 text-[#FF6B2C]" aria-hidden />
        <h1 className="mt-4 font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-[#111827]">
          {rangeError || "Choose your rental dates first"}
        </h1>
        <p className="mt-2 text-stone-600">
          Pick dates that are free, then continue to payment.
        </p>
        <Button
          render={<Link href={backHref} />}
          nativeButton={false}
          className="mt-6 rounded-full"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Choose dates
        </Button>
      </Card>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
      {/* Left: the real listing and the delivery form */}
      <div className="space-y-6">
        <Card className="overflow-hidden rounded-[26px] border-[#EDE6D8] bg-white">
          <div className="relative aspect-[16/8] bg-stone-100">
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image} alt={item.name} className="size-full object-cover" />
            ) : (
              <div className="grid size-full place-items-center bg-[radial-gradient(rgba(17,24,39,.06)_1px,transparent_1px)] [background-size:20px_20px]">
                <ShieldCheck className="size-8 text-stone-400" aria-hidden />
              </div>
            )}
          </div>
          <CardContent className="p-6 sm:p-8">
            <p className="text-xs font-bold tracking-wide text-[#9A3412] uppercase">
              {item.category}
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-[#111827]">
              {item.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-stone-600">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4 text-[#FF6B2C]" aria-hidden />
                {item.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="size-4 fill-[#B45309] text-[#B45309]" aria-hidden />
                {item.rating > 0 ? `${item.rating.toFixed(1)} rating` : "New listing"}
              </span>
              <span>Listed by {item.ownerName || "a Rentora owner"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[26px] border-[#EDE6D8] bg-white">
          <CardContent className="p-6 sm:p-8">
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-[#111827]">
              Delivery information
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              The owner uses these details to arrange your rental.
            </p>

            {cancelled ? (
              <div className="mt-5 rounded-2xl bg-[#FFF7ED] p-4 text-sm text-[#9A3412]">
                Payment cancelled. Your dates are free again — review and try again.
              </div>
            ) : null}

            {!sessionPending && !session?.user ? (
              <div className="mt-5 rounded-2xl bg-[#FFF7ED] p-4 text-sm text-[#9A3412]">
                <Link
                  href={`/login?next=${encodeURIComponent(paymentHref)}`}
                  className="font-bold underline"
                >
                  Sign in
                </Link>{" "}
                to pay and create your booking.
              </div>
            ) : null}

            {payError ? (
              <p className="mt-5 flex items-start gap-2 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
                <AlertCircle className="size-4 shrink-0" aria-hidden />
                {payError}
              </p>
            ) : null}

            <form onSubmit={pay} className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="delivery-phone">Phone number</Label>
                <Input
                  id="delivery-phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="h-12 rounded-xl border-[#EDE6D8]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="delivery-address">Delivery address</Label>
                <Input
                  id="delivery-address"
                  required
                  autoComplete="street-address"
                  placeholder="House, road, area, city"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className="h-12 rounded-xl border-[#EDE6D8]"
                />
              </div>
              <Button
                type="submit"
                disabled={paying || sessionPending || !session?.user}
                className={cn(
                  "h-12 w-full rounded-full bg-[#FF6B2C] font-bold text-[#111827]",
                  "hover:bg-[#FF6B2C]/90 disabled:opacity-60"
                )}
              >
                {paying ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <CreditCard className="size-4" aria-hidden />
                )}
                {paying
                  ? "Opening checkout..."
                  : `Pay ${bdt(total)} and book`}
              </Button>
              <p className="text-center text-xs text-stone-500">
                Secure payment by Stripe. Your dates are held during checkout.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right: every calculation in one card */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Card className="overflow-hidden rounded-[26px] border-[#EDE6D8] bg-white shadow-[0_18px_36px_-18px_rgba(17,24,39,.18)]">
          <CardContent className="p-6 sm:p-7">
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-[#111827]">
              Booking summary
            </h2>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-stone-500">Rental period</dt>
                <dd className="text-right font-semibold text-[#111827]">
                  {formatDateRange(startDate, endDate)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-stone-500">Duration</dt>
                <dd className="font-semibold text-[#111827]">
                  {days} {days === 1 ? "day" : "days"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-stone-500">Price per day</dt>
                <dd className="font-semibold text-[#111827]">
                  {bdt(item.pricePerDay)}
                </dd>
              </div>
            </dl>

            <Separator className="my-5 bg-[#EDE6D8]" />

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-stone-600">
                <span>
                  {bdt(item.pricePerDay)} × {days} {days === 1 ? "day" : "days"}
                </span>
                <span>{bdt(total)}</span>
              </div>
              <div className="flex items-center justify-between text-stone-600">
                <span>Delivery arrangement</span>
                <span className="font-semibold text-emerald-700">Included</span>
              </div>
            </div>

            <Separator className="my-5 bg-[#EDE6D8]" />

            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#111827]">Total due today</span>
              <span className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-[#111827]">
                {bdt(total)}
              </span>
            </div>

            <Button
              render={<Link href={backHref} />}
              nativeButton={false}
              variant="ghost"
              className="mt-5 h-11 w-full rounded-full font-semibold text-stone-600 hover:text-[#111827]"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Change dates
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}

export default PaymentPage
