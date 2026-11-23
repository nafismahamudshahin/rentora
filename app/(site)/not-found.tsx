// app/(site)/not-found.tsx
// Rendered inside the site layout, which already supplies Navbar + Footer.

import { NotFoundView } from "@/components/layout/not-found-view"

export default function SiteNotFound() {
  return <NotFoundView />
}
