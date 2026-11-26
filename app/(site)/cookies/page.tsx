import type { Metadata } from "next"

import { InfoPage } from "@/components/layout/info-page"

export const metadata: Metadata = {
  title: "Cookie policy | Rentora",
  description: "A short guide to the cookies Rentora uses and why.",
}

export default function CookiesPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Cookie policy"
      intro="Cookies are small files a website stores in your browser. Rentora uses them only to keep you signed in and to remember simple settings."
      updated="November 2026"
      ctaLabel="Read the privacy policy"
      ctaHref="/privacy"
      sections={[
        {
          title: "The sign-in cookie",
          paragraphs: [
            "After you log in, a cookie keeps you signed in while you move between pages. Without it, you would have to log in again on every page.",
            "It is created by our authentication system and stays same-origin, so it is only sent to Rentora.",
          ],
        },
        {
          title: "Local settings",
          paragraphs: [
            "Your browser may keep a small local setting for the light or dark theme. This lives in your browser and is not sent to us.",
          ],
        },
        {
          title: "What we do not use",
          paragraphs: [
            "We do not use advertising cookies, tracking pixels or third-party analytics cookies on Rentora.",
          ],
        },
        {
          title: "Managing cookies",
          paragraphs: [
            "You can clear cookies in your browser settings at any time. If you clear the sign-in cookie, you will be logged out and can log in again.",
          ],
        },
        {
          title: "Contact",
          paragraphs: [
            "Questions about cookies? Email hello@rentora.com and we will answer.",
          ],
        },
      ]}
    />
  )
}
