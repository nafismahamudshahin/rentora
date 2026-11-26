import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  Receipt,
  Search,
  Star,
  Store,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "How it works | Rentora",
  description:
    "Learn how to search, book, pay for and return rental equipment on Rentora.",
}

const steps = [
  {
    icon: Search,
    title: "Find your gear",
    text: "Search by name, category or location. Compare prices, reviews and rental types before you choose.",
  },
  {
    icon: CalendarDays,
    title: "Pick dates and quantity",
    text: "Choose the days you need and how many units you want. The total is shown before you pay.",
  },
  {
    icon: CreditCard,
    title: "Pay safely",
    text: "Stripe Checkout holds your dates for 30 minutes. After payment, your booking becomes active.",
  },
  {
    icon: Store,
    title: "Meet and use it",
    text: "Arrange pickup with the owner. Use the gear for your rental period, then return it on time.",
  },
  {
    icon: Star,
    title: "Return and review",
    text: "When the rental is complete, you can leave a review. Paid rentals also get a PDF receipt.",
  },
]

const ownerSteps = [
  "Add your equipment with photos, price, location and the number of units you have.",
  "An admin checks the listing. Only approved gear appears in public search.",
  "When a customer pays, 98% of the total goes to you. Track every payout in Earnings.",
]

const faqs = [
  {
    question: "Can I book as an owner or admin?",
    answer:
      "No. Customers make bookings. Owners and admins manage listings and rentals from the dashboard.",
  },
  {
    question: "When does a listing show as Rented?",
    answer:
      "Only when every unit is in use by a paid rental on that day. Unpaid holds do not mark gear as rented.",
  },
  {
    question: "Where can I find my receipt?",
    answer:
      "Download it from the payment success page or from My Rentals. The button appears after a successful payment.",
  },
  {
    question: "What if I stop before paying?",
    answer:
      "The hold expires after 30 minutes and the dates are free again. You can start a new checkout any time.",
  },
]

export default function HowItWorksPage() {
  return (
    <main className="bg-[#FAF7F2]">
      <section className="relative overflow-hidden bg-[#111827] text-white">
        <div
          className="absolute -top-28 -right-24 size-96 rounded-full bg-[#FF6B2C]/25 blur-3xl"
          aria-hidden
        />
        <div className="relative container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <span
            className="mb-5 block h-[5px] w-11 rounded-full bg-[#FF6B2C]"
            aria-hidden
          />
          <p className="text-xs font-bold tracking-[0.2em] text-[#FF6B2C] uppercase">
            Simple steps
          </p>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-space-grotesk)] text-4xl leading-[1.08] font-bold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
            Rent the gear you need, without buying it.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">
            Rentora connects you with local owners. Pick your dates, pay with a
            card and use the gear. We keep the steps clear from start to finish.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/equipment"
              className={cn(
                buttonVariants(),
                "h-11 rounded-full bg-[#FF6B2C] px-6 font-bold text-[#111827] hover:bg-[#FF6B2C]/90"
              )}
            >
              Browse equipment
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/contact"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 rounded-full border-white/30 bg-transparent px-6 font-semibold text-white hover:bg-white/10 hover:text-white"
              )}
            >
              Ask a question
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <span
            className="mb-3.5 block h-[5px] w-11 rounded-full bg-[#FF6B2C]"
            aria-hidden
          />
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
            The rental journey
          </h2>
          <p className="mt-3 text-base leading-relaxed text-stone-600">
            Five short steps take you from search to a completed rental.
          </p>
        </div>

        <ol className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <li
                key={step.title}
                className="rounded-[22px] border border-[#e8e2d8] bg-white p-6 shadow-[0_18px_44px_-30px_rgba(17,24,39,.4)] transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-[#111827] text-[#FF6B2C]">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-stone-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-5 font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-[#111827]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {step.text}
                </p>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="border-y border-[#e8e2d8] bg-white">
        <div className="container mx-auto grid gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-20">
          <div>
            <span
              className="mb-3.5 block h-[5px] w-11 rounded-full bg-[#FF6B2C]"
              aria-hidden
            />
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
              Have gear to share?
            </h2>
            <p className="mt-3 max-w-lg text-base leading-relaxed text-stone-600">
              Listing your equipment is simple. You stay in control of the
              details, and Rentora handles the booking and payment flow.
            </p>
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants(),
                "mt-6 h-11 rounded-full bg-[#111827] px-6 font-bold text-white hover:bg-[#111827]/90"
              )}
            >
              Create an owner account
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <ol className="space-y-3">
            {ownerSteps.map((step, index) => (
              <li
                key={step}
                className="flex gap-4 rounded-[20px] border border-[#e8e2d8] bg-[#FAF7F2] p-5"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#FF6B2C] text-sm font-bold text-[#111827]">
                  {index + 1}
                </span>
                <p className="text-sm leading-relaxed text-stone-700">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <span
            className="mb-3.5 block h-[5px] w-11 rounded-full bg-[#FF6B2C]"
            aria-hidden
          />
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
            Good to know
          </h2>
          <p className="mt-3 text-base leading-relaxed text-stone-600">
            A few short answers before you book.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-[20px] border border-[#e8e2d8] bg-white p-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[#111827] [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#FF6B2C]/15 text-lg leading-none text-[#e85a1c] transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="flex flex-col gap-6 rounded-[28px] bg-[#FF6B2C] p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-[#111827]">
              <Receipt className="size-4" aria-hidden />
              Ready when you are
            </div>
            <h2 className="mt-2 font-[family-name:var(--font-space-grotesk)] text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
              Find the right gear today.
            </h2>
          </div>
          <Link
            href="/equipment"
            className={cn(
              buttonVariants(),
              "h-11 rounded-full bg-[#111827] px-6 font-bold text-white hover:bg-[#111827]/90"
            )}
          >
            Browse all equipment
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </main>
  )
}
