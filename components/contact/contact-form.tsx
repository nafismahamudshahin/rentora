"use client"

import { useState, type FormEvent } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const CONTACT_EMAIL = "hello@rentora.com"

const topics = [
  "Booking question",
  "Payment or receipt",
  "List your equipment",
  "Account help",
  "Something else",
]

export function ContactForm() {
  const [openedEmail, setOpenedEmail] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const data = new FormData(event.currentTarget)
    const name = String(data.get("name") ?? "").trim()
    const email = String(data.get("email") ?? "").trim()
    const topic = String(data.get("topic") ?? "")
    const message = String(data.get("message") ?? "").trim()

    const subject = `Rentora contact: ${topic}`
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Topic: ${topic}`,
      "",
      message,
    ].join("\n")

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setOpenedEmail(true)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Your name</Label>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            placeholder="Your name"
            required
            className="h-11 rounded-xl border-[#e8e2d8] bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">Email address</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            required
            className="h-11 rounded-xl border-[#e8e2d8] bg-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-topic">What is it about?</Label>
        <select
          id="contact-topic"
          name="topic"
          defaultValue={topics[0]}
          className="h-11 w-full rounded-xl border border-[#e8e2d8] bg-white px-3 text-sm text-[#111827] transition-colors outline-none focus:border-[#FF6B2C] focus:ring-3 focus:ring-[#FF6B2C]/20"
        >
          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">Your message</Label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          required
          placeholder="Tell us how we can help..."
          className="w-full rounded-xl border border-[#e8e2d8] bg-white px-3 py-2.5 text-sm leading-relaxed text-[#111827] transition-colors outline-none placeholder:text-stone-400 focus:border-[#FF6B2C] focus:ring-3 focus:ring-[#FF6B2C]/20"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-stone-500">
          This opens your email app with the message ready to send.
        </p>
        <Button
          type="submit"
          className="h-11 rounded-xl bg-[#FF6B2C] px-6 font-bold text-[#111827] hover:bg-[#FF6B2C]/90"
        >
          Open email
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>

      {openedEmail ? (
        <p
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          Your email app should open now. If nothing happens, write to{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-semibold underline underline-offset-2"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      ) : null}
    </form>
  )
}
