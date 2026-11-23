"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { Check, Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { GoogleAuthButton } from "@/components/auth/google-auth-button"

const EASE = [0.22, 1, 0.36, 1] as const

const rules = [
  {
    id: "upper",
    label: "One uppercase letter",
    test: (v: string) => /[A-Z]/.test(v),
  },
  {
    id: "lower",
    label: "One lowercase letter",
    test: (v: string) => /[a-z]/.test(v),
  },
  {
    id: "length",
    label: "At least 6 characters",
    test: (v: string) => v.length >= 6,
  },
] as const

function isValidUrl(value: string) {
  try {
    const u = new URL(value)
    return u.protocol === "http:" || u.protocol === "https:"
  } catch {
    return false
  }
}

export function RegisterForm() {
  const router = useRouter()
  const reduce = useReducedMotion() ?? false

  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const passwordOk = rules.every((r) => r.test(password))

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const data = new FormData(e.currentTarget)
    const name = String(data.get("name") ?? "").trim()
    const email = String(data.get("email") ?? "").trim()
    const photo = String(data.get("photo") ?? "").trim()

    if (!name || !email || !password) {
      setError("Name, email and password are required.")
      return
    }
    if (photo && !isValidUrl(photo)) {
      setError("Photo must be a valid image link starting with http or https.")
      return
    }
    if (!passwordOk) {
      const message =
        "Password needs an uppercase letter, a lowercase letter and at least 6 characters."
      setError(message)
      return
    }

    setBusy(true)
    try {
      const { error: authError } = await authClient.signUp.email({
        name,
        email,
        password,
        image: photo || undefined,
      })

      if (authError) {
        setError(authError.message ?? "Could not create your account.")
        setBusy(false)
        return
      }

      toast.success("Account created successfully")
      // Booking links send guests here with ?next=/payment?...
      const next = new URLSearchParams(window.location.search).get("next")
      const target =
        next && next.startsWith("/") && !next.startsWith("//")
          ? next
          : "/dashboard"
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
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#111827] p-14 text-white lg:sticky lg:top-0 lg:flex lg:h-dvh">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:22px_22px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -bottom-32 size-96 rounded-full bg-[#FF6B2C]"
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
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-5xl leading-[1.08] font-bold tracking-[-0.03em] text-white">
            Join Rentora.
            <br />
            <span className="text-[#FF6B2C]">Rent or earn.</span>
          </h1>
          <p className="mt-4 max-w-sm text-gray-300">
            Create a free account as a customer, or list your equipment as an
            owner.
          </p>
        </div>

        <p className="relative text-sm text-gray-300">
          Secure payments by Stripe
        </p>
      </aside>

      {/* Form */}
      <main className="container mx-auto flex min-w-0 items-center justify-center bg-[#FAF7F2] px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="w-full max-w-[420px]"
        >
          <Link
            href="/"
            className="mb-8 flex items-center gap-2.5 font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-[#111827] lg:hidden"
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
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-[#111827]">
            Create account
          </h2>
          <p className="mt-1.5 text-sm text-stone-600">
            It takes less than a minute.
          </p>

          <form
            onSubmit={onSubmit}
            noValidate
            className="mt-8 flex flex-col gap-5"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="font-semibold text-[#111827]">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                placeholder="Full name"
                disabled={busy}
                className="h-11 rounded-xl border-stone-300 bg-white"
              />
            </div>

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
              <Label htmlFor="photo" className="font-semibold text-[#111827]">
                Photo
              </Label>
              <Input
                id="photo"
                name="photo"
                type="url"
                placeholder="Image link (optional)"
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
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={busy}
                  aria-describedby="password-rules"
                  className="h-11 rounded-xl border-stone-300 bg-white pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-stone-500 hover:text-[#111827] focus-visible:outline-2 focus-visible:outline-[#111827]"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>

              <ul
                id="password-rules"
                className="mt-1 flex flex-col gap-1.5 text-[13px]"
              >
                {rules.map((r) => {
                  const ok = r.test(password)
                  return (
                    <li
                      key={r.id}
                      className={`flex items-center gap-2 transition-colors ${
                        ok ? "text-green-700" : "text-stone-500"
                      }`}
                    >
                      <span
                        className={`grid size-4 place-items-center rounded-full border transition-colors ${
                          ok
                            ? "border-green-700 bg-green-700 text-white"
                            : "border-stone-300"
                        }`}
                      >
                        {ok ? (
                          <Check className="size-3" strokeWidth={3} />
                        ) : null}
                      </span>
                      {r.label}
                    </li>
                  )
                })}
              </ul>
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
                  Creating account
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-stone-500">
            <span className="h-px flex-1 bg-stone-300" />
            or
            <span className="h-px flex-1 bg-stone-300" />
          </div>

          <GoogleAuthButton />

          <p className="mt-8 text-center text-sm text-stone-600">
            Already a member?{" "}
            <Link
              href="/login"
              className="font-bold text-[#8A3300] underline-offset-4 hover:underline"
            >
              Login
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  )
}

export default RegisterForm
