"use client"

// app/dashboard/page.tsx

import { motion, useReducedMotion } from "framer-motion"
import type { Variants } from "framer-motion"
import { ArrowUpRight } from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { normalizeRole } from "@/components/dashboard/nav-config"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getOverview } from "@/backend-api/api/overview"
import { useAsync } from "@/hooks/use-async"

export default function DashboardOverviewPage() {
  const reduce = useReducedMotion() ?? false
  const { data: session, isPending } = authClient.useSession()
  const role = normalizeRole(
    (session?.user as { role?: string | null } | undefined)?.role
  )
  const userId = session?.user?.id
  const firstName = session?.user?.name?.split(" ")[0]

  const {
    data: stats = [],
    loading,
    error,
    reload,
  } = useAsync(
    () => (userId ? getOverview() : Promise.resolve([])),
    [role, userId]
  )

  const grid: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduce ? 0 : 0.08, delayChildren: 0.1 },
    },
  }
  const card: Variants = {
    hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  }

  const busy = isPending || !userId || loading

  return (
    <>
      <PageHeader
        title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        description="Here's what's happening on your account."
      />

      {error ? (
        <div className="rounded-2xl bg-white p-6 text-center shadow-[0_8px_30px_-12px_rgba(17,24,39,0.18)]">
          <p className="text-sm font-semibold">Couldn’t load your overview.</p>
          <Button type="button" size="sm" variant="outline" onClick={reload}>
            Try again
          </Button>
        </div>
      ) : busy ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_-12px_rgba(17,24,39,0.18)]"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-4 h-9 w-20" />
              <Skeleton className="mt-2 h-3 w-28" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          variants={grid}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              variants={card}
              whileHover={reduce ? undefined : { y: -4 }}
              className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_-12px_rgba(17,24,39,0.18)]"
            >
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-stone-600">{s.label}</p>
                <span className="grid size-7 place-items-center rounded-full bg-[#FF6B2C]/15 text-[#8A3300]">
                  <ArrowUpRight className="size-3.5" />
                </span>
              </div>
              <p className="mt-3 font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-stone-500">{s.hint}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </>
  )
}
