"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ArrowRightIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  UserIcon,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { authClient, signOut } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { Logo } from "./logo"

const navLinks = [
  { label: "Home", href: "/" },
  { label: "All Equipment", href: "/equipment" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Contact", href: "/contact" },
]

// Change these if your routes differ.
const DASHBOARD_HREF = "/dashboard"
const PROFILE_HREF = "/dashboard/profile"

const btnBase =
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-colors"
const btnOutline = `${btnBase} border-2 border-[#111827] bg-white text-[#111827] hover:bg-[#111827] hover:text-white`
const btnPrimary = `${btnBase} bg-[#ff6b2c] text-[#111827] shadow-[0_8px_20px_-6px_rgba(255,107,44,0.6)] hover:bg-[#e85a1c]`

type SessionUser = {
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string | null
}

function Avatar({
  user,
  className,
}: {
  user: SessionUser
  className?: string
}) {
  const initial = (user.name || user.email || "?")
    .trim()
    .charAt(0)
    .toUpperCase()
  return user.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={user.image}
      alt=""
      referrerPolicy="no-referrer"
      className={cn("rounded-full object-cover", className)}
    />
  ) : (
    <span
      aria-hidden
      className={cn(
        "grid place-items-center rounded-full bg-[#111827] font-bold text-[#ff6b2c]",
        className
      )}
    >
      {initial}
    </span>
  )
}

function UserMenu({ user }: { user: SessionUser }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("touchstart", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("touchstart", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  async function onSignOut() {
    setSigningOut(true)
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            setOpen(false)
            router.push("/")
            router.refresh()
          },
        },
      })
    } finally {
      setSigningOut(false)
    }
  }

  const itemClass =
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#111827] transition-colors hover:bg-[#faf6f0]"
  const role = user.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : null

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Open profile menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="grid size-10 place-items-center rounded-full border-2 border-[#111827] bg-white p-0.5 transition-shadow hover:shadow-[0_0_0_3px_rgba(255,107,44,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6b2c]"
      >
        <Avatar user={user} className="size-full text-sm" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Profile menu"
          className="absolute top-[calc(100%+10px)] right-0 z-50 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#e8e2d8] bg-white shadow-[0_20px_40px_-12px_rgba(17,24,39,0.25)]"
        >
          {/* User info */}
          <div className="flex items-center gap-3 border-b border-[#e8e2d8] p-4">
            <Avatar user={user} className="size-11 shrink-0 text-base" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-bold text-[#111827]">
                  {user.name || "Account"}
                </p>
                {role && (
                  <span className="shrink-0 rounded-full border border-[#e8e2d8] bg-[#faf6f0] px-2 py-0.5 text-[11px] font-semibold text-[#111827]">
                    {role}
                  </span>
                )}
              </div>
              {user.email && (
                <p className="truncate text-xs text-[#111827]/60">
                  {user.email}
                </p>
              )}
            </div>
          </div>

          {/* Nav links: only shown inside the menu on small screens */}
          <div className="border-b border-[#e8e2d8] p-2 md:hidden">
            <p className="px-3 pt-1.5 pb-1 text-[11px] font-semibold tracking-widest text-[#111827]/50 uppercase">
              Menu
            </p>
            {navLinks.map((l) => {
              const active = pathname === l.href
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={cn(
                    itemClass,
                    active && "bg-[#faf6f0] text-[#ff6b2c]"
                  )}
                >
                  <span className="flex-1">{l.label}</span>
                  <ArrowRightIcon className="size-4 text-[#111827]/40" />
                </Link>
              )
            })}
          </div>

          {/* Account links */}
          <div className="p-2">
            <Link
              href={DASHBOARD_HREF}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={itemClass}
            >
              <LayoutDashboardIcon className="size-4" />
              Dashboard
            </Link>
            <Link
              href={PROFILE_HREF}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={itemClass}
            >
              <UserIcon className="size-4" />
              Profile
            </Link>
          </div>

          <div className="border-t border-[#e8e2d8] p-2">
            <button
              type="button"
              role="menuitem"
              onClick={onSignOut}
              disabled={signingOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
            >
              <LogOutIcon className="size-4" />
              {signingOut ? "Logging out…" : "Log out"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user as SessionUser | undefined

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#e8e2d8] bg-[#faf6f0]/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <Logo />

        {/* Desktop links */}
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => {
            const active = pathname === l.href
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative rounded-lg px-3.5 py-2 text-sm font-medium text-[#111827]/75 transition-colors hover:text-[#ff6b2c]",
                  active && "text-[#111827]"
                )}
              >
                {l.label}
                {active && (
                  <span className="absolute inset-x-3.5 -bottom-0.5 h-[3px] rounded-full bg-[#ff6b2c]" />
                )}
              </Link>
            )
          })}
        </nav>

        {isPending ? (
          // Placeholder while the session loads, so Login/Register don't flash for signed-in users
          <div
            aria-hidden
            className="size-10 animate-pulse rounded-full bg-[#e8e2d8]"
          />
        ) : user ? (
          /* Signed in: profile menu on every screen size, no hamburger */
          <UserMenu user={user} />
        ) : (
          <>
            {/* Signed out: desktop buttons */}
            <div className="hidden items-center gap-3 md:flex">
              <Link href="/login" className={cn(btnOutline, "h-9 px-4")}>
                Login
              </Link>
              <Link href="/sign-up" className={cn(btnPrimary, "h-9 px-4")}>
                Sign up
              </Link>
            </div>

            {/* Signed out: mobile hamburger */}
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="grid size-10 place-items-center rounded-xl border-2 border-[#111827] bg-white text-[#111827] md:hidden"
            >
              <MenuIcon className="size-5" />
            </button>

            {/* Signed out: mobile drawer */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetContent className="w-[88%] max-w-sm gap-0 border-l-0 bg-[#faf6f0] p-0 text-[#111827] shadow-2xl sm:max-w-sm">
                <SheetHeader className="flex-row items-center justify-between border-b border-[#e8e2d8] bg-white/60 px-5 py-4 pr-14">
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Site navigation
                  </SheetDescription>
                </SheetHeader>

                <nav
                  aria-label="Mobile"
                  className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-6"
                >
                  <p className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-widest text-[#111827]/50 uppercase">
                    <span className="h-[3px] w-6 rounded-full bg-[#ff6b2c]" />
                    Menu
                  </p>

                  {navLinks.map((l, i) => {
                    const active = pathname === l.href
                    return (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "group flex items-center gap-4 rounded-2xl border bg-white px-4 py-4 shadow-[0_6px_18px_-8px_rgba(17,24,39,0.18)] transition-all active:scale-[0.98]",
                          active
                            ? "border-[#ff6b2c] ring-1 ring-[#ff6b2c]"
                            : "border-[#e8e2d8] hover:border-[#ff6b2c]"
                        )}
                      >
                        <span className="text-lg font-bold text-[#ff6b2c]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1 text-base font-semibold text-[#111827]">
                          {l.label}
                        </span>
                        <ArrowRightIcon className="size-4 text-[#111827]/40 transition-transform group-hover:translate-x-1 group-hover:text-[#ff6b2c]" />
                      </Link>
                    )
                  })}
                </nav>

                <div className="space-y-3 border-t border-[#e8e2d8] bg-white/60 p-5">
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className={cn(btnOutline, "h-12 text-base")}
                    >
                      Login
                    </Link>
                    <Link
                      href="/sign-up"
                      onClick={() => setOpen(false)}
                      className={cn(btnPrimary, "h-12 text-base")}
                    >
                      Sign Up
                    </Link>
                  </div>
                  <p className="text-center text-xs text-[#111827]/55">
                    ✓ Verified owners · Secure Stripe payments
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </>
        )}
      </div>
    </header>
  )
}
