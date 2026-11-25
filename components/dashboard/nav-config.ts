// components/dashboard/nav-config.ts
import {
  Boxes,
  CalendarCheck,
  CalendarRange,
  CreditCard,
  Heart,
  Inbox,
  LayoutDashboard,
  PackagePlus,
  User,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"

export type Role = "admin" | "owner" | "customer"

export type NavItem = { label: string; href: string; icon: LucideIcon }

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  owner: "Owner",
  customer: "Customer",
}

const overview: NavItem = {
  label: "Overview",
  href: "/dashboard",
  icon: LayoutDashboard,
}
const profile: NavItem = {
  label: "Profile",
  href: "/dashboard/profile",
  icon: User,
}

export const NAV: Record<Role, NavItem[]> = {
  customer: [
    overview,
    { label: "My Rentals", href: "/dashboard/rentals", icon: CalendarCheck },
    { label: "Favorites", href: "/dashboard/favorites", icon: Heart },
    profile,
  ],
  owner: [
    overview,
    {
      label: "Add Equipment",
      href: "/dashboard/add-equipment",
      icon: PackagePlus,
    },
    { label: "My Equipment", href: "/dashboard/listings", icon: Boxes },
    { label: "Booking Requests", href: "/dashboard/requests", icon: Inbox },
    { label: "My Equipment Rentals", href: "/dashboard/rentals", icon: CalendarCheck },
    { label: "Earnings", href: "/dashboard/earnings", icon: Wallet },
    profile,
  ],
  admin: [
    overview,
    { label: "Users", href: "/dashboard/users", icon: Users },
    { label: "All Equipment", href: "/dashboard/equipment", icon: Boxes },
    { label: "All Bookings", href: "/dashboard/bookings", icon: CalendarCheck },
    {
      label: "All Rentals",
      href: "/dashboard/all-rentals",
      icon: CalendarRange,
    },
    { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
    profile,
  ],
}

export function normalizeRole(role?: string | null): Role {
  return role === "admin" || role === "owner" ? role : "customer"
}

export function isActive(pathname: string, href: string) {
  return href === "/dashboard"
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/")
}

/** A route is allowed if it is the dashboard home or sits under one of the role's nav items. */
export function isAllowed(role: Role, pathname: string) {
  if (pathname === "/dashboard") return true
  return NAV[role].some(
    (i) => i.href !== "/dashboard" && isActive(pathname, i.href)
  )
}
