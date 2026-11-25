// app/loading.tsx
// Root loading boundary. Nested (site) and dashboard boundaries have their own
// labels, but this covers any other route under the root layout.

import { PageLoader } from "@/components/layout/page-loader"

export default function Loading() {
  return <PageLoader className="min-h-dvh" label="Loading Rentora" />
}
