"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { GoogleAuthButton } from "@/components/auth/google-auth-button"

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
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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

      toast.success("Account created successfully")
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
    <main className="flex min-h-dvh items-center justify-center bg-[#FAF7F2] px-4 py-12">
      <div className="w-full max-w-sm">
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
                Photo <span className="font-normal text-stone-500">(optional)</span>
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
