import { footerColumns } from "@/lib/navlinks"
import Link from "next/link"
import { Logo } from "./logo"

const socials = [
  {
    label: "X",
    href: "https://x.com",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-4"
        aria-hidden
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
        aria-hidden
      >
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
        aria-hidden
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
        aria-hidden
      >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
]

const linkClass = "text-sm text-white/70 transition-colors hover:text-brand"

export function Footer() {
  return (
    <footer className="mt-auto bg-background">
      {/* Main footer */}
      <div className="-mt-12 bg-navy pt-20 text-white md:-mt-10 md:pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1.2fr]">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-1">
              <Logo light />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
                Rent equipment from trusted local owners, or earn from the gear
                you are not using.
              </p>
              <div className="mt-5 flex gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="grid size-9 place-items-center rounded-lg border border-white/15 text-white/80 transition-colors hover:border-brand hover:text-brand"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {footerColumns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h3 className="mb-4 text-sm font-semibold text-white">
                  {col.title}
                </h3>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className={linkClass}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            {/* Contact */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-white">Contact</h3>
              <ul className="space-y-2.5 text-sm text-white/70">
                <li>Online support</li>
                <li>
                  <a
                    href="mailto:hello@rentora.com"
                    className="hover:text-brand"
                  >
                    hello@rentora.com
                  </a>
                </li>
                <li>Usually replies in one business day</li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-center text-xs text-white/60 md:flex-row md:text-left">
            <p>© {new Date().getFullYear()} Rentora. All rights reserved.</p>
            <p>Secure payments by Stripe</p>
            <p className="flex gap-1.5">
              <Link href="/terms" className="hover:text-brand">
                Terms
              </Link>
              ·
              <Link href="/privacy" className="hover:text-brand">
                Privacy
              </Link>
              ·
              <Link href="/cookies" className="hover:text-brand">
                Cookies
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
