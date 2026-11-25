"use client"

// app/dashboard/add-equipment/page.tsx  (owner)
// A modern listing form with a live photo preview. The photo is added by URL,
// so no upload server is needed.

import { useState } from "react"
import type { FormEvent, ReactNode } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import {
  AlertCircle,
  ArrowRight,
  Boxes,
  Camera,
  CheckCircle2,
  ImagePlus,
  Link2,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Tag,
  Wallet,
  X,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/dashboard/page-header"
import { btnPrimary, nativeFieldClass } from "@/components/dashboard/styles"
import { createEquipment } from "@/backend-api/action/equipment"
import { unitsOf } from "@/lib/booking"
import { bdt } from "@/lib/format"
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

const EMPTY: Fields = {
  name: "",
  category: "",
  price: "",
  availableQuantity: "1",
  location: "",
  image: "",
  description: "",
}

// Show the step number and icon at the top of each section card.
const sectionClass =
  "rounded-[26px] border border-[#EDE6D8] bg-white p-5 shadow-[0_14px_34px_-20px_rgba(17,24,39,.28)] sm:p-6"

export default function AddEquipmentPage() {
  const router = useRouter()
  const reduce = useReducedMotion() ?? false
  const [fields, setFields] = useState<Fields>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoTouched, setPhotoTouched] = useState(false)
  const [photoBroken, setPhotoBroken] = useState(false)

  function update(key: keyof Fields, value: string) {
    setFields((previous) => ({ ...previous, [key]: value }))
    if (key === "image") {
      setPhotoBroken(false)
      setError(null)
    }
  }

  const photoUrl = fields.image.trim()
  let photoError = ""
  if (photoUrl) {
    try {
      const parsed = new URL(photoUrl)
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        photoError = "Photo URL must start with http:// or https://"
      }
    } catch {
      photoError = "Photo URL must start with http:// or https://"
    }
  }
  const showPhotoError = photoTouched && Boolean(photoError)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPhotoTouched(true)

    const name = fields.name.trim()
    const location = fields.location.trim()
    const description = fields.description.trim()
    const price = Number(fields.price)
    const availableQuantity = Number(fields.availableQuantity)

    if (!name || !fields.category || !location) {
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
    if (photoError) {
      setError("Fix the photo URL or leave it empty.")
      return
    }

    setSaving(true)
    try {
      await createEquipment({
        name,
        category: fields.category,
        price,
        availableQuantity,
        location,
        description,
        image: photoUrl,
      })
      toast.success("Equipment added — it will appear after admin approval")
      router.push("/dashboard/listings")
    } catch {
      setError("Could not add equipment. Try again.")
      setSaving(false)
    }
  }

  const previewPrice = Number(fields.price)
  const canPreviewPhoto = Boolean(photoUrl) && !photoError && !photoBroken

  return (
    <>
      <PageHeader
        title="Add Equipment"
        description="Create a listing with clear details and a photo customers can trust."
        actions={
          <span className="hidden items-center gap-2 rounded-full border border-[#EDE6D8] bg-white px-4 py-2 text-xs font-semibold text-stone-600 sm:inline-flex">
            <Sparkles className="size-3.5 text-[#FF6B2C]" aria-hidden />
            Takes about 2 minutes
          </span>
        }
      />

      <motion.form
        onSubmit={onSubmit}
        noValidate
        initial={reduce ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
      >
        <div className="min-w-0 space-y-5">
          {/* Section 1 — what the item is */}
          <section className={sectionClass} aria-labelledby="basics-heading">
            <SectionTitle
              number="01"
              icon={Tag}
              id="basics-heading"
              title="Basic information"
              hint="Give customers a clear idea of what you are listing."
            />
            <div className="mt-5 space-y-4">
              <Field label="Equipment name" htmlFor="name">
                <Input
                  id="name"
                  value={fields.name}
                  onChange={(event) => update("name", event.target.value)}
                  placeholder="e.g. Sony A7 IV Kit"
                  disabled={saving}
                  className="h-12 rounded-xl border-[#EDE6D8] bg-[#FAF7F2] px-4 text-sm"
                />
              </Field>

              <Field label="Category" htmlFor="category">
                <select
                  id="category"
                  value={fields.category}
                  onChange={(event) => update("category", event.target.value)}
                  disabled={saving}
                  className={cn(nativeFieldClass, "h-12 rounded-xl border-[#EDE6D8] bg-[#FAF7F2]")}
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
              </Field>
            </div>
          </section>

          {/* Section 2 — price and place */}
          <section className={sectionClass} aria-labelledby="price-heading">
            <SectionTitle
              number="02"
              icon={Wallet}
              id="price-heading"
              title="Price & location"
              hint="The price you set is charged for each rental day."
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Price per day (৳)" htmlFor="price">
                <Input
                  id="price"
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={fields.price}
                  onChange={(event) => update("price", event.target.value)}
                  placeholder="4500"
                  disabled={saving}
                  className="h-12 rounded-xl border-[#EDE6D8] bg-[#FAF7F2] px-4 text-sm"
                />
              </Field>
              <Field label="Available Quantity" htmlFor="available-quantity">
                <Input
                  id="available-quantity"
                  type="number"
                  min="1"
                  max="1000"
                  step="1"
                  inputMode="numeric"
                  value={fields.availableQuantity}
                  onChange={(event) =>
                    update("availableQuantity", event.target.value)
                  }
                  placeholder="1"
                  disabled={saving}
                  className="h-12 rounded-xl border-[#EDE6D8] bg-[#FAF7F2] px-4 text-sm"
                />
              </Field>
              <Field label="Location" htmlFor="location">
                <Input
                  id="location"
                  value={fields.location}
                  onChange={(event) => update("location", event.target.value)}
                  placeholder="City or area"
                  disabled={saving}
                  className="h-12 rounded-xl border-[#EDE6D8] bg-[#FAF7F2] px-4 text-sm"
                />
              </Field>
            </div>
          </section>

          {/* Section 3 — photo by URL */}
          <section className={sectionClass} aria-labelledby="photo-heading">
            <SectionTitle
              number="03"
              icon={ImagePlus}
              id="photo-heading"
              title="Photo URL"
              hint="Paste a direct image link. The preview updates as you type."
            />
            <div className="mt-5 relative">
              <Link2
                className="pointer-events-none absolute top-[38px] left-4 size-4 text-stone-400"
                aria-hidden
              />
              <Input
                id="image"
                type="url"
                inputMode="url"
                value={fields.image}
                onChange={(event) => update("image", event.target.value)}
                onBlur={() => setPhotoTouched(true)}
                placeholder="https://example.com/my-equipment.jpg"
                disabled={saving}
                aria-invalid={showPhotoError}
                aria-describedby="photo-help"
                className={cn(
                  "h-12 rounded-xl border-[#EDE6D8] bg-[#FAF7F2] pr-24 pl-11 text-sm",
                  showPhotoError && "border-red-400 focus-visible:ring-red-300"
                )}
              />
              {photoUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    update("image", "")
                    setPhotoTouched(false)
                  }}
                  disabled={saving}
                  className="absolute top-[34px] right-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-stone-500 shadow-sm hover:text-[#111827] disabled:opacity-50"
                >
                  <X className="size-3" aria-hidden />
                  Clear
                </button>
              ) : null}
            </div>
            {showPhotoError ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-600">
                <AlertCircle className="size-3.5" aria-hidden />
                {photoError}
              </p>
            ) : (
              <p id="photo-help" className="mt-2 text-xs text-stone-500">
                Optional, but listings with a clear photo get more interest.
                Use a link that ends in an image (jpg, png, webp).
              </p>
            )}
          </section>

          {/* Section 4 — longer description */}
          <section className={sectionClass} aria-labelledby="description-heading">
            <SectionTitle
              number="04"
              icon={Camera}
              id="description-heading"
              title="Description"
              hint="Mention condition, what is included, and pickup details."
            />
            <div className="mt-5 relative">
              <textarea
                id="description"
                value={fields.description}
                onChange={(event) => update("description", event.target.value.slice(0, 500))}
                maxLength={500}
                rows={4}
                placeholder="e.g. Recently serviced, comes with two batteries and a carrying case…"
                disabled={saving}
                className={cn(
                  nativeFieldClass,
                  "min-h-32 resize-none rounded-xl border-[#EDE6D8] bg-[#FAF7F2] px-4 py-3 pb-8"
                )}
              />
              <span className="absolute right-4 bottom-3 text-xs text-stone-400">
                {fields.description.length}/500
              </span>
            </div>
          </section>

          {error ? (
            <p
              role="alert"
              className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
            >
              <AlertCircle className="size-4 shrink-0" aria-hidden />
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              type="submit"
              disabled={saving}
              className={cn("h-12 px-7 text-sm", btnPrimary)}
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Adding listing...
                </>
              ) : (
                <>
                  Add equipment
                  <ArrowRight className="size-4" aria-hidden />
                </>
              )}
            </Button>
            <Button
              render={<Link href="/dashboard/listings" />}
              nativeButton={false}
              type="button"
              variant="ghost"
              disabled={saving}
              className="h-12 rounded-full px-5 font-semibold text-stone-600 hover:text-[#111827]"
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* Live preview */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wide text-stone-500 uppercase">
            <Sparkles className="size-3.5 text-[#FF6B2C]" aria-hidden />
            Live preview
          </div>
          <div className="overflow-hidden rounded-[26px] border border-[#EDE6D8] bg-white shadow-[0_18px_40px_-20px_rgba(17,24,39,.35)]">
            <div className="relative aspect-[4/3] overflow-hidden bg-[#FAF7F2]">
              {canPreviewPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt="Preview of your equipment"
                  onError={() => setPhotoBroken(true)}
                  className="size-full object-cover"
                />
              ) : (
                <div className="grid size-full place-items-center bg-[radial-gradient(rgba(17,24,39,.06)_1px,transparent_1px)] [background-size:20px_20px]">
                  <div className="text-center">
                    <div className="mx-auto grid size-14 place-items-center rounded-full bg-[#FFF4ED] text-[#9A3412]">
                      <Camera className="size-6" aria-hidden />
                    </div>
                    <p className="mt-3 text-xs font-semibold text-stone-500">
                      {photoUrl && !photoError
                        ? "Photo could not be loaded"
                        : "Your photo will appear here"}
                    </p>
                  </div>
                </div>
              )}
              <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold tracking-wide text-[#111827] uppercase shadow-sm">
                Preview
              </span>
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-[#FFF4ED] px-2.5 py-1 text-[10px] font-bold text-[#9A3412] uppercase">
                  {fields.category || "Category"}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500">
                  <Boxes className="size-3 text-[#FF6B2C]" aria-hidden />
                  {unitsOf(Number(fields.availableQuantity))} available
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500">
                  <MapPin className="size-3 text-[#FF6B2C]" aria-hidden />
                  {fields.location || "Location"}
                </span>
              </div>
              <h2 className="mt-3 font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-[#111827]">
                {fields.name || "Your equipment name"}
              </h2>
              <p className="mt-2 line-clamp-3 min-h-12 text-xs leading-5 text-stone-500">
                {fields.description ||
                  "A short description will appear here once you write one."}
              </p>
              <div className="mt-4 flex items-end justify-between border-t border-[#EDE6D8] pt-4">
                <div>
                  <p className="text-[10px] font-bold tracking-wide text-stone-400 uppercase">
                    Price per day
                  </p>
                  <p className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-[#111827]">
                    {fields.price && previewPrice > 0
                      ? bdt(previewPrice)
                      : "৳0"}
                  </p>
                </div>
                <ShieldCheck className="size-5 text-stone-300" aria-hidden />
              </div>
              <p className="mt-4 flex items-start gap-1.5 rounded-xl bg-[#FAF7F2] p-3 text-[11px] leading-4 text-stone-500">
                <CheckCircle2 className="mt-px size-3.5 shrink-0 text-emerald-600" aria-hidden />
                New listings are reviewed by an admin before customers see them.
              </p>
            </div>
          </div>
        </aside>
      </motion.form>
    </>
  )
}

function SectionTitle({
  number,
  icon: Icon,
  id,
  title,
  hint,
}: {
  number: string
  icon: LucideIcon
  id: string
  title: string
  hint: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#FFF4ED] text-[#9A3412]">
        <Icon className="size-5" aria-hidden />
      </div>
      <div>
        <p className="text-[10px] font-bold tracking-widest text-[#FF6B2C] uppercase">
          Step {number}
        </p>
        <h2
          id={id}
          className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-[#111827]"
        >
          {title}
        </h2>
        <p className="mt-0.5 text-xs text-stone-500">{hint}</p>
      </div>
    </div>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={htmlFor}
        className="px-0 py-0 text-sm font-semibold text-[#111827]"
      >
        {label}
      </Label>
      {children}
    </div>
  )
}
