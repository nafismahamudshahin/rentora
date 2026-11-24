"use client"

// components/payment/payment-result.tsx
// Shown after Stripe sends the customer back from Checkout. The server checks
// the session before we display "paid", so the browser cannot fake a result.

import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowLeft, CheckCircle2, CreditCard, Loader2, XCircle } from "lucide-react"

import { verifyPayment } from "@/backend-api/action/payments"
import { normalizeRole } from "@/components/dashboard/nav-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAsync } from "@/hooks/use-async"
import { authClient } from "@/lib/auth-client"
import { bdt, formatDateRange } from "@/lib/format"

type PaymentResultProps = {
  sessionId: string
  equipmentId: string
}

export function PaymentResult({ sessionId, equipmentId }: PaymentResultProps) {
  const { data: session } = authClient.useSession()
  const role = normalizeRole(
    (session?.user as { role?: string | null } | undefined)?.role
  )
  const bookingsHref = role === "admin" ? "/dashboard/all-rentals" : "/dashboard/rentals"
  const bookingsLabel = role === "admin" ? "View all rentals" : "View my bookings"

  const {
    data,
    loading,
    error,
    reload,
  } = useAsync(
    () => (sessionId ? verifyPayment(sessionId) : Promise.resolve(null)),
    [sessionId]
  )

  const detailsHref = equipmentId
    ? `/equipment/${encodeURIComponent(equipmentId)}`
    : "/equipment"

  if (!sessionId) {
    return (
      <ResultCard
        icon={<XCircle className="size-8 text-stone-400" aria-hidden />}
        title="No payment session found"
        message="Open a listing, choose your dates, then press Book now to start a secure checkout."
        href="/equipment"
        linkLabel="Browse equipment"
      />
    )
  }

  if (loading) {
    return (
      <ResultCard
        icon={<Loader2 className="size-8 animate-spin text-[#FF6B2C]" aria-hidden />}
        title="Checking your payment..."
        message="This usually takes just a moment."
      />
    )
  }

  if (error) {
    return (
      <ResultCard
        icon={<XCircle className="size-8 text-red-500" aria-hidden />}
        title="Couldn't verify this payment"
        message="Sign in with the account you used to pay, then try again."
        action={
          <Button
            type="button"
            variant="outline"
            className="mt-6 rounded-full"
            onClick={reload}
          >
            Try again
          </Button>
        }
      />
    )
  }

  if (!data?.paid) {
    return (
      <ResultCard
        icon={<CreditCard className="size-8 text-stone-400" aria-hidden />}
        title="Payment not completed"
        message="Your card may not have been charged. Return to the listing to try again."
        href={detailsHref}
        linkLabel="Back to listing"
      />
    )
  }

  return (
    <ResultCard
      icon={<CheckCircle2 className="size-8 text-emerald-600" aria-hidden />}
      title="Booking confirmed"
      message="Thanks! Your payment was received and your rental request is now with the owner."
      href={bookingsHref}
      linkLabel={bookingsLabel}
      extra={
        <div className="mt-6 rounded-2xl bg-[#FAF7F2] p-5 text-left">
          <p className="text-xs font-semibold tracking-wide text-stone-500 uppercase">
            Amount paid
          </p>
          <p className="mt-1 font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-[#111827]">
            {bdt(data.amount || 0)}
          </p>
          {data.startDate && data.endDate ? (
            <p className="mt-2 text-sm text-stone-600">
              {formatDateRange(data.startDate, data.endDate)}
            </p>
          ) : null}
          {data.bookingCode ? (
            <p className="mt-1 text-sm font-semibold text-[#111827]">
              Booking code: {data.bookingCode}
            </p>
          ) : null}
          {data.reference ? (
            <p className="mt-2 break-all text-xs text-stone-500">
              Reference: {data.reference}
            </p>
          ) : null}
        </div>
      }
    />
  )
}

function ResultCard({
  icon,
  title,
  message,
  href,
  linkLabel,
  action,
  extra,
}: {
  icon: ReactNode
  title: string
  message: string
  href?: string
  linkLabel?: string
  action?: ReactNode
  extra?: ReactNode
}) {
  return (
    <Card className="mx-auto w-full max-w-xl rounded-[26px] border-[#EDE6D8] bg-white text-center shadow-[0_18px_36px_-18px_rgba(17,24,39,.18)]">
      <CardContent className="p-8 sm:p-10">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#FFF4ED]">
          {icon}
        </div>
        <h1 className="mt-5 font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-[#111827]">
          {title}
        </h1>
        <p className="mt-3 text-stone-600">{message}</p>
        {extra}
        {action}
        {href && linkLabel ? (
          <Button
            render={<Link href={href} />}
            nativeButton={false}
            variant="outline"
            className="mt-6 h-11 rounded-full border-[#EDE6D8] font-semibold"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {linkLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default PaymentResult
