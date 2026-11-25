import Link from "next/link"
import { ArrowRight, Mail } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type InfoSection = {
  title: string
  paragraphs?: string[]
  items?: string[]
}

type InfoPageProps = {
  eyebrow: string
  title: string
  intro: string
  sections: InfoSection[]
  updated?: string
  ctaLabel?: string
  ctaHref?: string
}

const relatedPages = [
  { label: "About us", href: "/about" },
  { label: "Help center", href: "/help" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Cookies", href: "/cookies" },
  { label: "Contact", href: "/contact" },
]

function slug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function InfoPage({
  eyebrow,
  title,
  intro,
  sections,
  updated,
  ctaLabel = "Browse equipment",
  ctaHref = "/equipment",
}: InfoPageProps) {
  return (
    <main className="bg-[#FAF7F2]">
      <section className="border-b border-[#e8e2d8] bg-white">
        <div className="container mx-auto px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <span
            className="mb-4 block h-[5px] w-11 rounded-full bg-[#FF6B2C]"
            aria-hidden
          />
          <p className="text-xs font-bold tracking-[0.2em] text-[#e85a1c] uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-space-grotesk)] text-4xl leading-[1.1] font-bold tracking-[-0.04em] text-[#111827] sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-600">
            {intro}
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[22px] border border-[#e8e2d8] bg-white p-5">
              <p className="text-[11px] font-bold tracking-[0.14em] text-stone-500 uppercase">
                On this page
              </p>
              <nav
                aria-label="On this page"
                className="mt-3 flex flex-col gap-1"
              >
                {sections.map((section) => (
                  <a
                    key={section.title}
                    href={`#${slug(section.title)}`}
                    className="rounded-lg px-2 py-1.5 text-sm font-semibold text-stone-600 transition-colors hover:bg-orange-50 hover:text-[#e85a1c]"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
              {updated ? (
                <p className="mt-5 border-t border-[#e8e2d8] pt-4 text-xs text-stone-500">
                  Updated {updated}
                </p>
              ) : null}
            </div>

            <div className="mt-4 rounded-[22px] bg-[#111827] p-5 text-white">
              <span className="grid size-9 place-items-center rounded-xl bg-[#FF6B2C] text-[#111827]">
                <Mail className="size-4" aria-hidden />
              </span>
              <p className="mt-4 font-[family-name:var(--font-space-grotesk)] text-lg font-bold">
                Still have a question?
              </p>
              <p className="mt-1 text-sm leading-relaxed text-white/70">
                We usually answer in one business day.
              </p>
              <a
                href="mailto:hello@rentora.com"
                className="mt-3 inline-block text-sm font-bold text-[#FF6B2C] underline underline-offset-4"
              >
                hello@rentora.com
              </a>
            </div>
          </aside>

          <div className="space-y-5">
            {sections.map((section, index) => (
              <section
                key={section.title}
                id={slug(section.title)}
                className="scroll-mt-24 rounded-[24px] border border-[#e8e2d8] bg-white p-6 shadow-[0_18px_44px_-30px_rgba(17,24,39,.4)] sm:p-8"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#FF6B2C] text-sm font-bold text-[#111827]">
                    {index + 1}
                  </span>
                  <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tracking-tight text-[#111827]">
                    {section.title}
                  </h2>
                </div>

                {section.paragraphs?.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-4 text-sm leading-relaxed text-stone-600"
                  >
                    {paragraph}
                  </p>
                ))}

                {section.items?.length ? (
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {section.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2 rounded-xl bg-[#FAF7F2] px-3 py-2 text-sm leading-relaxed text-stone-700"
                      >
                        <span
                          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#FF6B2C]"
                          aria-hidden
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="flex flex-col gap-6 rounded-[28px] bg-[#FF6B2C] p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-[#111827]/70 uppercase">
              Keep exploring
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
              Ready to find your gear?
            </h2>
          </div>
          <Link
            href={ctaHref}
            className={cn(
              buttonVariants(),
              "h-11 rounded-full bg-[#111827] px-6 font-bold text-white hover:bg-[#111827]/90"
            )}
          >
            {ctaLabel}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <nav
          aria-label="More information"
          className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-semibold text-stone-600"
        >
          {relatedPages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="transition-colors hover:text-[#e85a1c] hover:underline"
            >
              {page.label}
            </Link>
          ))}
        </nav>
      </section>
    </main>
  )
}
