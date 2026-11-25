"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, Store, UserRound } from "lucide-react"
import { toast } from "sonner"

import { setMyRole, type SignUpRole } from "@/backend-api/action/account"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient, signOut } from "@/lib/auth-client"
import { GoogleAuthButton } from "@/components/auth/google-auth-button"
import { cn } from "@/lib/utils"

function isValidUrl(value: string) {
  try {
    const u = new URL(value)
    return u.protocol === "http:" || u.protocol === "https:"
  } catch {
    return false
  }
}

const roles = [
  {
    value: "customer" as const,
    label: "Customer",
    hint: "I want to rent gear",
    icon: UserRound,
  },
  {
    value: "owner" as const,
    label: "Owner",
    hint: "I want to list gear",
    icon: Store,
  },
]

export function RegisterForm() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<SignUpRole>("customer")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const passwordOk =
    /[A-Z]/.test(password) && /[a-z]/.test(password) && password.length >= 6

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
      setError(
        "Password needs an uppercase letter, a lowercase letter and at least 6 characters."
      )
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

      if (role === "owner") {
        const changed = await setMyRole("owner")
        if (!changed.ok) {
          toast.error(
            "Account created as a customer. Email us to switch to owner."
          )
        }
      }

      // Registration creates a session too. End it so the new user signs in
      // with their final role and lands on the login page as requested.
      await signOut()

      toast.success("Account created successfully. Please log in.")
      const next = new URLSearchParams(window.location.search).get("next")
      const loginUrl =
        next && next.startsWith("/") && !next.startsWith("//")
          ? `/login?next=${encodeURIComponent(next)}`
          : "/login"
      router.push(loginUrl)
      router.refresh()
    } catch {
      setError("Something went wrong. Try again.")
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#FAF7F2] px-4 py-12">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-xl font-bold text-[#111827]"
        >
          <span className="grid size-9 place-items-center rounded-lg bg-[#FF6B2C] text-[#111827]">
            R
          </span>
          Rentora
        </Link>

        <div className="rounded-2xl border border-[#e8e2d8] bg-white p-6 sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
            Create account
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            It takes less than a minute.
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
            <fieldset disabled={busy}>
              <legend className="mb-2 text-sm font-medium text-[#111827]">
                I want to
              </legend>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((option) => {
                  const Icon = option.icon
                  const active = role === option.value
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors focus-within:ring-2 focus-within:ring-[#FF6B2C]/40",
                        active
                          ? "border-[#FF6B2C] bg-orange-50"
                          : "border-[#e8e2d8] bg-white hover:border-[#FF6B2C]/60"
                      )}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={option.value}
                        checked={active}
                        onChange={() => setRole(option.value)}
                        className="sr-only"
                      />
                      <span
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-lg",
                          active
                            ? "bg-[#FF6B2C] text-[#111827]"
                            : "bg-[#FAF7F2] text-stone-500"
                        )}
                      >
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-[#111827]">
                          {option.label}
                        </span>
                        <span className="block truncate text-xs text-stone-500">
                          {option.hint}
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                placeholder="Full name"
                disabled={busy}
                className="h-11 rounded-xl border-[#e8e2d8]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@email.com"
                disabled={busy}
                className="h-11 rounded-xl border-[#e8e2d8]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">
                Photo{" "}
                <span className="font-normal text-stone-500">(optional)</span>
              </Label>
              <Input
                id="photo"
                name="photo"
                type="url"
                placeholder="Image link"
                disabled={busy}
                className="h-11 rounded-xl border-[#e8e2d8]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
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
                  className="h-11 rounded-xl border-[#e8e2d8] pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-stone-500 hover:text-[#111827] focus-visible:outline-2 focus-visible:outline-[#FF6B2C]"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-stone-500">
                Uppercase, lowercase and at least 6 characters.
              </p>
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
              className="h-11 w-full rounded-xl bg-[#FF6B2C] text-base font-bold text-[#111827] hover:bg-[#FF6B2C]/90"
            >
              {busy ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-stone-500">
            <span className="h-px flex-1 bg-[#e8e2d8]" />
            or
            <span className="h-px flex-1 bg-[#e8e2d8]" />
          </div>

          <GoogleAuthButton />
          <p className="mt-3 text-center text-xs text-stone-500">
            Google sign-ups start as customers.
          </p>

          <p className="mt-6 text-center text-sm text-stone-600">
            Already a member?{" "}
            <Link
              href="/login"
              className="font-bold text-[#8A3300] underline-offset-4 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default RegisterForm
