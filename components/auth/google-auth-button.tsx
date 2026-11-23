"use client"

import { useState } from "react"
import { Loader2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-[18px]", className)}
      aria-hidden
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

type GoogleAuthButtonProps = {
  /** Button text. Defaults to "Continue with Google". */
  label?: string
  /** Where Better Auth should send the user after a successful sign in. */
  callbackURL?: string
  /** Called when the social sign in request fails. */
  onError?: (message: string) => void
  /** Optional callback fired before the redirect starts. */
  onStart?: () => void
  disabled?: boolean
  className?: string
}

export function GoogleAuthButton({
  label = "Continue with Google",
  callbackURL = "/",
  onError,
  onStart,
  disabled = false,
  className,
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    onStart?.()

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL,
      })

      if (error) {
        onError?.(
          error.message ?? "Could not connect to Google. Please try again."
        )
        setLoading(false)
      }
      // On success Better Auth redirects the browser, so the loading
      // state is intentionally left on to avoid a flash.
    } catch {
      onError?.("Could not connect to Google. Please try again.")
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn(
        "h-12 w-full gap-2.5 rounded-xl border-[#e8e2d8] bg-white text-[15px] font-medium text-[#111827] transition-colors",
        "hover:border-[#111827]/20 hover:bg-[#faf6f0]",
        "focus-visible:border-[#ff6b2c] focus-visible:ring-4 focus-visible:ring-[#ff6b2c]/15",
        "disabled:opacity-60",
        className
      )}
    >
      {loading ? (
        <Loader2Icon className="size-4 animate-spin text-[#111827]/50" />
      ) : (
        <GoogleIcon />
      )}
      {loading ? "Connecting…" : label}
    </Button>
  )
}
