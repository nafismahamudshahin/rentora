// components/layout/page-loader.tsx
// Shared fallback for app/**/loading.tsx files. Server Component: no client
// JavaScript is needed to show it while a route segment streams in.

import { cn } from "@/lib/utils"

type PageLoaderProps = {
  label?: string
  className?: string
}

export function PageLoader({
  label = "Loading page",
  className,
}: PageLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-[60vh] w-full flex-col items-center justify-center gap-3 px-6 text-center",
        className
      )}
    >
      <span
        aria-hidden
        className="size-10 animate-spin rounded-full border-4 border-[#FF6B2C]/20 border-t-[#FF6B2C]"
      />
      <span className="text-sm font-medium text-stone-500">{label}</span>
    </div>
  )
}
