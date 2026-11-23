// app/layout.tsx  (root layout: no Navbar / Footer here anymore)
import { Geist_Mono, Instrument_Serif, Space_Grotesk } from "next/font/google"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Toaster } from "sonner"

// NOTE: Geist used to register `variable: "--font-sans"`. next/font vars are
// unlayered, so they beat Tailwind's `@layer theme` definition of `--font-sans`
// in globals.css — which made `body { font-family: var(--font-sans) }` render
// Geist instead of the intended Space Grotesk. Base text now resolves to
// `--font-space-grotesk` via the theme.

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})
const font = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
})

export const metadata: Metadata = {
  title: "Rentora",
  description:
    "Rent equipment from trusted local owners, or earn from the gear you are not using.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        font.variable,
        fontMono.variable,
        serif.variable,
        "font-sans"
      )}
    >
      <body className="min-h-dvh bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}