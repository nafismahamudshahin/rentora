"use client"

// components/dashboard/review-dialog.tsx
// Small modal used on "My Rentals": a customer reviews a paid rental once.

import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Loader2, Star, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { createReview } from "@/backend-api/action/reviews"
import type { CustomerReview } from "@/backend-api/types"
import { btnPrimary } from "./styles"

type Rental = {
  id: string
  equipment: string
}

type Props = {
  rental: Rental | null
  onClose: () => void
  onSubmitted: (review: CustomerReview) => void
}

export function ReviewDialog({ rental, onClose, onSubmitted }: Props) {
  const [rating, setRating] = useState(0)
  const [text, setText] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!rental) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [rental, onClose])

  if (!rental) return null
  // Keep a plain string so the submit closure does not see a nullable prop.
  const rentalId = rental.id

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    if (!rating) {
      setError("Choose a star rating first.")
      return
    }
    if (!text.trim()) {
      setError("Write a short review before submitting.")
      return
    }

    setBusy(true)
    try {
      const review = await createReview({
        rentalId,
        rating,
        text: text.trim(),
      })
      onSubmitted(review)
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Couldn't submit your review"
      setError(message)
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-title"
        className="w-full max-w-md rounded-[26px] border border-[#EDE6D8] bg-white p-6 shadow-xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="review-title"
              className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-[#111827]"
            >
              Review your rental
            </h2>
            <p className="mt-1 text-sm text-stone-600">{rental.equipment}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
            disabled={busy}
          >
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-5">
          <div>
            <p className="text-sm font-semibold text-[#111827]">Your rating</p>
            <div className="mt-2 flex gap-1" role="group" aria-label="Rating from 1 to 5 stars">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  aria-label={`${value} star${value > 1 ? "s" : ""}`}
                  aria-pressed={rating === value}
                  className="rounded-md p-1 focus-visible:outline-2 focus-visible:outline-[#FF6B2C]"
                >
                  <Star
                    className={`size-7 ${
                      value <= rating
                        ? "fill-[#B45309] text-[#B45309]"
                        : "fill-stone-200 text-stone-200"
                    }`}
                    aria-hidden
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="review-text"
              className="text-sm font-semibold text-[#111827]"
            >
              Your review
            </label>
            <textarea
              id="review-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="How did the rental go?"
              className="mt-2 w-full resize-none rounded-xl border border-[#EDE6D8] bg-white p-3 text-sm outline-none focus-visible:border-[#FF6B2C] focus-visible:ring-2 focus-visible:ring-[#FF6B2C]/20"
            />
            <p className="mt-1 text-right text-xs text-stone-500">
              {text.length}/1000
            </p>
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {error}
            </p>
          ) : null}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={busy}
              className="h-11 flex-1 rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={busy}
              className={`h-11 flex-1 rounded-full ${btnPrimary}`}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              {busy ? "Submitting…" : "Submit review"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
