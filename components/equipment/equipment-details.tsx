"use client"

// components/equipment/equipment-details.tsx
// Public equipment page. Reads one listing and a few related items from the
// Express API; the favorite button uses the same shared hook as the catalog.

import Link from "next/link"
import { useCallback, useState } from "react"
import {
  ArrowLeft,
  Boxes,
  CalendarDays,
  Check,
  ChevronRight,
  Heart,
  MapPin,
  Share2,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"

import { getEquipment, getEquipmentById } from "@/backend-api/api/equipment"
import type { Equipment } from "@/backend-api/types"
import { BookingModal } from "@/components/equipment/booking-modal"
import { EquipmentCard } from "@/components/equipment/equipment-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useAsync } from "@/hooks/use-async"
import { useFavorites } from "@/hooks/use-favorites"
import { authClient } from "@/lib/auth-client"
import { bdt } from "@/lib/format"
import { unitsOf } from "@/lib/booking"
import { cn } from "@/lib/utils"

type EquipmentDetailsProps = {
  id: string
}

function DetailsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <Skeleton className="h-4 w-64" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <div className="space-y-4">
          <Skeleton className="aspect-[4/3] w-full rounded-[26px]" />
          <Skeleton className="h-24 w-full rounded-[22px]" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-[26px]" />
          <Skeleton className="h-40 w-full rounded-[22px]" />
        </div>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-xl rounded-[26px] border-[#EDE6D8] bg-white p-10 text-center">
        <p className="text-sm font-semibold text-[#FF6B2C]">404</p>
        <h1 className="mt-2 font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-[#111827]">
          Equipment not found
        </h1>
        <p className="mt-3 text-stone-600">
          This listing may have been removed. Browse the catalog to find
          something similar.
        </p>
        <Button
          render={<Link href="/equipment" />}
          nativeButton={false}
          className="mt-6 rounded-full bg-[#FF6B2C] px-6 font-bold text-[#111827] hover:bg-[#FF6B2C]/90"
        >
          Browse all equipment
        </Button>
      </Card>
    </div>
  )
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[#EDE6D8] bg-white p-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#FFF4ED] text-[#9A3412]">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-wide text-stone-500 uppercase">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-[#111827]">
          {value}
        </p>
      </div>
    </div>
  )
}

export function EquipmentDetails({ id }: EquipmentDetailsProps) {
  const [bookingOpen, setBookingOpen] = useState(false)
  const closeBooking = useCallback(() => setBookingOpen(false), [])
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const favorites = useFavorites()
  const {
    data: item,
    loading,
    error,
    reload,
  } = useAsync(() => getEquipmentById(id), [id])
  const { data: related = [] } = useAsync(
    () =>
      item ? getEquipment({ category: item.category }) : Promise.resolve([]),
    [item?.category]
  )

  if (loading) return <DetailsSkeleton />

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-xl rounded-[26px] border-[#EDE6D8] bg-white p-10 text-center">
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-[#111827]">
            Couldn&apos;t load this listing
          </h1>
          <p className="mt-2 text-stone-600">
            Check your connection and try again.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-6 rounded-full"
            onClick={reload}
          >
            Try again
          </Button>
        </Card>
      </div>
    )
  }

  if (!item) return <NotFound />

  const isFavorite = favorites.favoriteIds.has(item.id)
  const relatedItems = related
    .filter((candidate) => candidate.id !== item.id)
    .slice(0, 3)

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard")
    } catch {
      toast.error("Could not copy the link")
    }
  }

  const stock = unitsOf(item.availableQuantity)
  // Bookings are customer-only. Owners and admins manage listings instead.
  const signedIn = Boolean(session?.user)
  const customerOnly =
    !sessionPending && signedIn && session?.user.role !== "customer"
  const canOpenBooking =
    !customerOnly && item.status !== "Hidden" && !sessionPending

  function openBooking() {
    if (!canOpenBooking) return
    setBookingOpen(true)
  }

  return (
    <main className="bg-[#FAF7F2]">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-sm text-stone-500"
        >
          <Link href="/" className="hover:text-[#111827]">
            Home
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <Link href="/equipment" className="hover:text-[#111827]">
            Equipment
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="font-semibold text-[#111827]">{item.name}</span>
        </nav>

        <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
          {/* Left: photo and details */}
          <div className="min-w-0 space-y-6">
            <div className="relative overflow-hidden rounded-[26px] border border-[#EDE6D8] bg-white shadow-[0_18px_36px_-18px_rgba(17,24,39,.18)]">
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="grid size-full place-items-center bg-[radial-gradient(rgba(17,24,39,.06)_1px,transparent_1px)] [background-size:20px_20px]">
                    <div className="text-center">
                      <div className="mx-auto grid size-14 place-items-center rounded-full bg-[#FFF4ED] text-[#9A3412]">
                        <ShieldCheck className="size-6" aria-hidden />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-stone-500">
                        No photo for this listing yet
                      </p>
                    </div>
                  </div>
                )}

                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <Badge className="rounded-full border-0 bg-white/95 text-[#111827] shadow-sm">
                    {item.category}
                  </Badge>
                </div>

                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  aria-label={
                    isFavorite
                      ? `Remove ${item.name} from favorites`
                      : `Add ${item.name} to favorites`
                  }
                  aria-pressed={isFavorite}
                  disabled={
                    favorites.pendingId === item.id || favorites.loading
                  }
                  onClick={() => favorites.toggleFavorite(item)}
                  className="absolute top-4 right-4 size-10 rounded-full border border-white/70 bg-white/90 text-[#111827] shadow-sm backdrop-blur hover:bg-white"
                >
                  <Heart
                    aria-hidden
                    className={cn(
                      "size-[18px]",
                      isFavorite && "fill-[#FF6B2C] text-[#FF6B2C]"
                    )}
                  />
                </Button>
              </div>
            </div>

            <Card className="rounded-[26px] border-[#EDE6D8] bg-white">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
                      {item.name}
                    </h1>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-stone-600">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-4 text-[#FF6B2C]" aria-hidden />
                        {item.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Star
                          className="size-4 fill-[#B45309] text-[#B45309]"
                          aria-hidden
                        />
                        {item.rating > 0
                          ? `${item.rating.toFixed(1)} rating`
                          : "New listing"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <UserRound
                          className="size-4 text-stone-400"
                          aria-hidden
                        />
                        Listed by {item.ownerName || "a Rentora owner"}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className="my-6 bg-[#EDE6D8]" />

                <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-[#111827]">
                  About this equipment
                </h2>
                <p className="mt-3 leading-7 text-stone-600">
                  {item.description ||
                    `${item.name} is a ${item.category.toLowerCase()} item available in ${item.location}. The owner hasn't added a longer description yet — use the details below to decide if it fits your project.`}
                </p>
              </CardContent>
            </Card>

            <section aria-labelledby="facts-heading">
              <h2
                id="facts-heading"
                className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-[#111827]"
              >
                Quick facts
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Fact
                  icon={CalendarDays}
                  label="Rental type"
                  value={item.rentalType || "Daily"}
                />
                <Fact
                  icon={Boxes}
                  label="Available quantity"
                  value={`${stock} unit${stock === 1 ? "" : "s"}`}
                />
                <Fact
                  icon={ShieldCheck}
                  label="Review status"
                  value={item.reviewStatus}
                />
                <Fact icon={MapPin} label="Pickup area" value={item.location} />
              </div>
            </section>
          </div>

          {/* Right: booking-style summary card */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card className="overflow-hidden rounded-[26px] border-[#EDE6D8] bg-white shadow-[0_18px_36px_-18px_rgba(17,24,39,.18)]">
              <CardContent className="p-6 sm:p-7">
                <p className="text-sm font-semibold text-stone-500">
                  Rental price
                </p>
                <div className="mt-1 flex items-end gap-1.5">
                  <span className="font-[family-name:var(--font-space-grotesk)] text-4xl font-bold text-[#111827]">
                    {bdt(item.pricePerDay)}
                  </span>
                  <span className="pb-1 text-sm font-medium text-stone-500">
                    / day
                  </span>
                </div>

                <Separator className="my-6 bg-[#EDE6D8]" />

                <p className="text-sm font-semibold text-[#111827]">
                  Ready to book?
                </p>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">
                  Choose your dates, quantity and delivery details in the next
                  step. We check live availability before payment.
                </p>
                {customerOnly ? (
                  <p className="mt-2 text-xs font-semibold text-[#9A3412]">
                    Only customer accounts can book. Owners and admins manage
                    listings.
                  </p>
                ) : null}

                <div className="mt-5 rounded-2xl border border-[#EDE6D8] bg-[#FAF7F2] p-4">
                  <div className="flex items-center justify-between text-sm text-stone-600">
                    <span>
                      {stock} unit{stock === 1 ? "" : "s"} ready to rent
                    </span>
                    <span className="font-semibold text-[#111827]">
                      No hidden fees
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  disabled={!canOpenBooking}
                  onClick={openBooking}
                  className="mt-5 h-12 w-full rounded-full bg-[#FF6B2C] font-bold text-[#111827] hover:bg-[#FF6B2C]/90 disabled:opacity-60"
                >
                  <CalendarDays className="size-4" aria-hidden />
                  {item.status === "Hidden"
                    ? "Not available right now"
                    : customerOnly
                      ? "Customers only"
                      : sessionPending
                        ? "Checking session..."
                        : "Book now"}
                </Button>
                <p className="mt-2 text-center text-xs text-stone-500">
                  Dates, quantity, delivery details and secure Stripe checkout
                </p>

                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    favorites.pendingId === item.id || favorites.loading
                  }
                  onClick={() => favorites.toggleFavorite(item)}
                  className={cn(
                    "mt-3 h-12 w-full rounded-full font-bold",
                    isFavorite
                      ? "bg-[#111827] text-white hover:bg-[#111827]/90"
                      : "bg-[#FF6B2C] text-[#111827] hover:bg-[#FF6B2C]/90"
                  )}
                >
                  <Heart
                    aria-hidden
                    className={cn("size-4", isFavorite && "fill-current")}
                  />
                  {isFavorite ? "Saved to favorites" : "Save to favorites"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={share}
                  className="mt-3 h-12 w-full rounded-full border-[#EDE6D8] font-semibold"
                >
                  <Share2 className="size-4" aria-hidden />
                  Share this listing
                </Button>

                <Button
                  render={<Link href="/equipment" />}
                  nativeButton={false}
                  variant="ghost"
                  className="mt-2 h-11 w-full rounded-full font-semibold text-stone-600 hover:text-[#111827]"
                >
                  <ArrowLeft className="size-4" aria-hidden />
                  Back to all equipment
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-4 rounded-[26px] border-[#EDE6D8] bg-white">
              <CardContent className="p-6">
                <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-[#111827]">
                  How renting works
                </h2>
                <ol className="mt-4 space-y-3 text-sm text-stone-600">
                  {[
                    "Find the gear you need and save it to favorites.",
                    "Agree on dates and price with the owner.",
                    "Pick it up, use it, and return it on time.",
                  ].map((step, index) => (
                    <li key={step} className="flex gap-3">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#FFF4ED] text-xs font-bold text-[#9A3412]">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <Check className="mt-5 size-5 text-emerald-600" aria-hidden />
                <p className="mt-1 text-xs text-stone-500">
                  Listings are reviewed before they appear on Rentora.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>

        {relatedItems.length > 0 ? (
          <section className="mt-16" aria-labelledby="related-heading">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2
                  id="related-heading"
                  className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-[#111827]"
                >
                  More in {item.category}
                </h2>
                <p className="mt-1 text-stone-600">
                  Similar gear you might also like.
                </p>
              </div>
              <Link
                href="/equipment"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#9A3412] hover:underline"
              >
                See all equipment
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            </div>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedItems.map((relatedItem: Equipment) => (
                <li key={relatedItem.id}>
                  <EquipmentCard
                    item={relatedItem}
                    isFavorite={favorites.favoriteIds.has(relatedItem.id)}
                    pending={
                      favorites.pendingId === relatedItem.id ||
                      favorites.loading
                    }
                    onToggleFavorite={favorites.toggleFavorite}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <BookingModal
        item={item}
        open={bookingOpen}
        onClose={closeBooking}
        signedIn={signedIn}
        customerOnly={customerOnly}
        sessionPending={sessionPending}
      />
    </main>
  )
}

export default EquipmentDetails
