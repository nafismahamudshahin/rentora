// app/dashboard/loading.tsx
// DashboardShell stays mounted, so only the page area shows this spinner.

import { PageLoader } from "@/components/layout/page-loader"

export default function Loading() {
  return <PageLoader className="min-h-[70vh]" label="Loading dashboard" />
}
