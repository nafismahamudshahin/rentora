import type { Metadata } from "next"

import { InfoPage } from "@/components/layout/info-page"

export const metadata: Metadata = {
  title: "Help center | Rentora",
  description:
    "Quick answers about Rentora bookings, payments, receipts, listings, reviews and accounts.",
}

export default function HelpPage() {
  return (
    <InfoPage
      eyebrow="Support"
      title="How can we help?"
      intro="Find a short answer below. If you cannot see what you need, send us a message and we will point you in the right direction."
      updated="November 2026"
      ctaLabel="Contact support"
      ctaHref="/contact"
      sections={[
        {
          title: "Booking basics",
          paragraphs: [
            "Only customers make bookings. Owners and admins manage listings and rentals from the dashboard.",
            "Choose your dates and the number of units. The total is price per day × days × units, and you see it before you pay.",
          ],
          items: [
            "Pick a listing from approved results",
            "Choose start and end dates",
            "Set the quantity you need",
            "Check the total on checkout",
          ],
        },
        {
          title: "Payments and checkout",
          paragraphs: [
            "Payments go through Stripe Checkout. After you start checkout, your dates are held for 30 minutes. If you do not pay, the hold expires and the dates are free again.",
            "After a successful payment, your booking becomes Active. Only successful payments count as real rentals.",
          ],
        },
        {
          title: "Receipts",
          paragraphs: [
            "You can download a PDF receipt from the payment success page or from My Rentals. The button appears after a successful payment.",
            "The receipt shows the item, your name and email, the paid date, the payment method, and the booking and payment references.",
          ],
        },
        {
          title: "Changing or cancelling a booking",
          paragraphs: [
            "Unpaid holds cancel themselves after 30 minutes. For a paid booking, contact us with your booking id and we will help you.",
            "An admin can also change a rental status to Active, Completed or Cancelled when needed.",
          ],
        },
        {
          title: "Listing your equipment",
          paragraphs: [
            "Owners can add gear with a photo, price, location and unit count. A new listing starts as Pending review, so it does not appear in public search yet.",
            "After an admin approves it, the listing becomes visible. Listings can still be hidden or removed if the details are wrong.",
          ],
        },
        {
          title: "Reviews",
          paragraphs: [
            "You can review a rental only after it was paid and completed. One paid rental gets one review, so reviews stay honest and useful.",
          ],
        },
        {
          title: "Accounts and login",
          paragraphs: [
            "You can sign up with email and password or with Google. If you follow a link to login while already signed in, we take you back to the page you wanted.",
            "If you forget which account you used, email us and we will help you find it.",
          ],
        },
        {
          title: "Still need help?",
          paragraphs: [
            "Write to hello@rentora.com. Please include your booking id, payment reference or listing name so we can answer faster.",
          ],
        },
      ]}
    />
  )
}
