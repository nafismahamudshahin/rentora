import type { Metadata } from "next"

import { InfoPage } from "@/components/layout/info-page"

export const metadata: Metadata = {
  title: "Privacy policy | Rentora",
  description:
    "What information Rentora collects, why we use it and how we keep it safe.",
}

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Privacy policy"
      intro="We collect only the information we need to run Rentora. This page explains what we keep, why we keep it and what you can ask us to do with it."
      updated="November 2026"
      ctaLabel="Read the help center"
      ctaHref="/help"
      sections={[
        {
          title: "What we collect",
          paragraphs: [
            "When you create an account, we store your name, email address and profile details. Google sign-in gives us the same basic information.",
            "When you use Rentora, we also store listings, bookings, payments, reviews and support messages you send us.",
          ],
          items: [
            "Account: name, email, photo and role",
            "Listings: gear details, price, location and photos",
            "Bookings: dates, quantity, status and receipt details",
            "Support: the messages you send us",
          ],
        },
        {
          title: "Why we use it",
          paragraphs: [
            "We use your information to create accounts, show listings, take bookings, process payments, send support answers and keep the site safe.",
            "We do not sell your personal information.",
          ],
        },
        {
          title: "Payments",
          paragraphs: [
            "Card details go straight to Stripe. We do not store full card numbers. We keep the payment status, amount and reference so you can see receipts and owners can see earnings.",
          ],
        },
        {
          title: "Who can see your information",
          paragraphs: [
            "Owners see the booking details they need to arrange pickup and return. Admins can manage listings, users and rentals to keep the site working.",
            "We do not share your email or messages with other users for advertising.",
          ],
        },
        {
          title: "Cookies and sign-in",
          paragraphs: [
            "We use a sign-in cookie to keep you logged in. Your browser may also store a theme setting. We do not use advertising or tracking cookies.",
          ],
        },
        {
          title: "Your choices",
          paragraphs: [
            "You can update your profile from your dashboard. If you want a copy of your data or want us to delete your account details, email hello@rentora.com.",
            "We may keep payment and rental records when we need them for legal or accounting reasons.",
          ],
        },
        {
          title: "Keeping data safe",
          paragraphs: [
            "The site uses HTTPS, access roles and limited permissions. Only the people who need information to help you can see it.",
          ],
        },
        {
          title: "Contact",
          paragraphs: [
            "For privacy questions, email hello@rentora.com. We usually reply within one business day.",
          ],
        },
      ]}
    />
  )
}
