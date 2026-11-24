"use client"

// components/dashboard/dashboard-shell.tsx
// Built on shadcn's <Sidebar>: collapsible to an icon rail (Ctrl/Cmd + B), inset layout,
// slide-in drawer on mobile, role-based menu, animated active pill.

import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowLeft,
  Bell,
  ChevronsUpDown,
  LogOut,
  Search,
  User,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { authClient, signOut } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import {
  NAV,
  ROLE_LABEL,
  isActive,
  isAllowed,
  normalizeRole,
} from "./nav-config"
import type { NavItem, Role } from "./nav-config"

const EASE = [0.22, 1, 0.36, 1] as const
const PROFILE_HREF = "/dashboard/profile"

type SessionUser = {
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string | null
}

// Theme the shadcn sidebar with Rentora colors.
// Set on :root (not on a wrapper) so it also reaches the mobile drawer, which renders in a portal.
// Both `--sidebar-*` and `--color-sidebar-*` are set so it works however your globals.css maps them.
const SIDEBAR_COLORS: Record<string, string> = {
  sidebar: "#111827",
  "sidebar-foreground": "#e5e7eb",
  "sidebar-primary": "#ff6b2c",
  "sidebar-primary-foreground": "#111827",
  "sidebar-accent": "rgba(255,255,255,0.08)",
  "sidebar-accent-foreground": "#ffffff",
  "sidebar-border": "rgba(255,255,255,0.1)",
  "sidebar-ring": "#ff6b2c",
}
const SIDEBAR_CSS =
  `:root:root,:root.dark{${Object.entries(SIDEBAR_COLORS)
    .map(([k, v]) => `--${k}:${v};--color-${k}:${v};`)
    .join("")}}` +
  // Fallback that does not depend on theme variables: paint the sidebar surfaces directly.
  // Covers the desktop panel, the mobile drawer, and the frame around the inset content.
  `[data-sidebar="sidebar"],[data-slot="sidebar-inner"],[data-slot="sidebar"][data-mobile="true"]{` +
  `background-color:#111827 !important;color:#e5e7eb !important;}` +
  `[data-slot="sidebar-wrapper"]{background-color:#111827 !important;}`

function UserAvatar({
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
      className={cn("shrink-0 rounded-full object-cover", className)}
    />
  ) : (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-[#FF6B2C] font-bold text-[#111827]",
        className
      )}
    >
      {initial}
    </span>
  )
}

function NavGroup({
  label,
  items,
  delay,
}: {
  label: string
  items: NavItem[]
  delay: number
}) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  const reduce = useReducedMotion() ?? false

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: reduce ? 0 : delay, ease: EASE }}
    >
      <SidebarGroup>
        <SidebarGroupLabel className="text-[11px] font-semibold tracking-widest text-gray-500 uppercase">
          {label}
        </SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => {
            const active = isActive(pathname, item.href)
            const Icon = item.icon
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={
                    <Link
                      href={item.href}
                      onClick={() => setOpenMobile(false)}
                      aria-current={active ? "page" : undefined}
                    />
                  }
                  tooltip={item.label}
                  isActive={active}
                  className="relative isolate h-10 rounded-xl px-3 font-semibold text-gray-300 hover:bg-white/5 hover:text-white data-[active=true]:bg-transparent data-[active=true]:text-[#111827] data-[active=true]:hover:bg-transparent data-[active=true]:hover:text-[#111827]"
                >
                  {active && (
                    <motion.span
                      layoutId="sidebar-active-pill"
                      aria-hidden
                      transition={
                        reduce
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 420, damping: 34 }
                      }
                      className="absolute inset-0 -z-10 rounded-xl bg-[#FF6B2C] shadow-[0_10px_22px_-10px_rgba(255,107,44,.8)]"
                    />
                  )}
                  <Icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroup>
    </motion.div>
  )
}

function UserMenu({ user, role }: { user: SessionUser; role: Role }) {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const [signingOut, setSigningOut] = useState(false)

  async function onSignOut() {
    setSigningOut(true)
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/")
            router.refresh()
          },
        },
      })
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="rounded-xl hover:bg-white/5 aria-expanded:bg-white/10"
              />
            }
          >
            <UserAvatar user={user} className="size-8 text-sm" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-white">
                {user.name || "Your name"}
              </span>
              <span className="truncate text-xs text-gray-400">
                {ROLE_LABEL[role]}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
            className="min-w-60 rounded-xl"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-3 p-3 font-normal">
                <UserAvatar user={user} className="size-9 text-sm" />
                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user.name || "Your name"}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                render={<Link href={PROFILE_HREF} />}
                className="cursor-pointer"
              >
                <User />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href="/" />}
                className="cursor-pointer"
              >
                <ArrowLeft />
                Back to site
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={onSignOut}
                disabled={signingOut}
                variant="destructive"
                className="cursor-pointer"
              >
                <LogOut />
                {signingOut ? "Logging out…" : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function AppSidebar({ user, role }: { user: SessionUser; role: Role }) {
  const { setOpenMobile } = useSidebar()
  const main = NAV[role].filter((i) => i.href !== PROFILE_HREF)
  const account = NAV[role].filter((i) => i.href === PROFILE_HREF)

  return (
    <Sidebar variant="inset" collapsible="icon" className="border-0">
      <SidebarHeader className="pt-4 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={
                <Link
                  href="/"
                  aria-label="Rentora home"
                  onClick={() => setOpenMobile(false)}
                />
              }
              size="lg"
              className="rounded-xl hover:bg-white/5 data-[slot=sidebar-menu-button]:!p-2"
            >
              <span
                aria-hidden
                className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-[#FF6B2C] font-[family-name:var(--font-space-grotesk)] text-base font-bold text-[#111827] shadow-[0_8px_18px_-8px_rgba(255,107,44,.8)]"
              >
                R
              </span>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-[family-name:var(--font-space-grotesk)] text-lg font-bold tracking-tight text-white">
                  Rentora
                </span>
                <span className="truncate text-[11px] font-medium text-gray-400">
                  {ROLE_LABEL[role]} panel
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup label="Menu" items={main} delay={0.05} />
        {account.length > 0 && (
          <NavGroup label="Account" items={account} delay={0.15} />
        )}
      </SidebarContent>

      <SidebarFooter className="pb-4">
        <UserMenu user={user} role={role} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

function FullScreenLoader() {
  return (
    <div className="grid min-h-dvh place-items-center bg-[#F3EEE6]">
      <div
        role="status"
        aria-label="Loading dashboard"
        className="size-8 animate-spin rounded-full border-4 border-[#FF6B2C]/25 border-t-[#FF6B2C]"
      />
    </div>
  )
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const reduce = useReducedMotion() ?? false
  const { data: session, isPending } = authClient.useSession()

  const user = session?.user as SessionUser | undefined
  const role = normalizeRole(user?.role)

  // Not signed in -> login
  useEffect(() => {
    if (!isPending && !user) router.replace("/login")
  }, [isPending, user, router])

  // Signed in but on a page their role can't use -> dashboard home
  useEffect(() => {
    if (user && !isAllowed(role, pathname)) router.replace("/dashboard")
  }, [user, role, pathname, router])

  if (isPending || !user) return <FullScreenLoader />

  return (
    <SidebarProvider>
      <style>{SIDEBAR_CSS}</style>
      <AppSidebar user={user} role={role} />

      <SidebarInset className="bg-[#F3EEE6] text-[#111827]">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 rounded-t-xl bg-[#F3EEE6]/80 px-4 backdrop-blur-md sm:px-6">
          <SidebarTrigger className="-ml-1 size-9 rounded-xl text-[#111827] hover:bg-black/5" />
          <Separator
            orientation="vertical"
            className="hidden h-5 bg-stone-300 sm:block"
          />

          <div className="relative max-w-md flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-500"
            />
            <Input
              type="search"
              placeholder="Search anything..."
              aria-label="Search"
              className="h-10 rounded-xl border-stone-300 bg-white pl-9"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="relative grid size-10 place-items-center rounded-xl border border-stone-300 bg-white text-[#111827] transition-colors hover:bg-stone-50"
            >
              <Bell className="size-4" />
              <span
                aria-hidden
                className="absolute top-2.5 right-2.5 size-2 rounded-full bg-[#FF6B2C] ring-2 ring-white"
              />
            </button>
            <UserAvatar user={user} className="size-10 text-sm" />
          </div>
        </header>

        {/* Page content: fades/slides in on every route change */}
        <main className="pt-4 pb-12">
          <motion.div
            key={pathname}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="container mx-auto px-4 sm:px-6 lg:px-8"
          >
            {children}
          </motion.div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
