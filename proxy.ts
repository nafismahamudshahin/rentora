// proxy.ts
// Next.js 16 calls this "Proxy" (the old middleware.ts name is deprecated).
// It only does a fast, optimistic cookie check before a page loads. The
// Express API still verifies the session/JWT and the role on every request.

import { getSessionCookie } from "better-auth/cookies"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const AUTH_PAGES = ["/login", "/sign-up"]

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const signedIn = Boolean(getSessionCookie(request))

  if (pathname.startsWith("/dashboard") && !signedIn) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", `${pathname}${search}`)
    return NextResponse.redirect(loginUrl)
  }

  // GuestOnly does the same check after hydration; this avoids showing the
  // login form at all when a session cookie is already present.
  if (AUTH_PAGES.includes(pathname) && signedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/sign-up"],
}
