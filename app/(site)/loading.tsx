// app/(site)/loading.tsx
// Navbar and Footer stay visible from the site layout while the page loads.

import { PageLoader } from "@/components/layout/page-loader"

export default function Loading() {
  return <PageLoader label="Loading page" />
}
