// app/(site)/equipment/page.tsx
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"

import { EquipmentCatalog } from "@/components/equipment/equipment-catalog"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "All equipment | Rentora",
  description:
    "Search and filter every piece of equipment available on Rentora.",
}

const perks = ["Approved listings", "Secure Stripe payments", "Flexible dates"]

export default function EquipmentPage() {
  return (
    <main className="bg-[#FAF7F2]">
      <section className="border-b border-[#e8e2d8] bg-white">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <span
            className="mb-4 block h-[5px] w-11 rounded-full bg-[#FF6B2C]"
            aria-hidden
          />
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl leading-[1.1] font-bold tracking-[-0.04em] text-[#111827] sm:text-5xl lg:text-6xl">
                All equipment
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-stone-600">
                Find the right gear from trusted local owners. Search, compare
                and book in a few simple steps.
              </p>
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-600">
                {perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-1.5">
                    <Check className="size-4 text-green-700" aria-hidden />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/how-it-works"
                className={cn(
                  buttonVariants(),
                  "h-11 rounded-full bg-[#FF6B2C] px-5 font-bold text-[#111827] hover:bg-[#FF6B2C]/90"
                )}
              >
                How it works
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/contact"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-11 rounded-full border-[#EDE6D8] bg-white px-5 font-semibold text-[#111827] hover:bg-stone-50"
                )}
              >
                Need help?
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Suspense fallback={null}>
          <EquipmentCatalog />
        </Suspense>
      </div>
    </main>
  )
}
