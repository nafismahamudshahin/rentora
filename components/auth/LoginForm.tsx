"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { GoogleAuthButton } from "@/components/auth/google-auth-button"

const EASE = [0.22, 1, 0.36, 1] as const

export function LoginForm() {
  const router = useRouter()
  const reduce = useReducedMotion() ?? false

  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const data = new FormData(e.currentTarget)
    const email = String(data.get("email") ?? "").trim()
    const password = String(data.get("password") ?? "")

    if (!email || !password) {
      setError("Enter your email and password.")
      return
    }

    setBusy(true)
    try {
      const { error: authError } = await authClient.signIn.email({
        email,
        password,
      })

      if (authError) {
        setError(authError.message ?? "Invalid email or password.")
        setBusy(false)
        return
      }

      toast.success("Logged in successfully")
      // Booking links send guests here with ?next=/payment?...
      const next = new URLSearchParams(window.location.search).get("next")
      const target =
        next && next.startsWith("/") && !next.startsWith("//") ? next : "/"
      router.push(target)
      router.refresh()
    } catch {
      setError("Something went wrong. Try again.")
      setBusy(false)
    }
  }

  return (
    // overflow-x-clip stops the decorative circle from creating a scrollbar;
    // min-h-dvh avoids the mobile-browser 100vh bug.
    <div className="grid min-h-dvh overflow-x-clip bg-[#FAF7F2] lg:grid-cols-2">
      {/* Brand panel: stays pinned to the viewport while the form side scrolls */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#111827] p-8 text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:p-12 xl:p-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:22px_22px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -bottom-24 size-72 rounded-full bg-[#FF6B2C] lg:-right-32 lg:-bottom-32 lg:size-96"
        />

        <Link
          href="/"
          className="relative flex items-center gap-2.5 font-[family-name:var(--font-space-grotesk)] text-2xl font-bold"
        >
          <span className="grid size-10 place-items-center rounded-[10px] bg-[#FF6B2C] text-[#111827]">
            R
          </span>
          Rentora
        </Link>

        <div className="relative">
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl leading-[1.08] font-bold tracking-[-0.03em] text-white xl:text-5xl">
            Welcome back.
            <br />
            <span className="text-[#FF6B2C]">Gear is waiting.</span>
          </h1>
          <p className="mt-4 max-w-sm text-gray-300">
            Log in to book equipment or manage your listings.
          </p>
        </div>

        <p className="relative text-sm text-gray-300">
          Secure payments by Stripe
        </p>
      </aside>

      {/* Form */}
      <main className="container mx-auto flex min-w-0 items-center justify-center bg-[#FAF7F2] px-4 pt-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:pt-14 sm:pb-[max(3.5rem,env(safe-area-inset-bottom))] lg:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="w-full max-w-[420px]"
        >
          <Link
            href="/"
            className="mb-6 flex items-center gap-2.5 font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-[#111827] sm:mb-8 lg:hidden"
          >
            <span className="grid size-9 place-items-center rounded-[10px] bg-[#111827] text-[#FF6B2C]">
              R
            </span>
            Rentora
          </Link>

          <span
            className="mb-3.5 block h-[5px] w-11 rounded-full bg-[#FF6B2C]"
            aria-hidden
          />
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-[1.75rem] leading-tight font-bold tracking-tight text-[#111827] sm:text-3xl">
            Login
          </h2>
          <p className="mt-1.5 text-sm text-stone-600">
            Enter your details to continue.
          </p>

          <form
            onSubmit={onSubmit}
            noValidate
            className="mt-6 flex flex-col gap-4 sm:mt-8 sm:gap-5"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="font-semibold text-[#111827]">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@email.com"
                disabled={busy}
                className="h-11 rounded-xl border-stone-300 bg-white"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="password"
                className="font-semibold text-[#111827]"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••"
                  disabled={busy}
                  className="h-11 rounded-xl border-stone-300 bg-white pr-12 text-base md:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md p-3 text-stone-500 hover:text-[#111827] focus-visible:outline-2 focus-visible:outline-[#111827]"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {error ? (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={busy}
              className="h-12 rounded-xl bg-[#FF6B2C] text-base font-bold text-[#111827] shadow-[0_10px_22px_-10px_rgba(255,107,44,.75)] transition-transform hover:-translate-y-0.5 hover:bg-[#FF6B2C]/90"
            >
              {busy ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Logging in
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-stone-500 sm:my-6">
            <span className="h-px flex-1 bg-stone-300" />
            or
            <span className="h-px flex-1 bg-stone-300" />
          </div>

          <GoogleAuthButton />

          <p className="mt-6 text-center text-sm text-stone-600 sm:mt-8">
            New to Rentora?{" "}
            <Link
              href="/sign-up"
              className="font-bold text-[#8A3300] underline-offset-4 hover:underline"
            >
              sign up
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  )
}

export default LoginForm
