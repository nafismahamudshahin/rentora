// components/layout/not-found-view.tsx
// Shared 404 UI. Chrome (Navbar/Footer or the dashboard shell) comes from the
// layout of the segment that renders this, so it is never duplicated here.

import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  /** Compact card that sits inside the dashboard's <main>. */
  compact?: boolean
}

const BASE_LINK =
  "h-11 rounded-xl px-6 font-bold transition-transform hover:-translate-y-0.5"

export function NotFoundView({ compact = false }: Props) {
  if (compact) {
    return (
      <section className="flex flex-col items-center rounded-2xl bg-white px-6 py-16 text-center shadow-[0_8px_30px_-12px_rgba(17,24,39,0.18)]">
        <p className="font-[family-name:var(--font-space-grotesk)] text-7xl leading-none font-bold tracking-tight text-[#FF6B2C] sm:text-8xl">
          404
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tracking-tight sm:text-3xl">
          Page not found
        </h1>
        <p className="mt-2 max-w-sm text-sm text-stone-600">
          This page isn’t part of your dashboard. It may have moved or never
          existed.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants(),
              BASE_LINK,
              "bg-[#FF6B2C] text-[#111827] shadow-[0_10px_22px_-10px_rgba(255,107,44,.75)] hover:bg-[#FF6B2C]/90"
            )}
          >
            Back to dashboard
          </Link>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline" }),
              BASE_LINK,
              "border-[#111827] bg-white text-[#111827] hover:bg-white dark:border-[#111827] dark:bg-white dark:text-[#111827]"
            )}
          >
            Go to website
          </Link>
        </div>
      </section>
    )
  }

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#FAF7F2] py-16 text-[#111827]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#E4DBC9_1px,transparent_1px)] [background-size:24px_24px]"
      />
      <div className="relative container mx-auto flex flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        <div className="flex max-w-xl flex-col items-center text-center">
          <p className="font-[family-name:var(--font-space-grotesk)] text-[120px] leading-none font-bold tracking-tight text-[#FF6B2C] sm:text-[160px]">
            404
          </p>
          <h1 className="mt-6 font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight sm:text-4xl">
            This page went off-site
          </h1>
          <p className="mt-4 max-w-sm text-stone-600">
            The page you are looking for does not exist or was moved.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className={cn(
                buttonVariants(),
                BASE_LINK,
                "bg-[#FF6B2C] text-[#111827] shadow-[0_10px_22px_-10px_rgba(255,107,44,.75)] hover:bg-[#FF6B2C]/90"
              )}
            >
              Back to home
            </Link>
            <Link
              href="/equipment"
              className={cn(
                buttonVariants({ variant: "outline" }),
                BASE_LINK,
                "border-[#111827] bg-white text-[#111827] hover:bg-white dark:border-[#111827] dark:bg-white dark:text-[#111827] dark:hover:bg-white"
              )}
            >
              Browse equipment
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
