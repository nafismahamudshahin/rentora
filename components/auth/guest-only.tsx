"use client"

// Keeps signed-in users away from /login and /sign-up.
// The check runs once on mount so it never fights the form's own redirect
// after a successful sign-in or sign-up.

import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

function AuthLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div
        role="status"
        aria-label="Checking session"
        className="size-8 animate-spin rounded-full border-4 border-[#FF6B2C]/25 border-t-[#FF6B2C]"
      />
    </div>
  )
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const checked = useRef(false)

  useEffect(() => {
    if (isPending || checked.current) return
    checked.current = true
    if (session?.user) router.replace("/dashboard")
  }, [isPending, session, router])

  if (isPending || session?.user) return <AuthLoader />

  return <>{children}</>
}
