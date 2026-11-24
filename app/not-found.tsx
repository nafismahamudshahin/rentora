// app/not-found.tsx
// Fallback for URLs that don't match any route. Unmatched URLs skip nested
// layouts, so the site chrome is included here explicitly.

import type { Metadata } from "next"

import { Footer } from "@/components/layout/footer"
import { Navbar } from "@/components/layout/Navbar"
import { NotFoundView } from "@/components/layout/not-found-view"

export const metadata: Metadata = {
  title: "Page not found | Rentora",
}

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <NotFoundView />
      <Footer />
    </div>
  )
}
