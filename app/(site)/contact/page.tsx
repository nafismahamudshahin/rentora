import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  Clock,
  Mail,
  MessageCircle,
  ShieldCheck,
} from "lucide-react"
import { ContactForm } from "@/components/contact/contact-form"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Contact us | Rentora",
  description:
    "Get help with your Rentora booking, payment, receipt, account or equipment listing.",
}

const supportCards = [
  {
    icon: MessageCircle,
    title: "Booking help",
    text: "Ask about dates, pickup, returns or how many units you need.",
  },
  {
    icon: ShieldCheck,
    title: "Payments and receipts",
    text: "We can help you check a payment or find your rental receipt.",
  },
  {
    icon: Clock,
    title: "Quick reply",
    text: "We usually answer within one business day. Please include your booking id if you have one.",
  },
]

export default function ContactPage() {
  return (
    <main className="bg-[#FAF7F2]">
      <section className="border-b border-[#e8e2d8]">
        <div className="container mx-auto px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <span
            className="mb-4 block h-[5px] w-11 rounded-full bg-[#FF6B2C]"
            aria-hidden
          />
          <div className="grid gap-10 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
            <div>
              <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl leading-[1.1] font-bold tracking-[-0.04em] text-[#111827] sm:text-5xl lg:text-6xl">
                We are here to help.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone-600">
                Questions about a booking, a listing or your account? Send us a
                short message and we will point you in the right direction.
              </p>
            </div>

            <div className="rounded-2xl border border-[#e8e2d8] bg-white p-6 shadow-[0_18px_40px_-24px_rgba(17,24,39,.28)]">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-[#FF6B2C]/15 text-[#e85a1c]">
                  <Mail className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">
                    Email us directly
                  </p>
                  <a
                    href="mailto:hello@rentora.com"
                    className="text-sm font-bold text-[#e85a1c] underline underline-offset-4"
                  >
                    hello@rentora.com
                  </a>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-stone-600">
                You can also use the form below. We read every message.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.3fr_.7fr] lg:px-8 lg:py-16">
        <div className="rounded-[24px] border border-[#e8e2d8] bg-white p-6 shadow-[0_18px_50px_-30px_rgba(17,24,39,.35)] sm:p-8">
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tracking-tight text-[#111827]">
            Send a message
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            Fill in the details and your email app will open with them ready.
          </p>
          <div className="mt-7">
            <ContactForm />
          </div>
        </div>

        <aside className="space-y-4">
          {supportCards.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.title}
                className="rounded-[20px] border border-[#e8e2d8] bg-white p-5"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-[#111827] text-[#FF6B2C]">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-[#111827]">
                  {card.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
                  {card.text}
                </p>
              </div>
            )
          })}

          <div className="rounded-[20px] bg-[#111827] p-6 text-white">
            <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold">
              Need to know the steps?
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-white/70">
              Our short guide explains booking, payment and returns.
            </p>
            <Link
              href="/how-it-works"
              className={cn(
                buttonVariants({ variant: "link" }),
                "mt-4 h-auto p-0 font-bold text-[#FF6B2C] hover:text-white"
              )}
            >
              See how it works
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </aside>
      </section>
    </main>
  )
}
