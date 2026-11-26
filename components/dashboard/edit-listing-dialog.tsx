"use client"

// components/dashboard/edit-listing-dialog.tsx
// Owner-facing shadcn dialog for editing one equipment listing.

import { useState } from "react"
import type { FormEvent } from "react"
import { AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateListing } from "@/backend-api/action/listings"
import type { Equipment } from "@/backend-api/types"
import { btnPrimary, nativeFieldClass } from "@/components/dashboard/styles"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  "Construction",
  "Photography",
  "Audio & Video",
  "Events",
  "Tools",
  "Other",
]

type Fields = {
  name: string
  category: string
  price: string
  availableQuantity: string
  location: string
  image: string
  description: string
}

type Props = {
  listing: Equipment | null
  onClose: () => void
  onUpdated: (listing: Equipment) => void
}

function toFields(listing: Equipment): Fields {
  return {
    name: listing.name,
    category: listing.category,
    price: String(listing.pricePerDay),
    availableQuantity: String(listing.availableQuantity ?? 1),
    location: listing.location,
    image: listing.image ?? "",
    description: listing.description ?? "",
  }
}

export function EditListingDialog({ listing, onClose, onUpdated }: Props) {
  const [fields, setFields] = useState<Fields>(() =>
    listing ? toFields(listing) : toFields(emptyListing())
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!listing) return null
  // Keep a non-null id for the submit closure.
  const listingId = listing.id

  function update(key: keyof Fields, value: string) {
    setFields((previous) => ({ ...previous, [key]: value }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const name = fields.name.trim()
    const category = fields.category
    const location = fields.location.trim()
    const description = fields.description.trim()
    const price = Number(fields.price)
    const availableQuantity = Number(fields.availableQuantity)
    const image = fields.image.trim()

    if (!name || !category || !location) {
      setError("Name, category and location are required.")
      return
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a price per day greater than 0.")
      return
    }
    if (
      !Number.isInteger(availableQuantity) ||
      availableQuantity < 1 ||
      availableQuantity > 1000
    ) {
      setError("Available quantity must be a whole number from 1 to 1000.")
      return
    }
    if (image) {
      try {
        const parsed = new URL(image)
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          setError("Photo URL must start with http:// or https://")
          return
        }
      } catch {
        setError("Photo URL must start with http:// or https://")
        return
      }
    }

    setBusy(true)
    try {
      const updated = await updateListing(listingId, {
        name,
        category,
        price,
        availableQuantity,
        location,
        description,
        image,
      })
      onUpdated(updated)
      toast.success("Listing updated — sent for admin review again")
      onClose()
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Couldn't update the listing"
      setError(message)
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose()
      }}
    >
      <DialogContent>
        <form
          onSubmit={submit}
          noValidate
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <DialogHeader className="border-b border-[#EDE6D8]">
            <DialogTitle>Edit listing</DialogTitle>
            <DialogDescription>
              Update the details customers see. Changes go back for admin
              review.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Equipment name</Label>
              <Input
                id="edit-name"
                value={fields.name}
                onChange={(event) => update("name", event.target.value)}
                disabled={busy}
                className={cn(
                  nativeFieldClass,
                  "h-11 border-[#EDE6D8] bg-[#FAF7F2] px-3"
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <select
                id="edit-category"
                value={fields.category}
                onChange={(event) => update("category", event.target.value)}
                disabled={busy}
                className={cn(
                  nativeFieldClass,
                  "h-11 border-[#EDE6D8] bg-[#FAF7F2]"
                )}
              >
                <option value="" disabled>
                  Select a category
                </option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price per day (৳)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={fields.price}
                  onChange={(event) => update("price", event.target.value)}
                  disabled={busy}
                  className={cn(
                    nativeFieldClass,
                    "h-11 border-[#EDE6D8] bg-[#FAF7F2] px-3"
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Available quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min="1"
                  max="1000"
                  step="1"
                  inputMode="numeric"
                  value={fields.availableQuantity}
                  onChange={(event) =>
                    update("availableQuantity", event.target.value)
                  }
                  disabled={busy}
                  className={cn(
                    nativeFieldClass,
                    "h-11 border-[#EDE6D8] bg-[#FAF7F2] px-3"
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={fields.location}
                onChange={(event) => update("location", event.target.value)}
                disabled={busy}
                className={cn(
                  nativeFieldClass,
                  "h-11 border-[#EDE6D8] bg-[#FAF7F2] px-3"
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-image">Photo URL</Label>
              <Input
                id="edit-image"
                type="url"
                inputMode="url"
                value={fields.image}
                onChange={(event) => update("image", event.target.value)}
                placeholder="https://example.com/photo.jpg"
                disabled={busy}
                className={cn(
                  nativeFieldClass,
                  "h-11 border-[#EDE6D8] bg-[#FAF7F2] px-3"
                )}
              />
              <p className="text-xs text-stone-500">
                Leave empty to remove the photo. Use a direct http(s) image
                link.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <textarea
                id="edit-description"
                rows={4}
                maxLength={500}
                value={fields.description}
                onChange={(event) =>
                  update("description", event.target.value.slice(0, 500))
                }
                disabled={busy}
                className={cn(
                  nativeFieldClass,
                  "min-h-28 resize-none rounded-xl border-[#EDE6D8] bg-[#FAF7F2] px-3 py-2.5"
                )}
              />
              <p className="text-right text-xs text-stone-500">
                {fields.description.length}/500
              </p>
            </div>

            {error ? (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                {error}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={busy}
              className="h-11 w-full rounded-full sm:w-auto sm:px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={busy}
              className={cn(
                "h-11 w-full rounded-full px-6 sm:w-auto",
                btnPrimary
              )}
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : null}
              {busy ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function emptyListing(): Equipment {
  return {
    id: "",
    name: "",
    ownerId: "",
    ownerName: "",
    category: "",
    pricePerDay: 0,
    location: "",
    status: "Available",
    availableQuantity: 1,
    reviewStatus: "Pending review",
    rating: 0,
    image: "",
  }
}
