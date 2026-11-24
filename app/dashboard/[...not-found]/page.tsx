// app/dashboard/[...not-found]/page.tsx
// Unmatched URLs normally fall back to the root not-found (site chrome).
// Matching them here lets the nearest boundary — app/dashboard/not-found.tsx —
// render inside the dashboard shell instead.

import { notFound } from "next/navigation"

export default function DashboardCatchAllPage() {
  notFound()
}
