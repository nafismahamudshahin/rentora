// app/(site)/payment/success/page.tsx
import type { Metadata } from "next"

import { PaymentResult } from "@/components/payment/payment-result"

export const metadata: Metadata = {
  title: "Payment status | Rentora",
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; equipment_id?: string }>
}) {
  const params = await searchParams

  return (
    <main className="bg-[#FAF7F2]">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <PaymentResult
          sessionId={params.session_id || ""}
          equipmentId={params.equipment_id || ""}
        />
      </div>
    </main>
  )
}
