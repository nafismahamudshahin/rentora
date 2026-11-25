import type { Metadata } from "next"

import { InfoPage } from "@/components/layout/info-page"

export const metadata: Metadata = {
  title: "About us | Rentora",
  description:
    "Learn why Rentora exists and how we make equipment sharing simple, safe and useful for local owners and customers.",
}

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="About Rentora"
      title="Rental gear, shared with trust."
      intro="Rentora is a simple place to find equipment near you and to share gear you already own. We bring local owners and customers together, then make the booking and payment steps clear for everyone."
      updated="November 2026"
      ctaLabel="Browse all equipment"
      ctaHref="/equipment"
      sections={[
        {
          title: "Why we built Rentora",
          paragraphs: [
            "Good equipment is expensive to buy, and it often sits unused after a project ends. We wanted a better way: borrow what you need, and share what you already have.",
            "Rentora makes that simple. Customers find gear close to home. Owners earn from things they already own. Everyone saves money and space.",
          ],
        },
        {
          title: "What you can do here",
          paragraphs: [
            "Search approved listings, compare prices, choose dates and pay safely with Stripe. Your booking, receipt and rental status stay in one place.",
          ],
          items: [
            "Search by name, category or location",
            "Choose the number of units you need",
            "See the full price before you pay",
            "Download a PDF receipt after payment",
            "Leave a review after a paid rental",
          ],
        },
        {
          title: "For equipment owners",
          paragraphs: [
            "You add the details: photos, price, location and how many units you have. An admin checks the listing before it appears in public search.",
            "When a customer pays, 98% of the total goes to you. You can follow every rental and payout from your dashboard.",
          ],
        },
        {
          title: "Our promise",
          paragraphs: [
            "We keep the rules short and the prices clear. Only approved listings appear in search. Payments run through Stripe, and we never show a listing that an owner has hidden.",
            "We are a small team, but we read every message. If something is not clear, we will help you.",
          ],
          items: [
            "Approved listings only",
            "Clear daily prices",
            "Secure Stripe checkout",
            "Real PDF receipts",
            "Human support by email",
          ],
        },
        {
          title: "Get in touch",
          paragraphs: [
            "Questions, ideas or feedback? Send us a short note. We usually reply within one business day.",
          ],
          items: [
            "Email: hello@rentora.com",
            "Read the help center for quick answers",
            "Visit the contact page to send a message",
          ],
        },
      ]}
    />
  )
}
