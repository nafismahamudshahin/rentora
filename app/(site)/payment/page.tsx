// app/(site)/payment/page.tsx
import Link from "next/link"
import type { Metadata } from "next"

import { PaymentPage } from "@/components/payment/payment-page"

export const metadata: Metadata = {
  title: "Book and pay | Rentora",
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    equipmentId?: string
    startDate?: string
    endDate?: string
    payment?: string
    holdId?: string
  }>
}) {
  const params = await searchParams

  return (
    <main className="bg-[#FAF7F2]">
      <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <nav aria-label="Breadcrumb" className="mb-7 text-sm text-stone-500">
          <Link href="/equipment" className="hover:text-[#111827]">
            All Equipment
          </Link>
          <span className="mx-2">/</span>
          <span className="font-semibold text-[#111827]">Book and pay</span>
        </nav>

        <PaymentPage
          equipmentId={params.equipmentId || ""}
          startDate={params.startDate || ""}
          endDate={params.endDate || ""}
          cancelled={params.payment === "cancelled"}
          holdId={params.holdId || ""}
        />
      </div>
    </main>
  )
}
