import type { Metadata } from "next"

import { InfoPage } from "@/components/layout/info-page"

export const metadata: Metadata = {
  title: "Terms of service | Rentora",
  description:
    "The simple rules for using Rentora to book, list and share equipment.",
}

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Terms of service"
      intro="These are the rules for using Rentora. We wrote them in plain English so they are easy to read. By using the site, you agree to them."
      updated="November 2026"
      ctaLabel="Read the help center"
      ctaHref="/help"
      sections={[
        {
          title: "Who can use Rentora",
          paragraphs: [
            "You need an account to book or list equipment. Customers make bookings. Owners add listings. Admins manage approvals, users and rentals.",
            "Give correct account details and keep your password private. Tell us if you think someone else is using your account.",
          ],
        },
        {
          title: "Listings and approval",
          paragraphs: [
            "Owners are responsible for the details they add: name, price, location, photos, description and number of units.",
            "New listings wait for admin approval. We may hide or remove a listing if the details are wrong, unsafe or not allowed.",
          ],
        },
        {
          title: "Bookings and payment",
          paragraphs: [
            "The total price is price per day × number of days × number of units. A checkout holds your dates for 30 minutes. The booking becomes Active only after Stripe confirms payment.",
            "Unpaid holds expire automatically. Successful payments create a rental record and a receipt.",
          ],
          items: [
            "Active — paid and ready to use",
            "Cancelled — hold expired or booking was cancelled",
            "Completed — rental dates are finished",
          ],
        },
        {
          title: "Using the equipment",
          paragraphs: [
            "Treat rented gear with care and return it on time. Agree the pickup and return details with the owner before the rental starts.",
            "If something breaks or you cannot return the item, contact us and the owner as soon as you can.",
          ],
        },
        {
          title: "Fees",
          paragraphs: [
            "When a rental is paid, the owner receives 98% of the total. Rentora keeps 2% to run the site, payments and support.",
          ],
        },
        {
          title: "Reviews",
          paragraphs: [
            "You can leave one review for each paid, completed rental. Reviews must be honest and about the rental itself.",
          ],
        },
        {
          title: "Changes to these terms",
          paragraphs: [
            "We may update these terms as Rentora grows. The updated date at the top of this page tells you when we last changed them.",
            "If you do not agree with a change, please stop using the site and email us.",
          ],
        },
        {
          title: "Contact",
          paragraphs: [
            "Questions about these terms? Write to hello@rentora.com and we will help.",
          ],
        },
      ]}
    />
  )
}
