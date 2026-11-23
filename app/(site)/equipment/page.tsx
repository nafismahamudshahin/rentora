// app/(site)/equipment/page.tsx
import type { Metadata } from "next"

import { EquipmentCatalog } from "@/components/equipment/equipment-catalog"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "All equipment | Rentora",
  description:
    "Search and filter every piece of equipment available on Rentora.",
}

export default function EquipmentPage() {
  return (
    <main className="bg-[#FAF7F2]">
      <div className="container mx-auto px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <Suspense fallback={null}>
          <EquipmentCatalog />
        </Suspense>
      </div>
    </main>
  )
}