"use client"

// app/dashboard/profile/page.tsx  (all roles)

/* eslint-disable @next/next/no-img-element */
// Profile photos can be arbitrary remote URLs or a local data URL preview,
// so next/image's remote allowlist would not apply here.

import { useRef, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { motion, useReducedMotion } from "framer-motion"
import {
  AlertCircle,
  Camera,
  Check,
  ImagePlus,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Trash2,
  UserRound,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import {
  normalizeRole,
  ROLE_LABEL,
  type Role,
} from "@/components/dashboard/nav-config"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatusBadge, type Tone } from "@/components/dashboard/status-badge"
import {
  btnOutline,
  btnPrimary,
  card,
  fieldClass,
} from "@/components/dashboard/styles"
import { updateProfile } from "@/backend-api/action/profile"

type ProfileUser = {
  id?: string
  name?: string
  email?: string
  image?: string | null
  phone?: string | null
  address?: string | null
  role?: string | null
}

const MAX_IMAGE_BYTES = 2 * 1024 * 1024
const EASE = [0.22, 1, 0.36, 1] as const

const ROLE_TONE: Record<Role, Tone> = {
  admin: "info",
  owner: "success",
  customer: "neutral",
}

function isValidImageSrc(value: string) {
  const v = value.trim()
  if (!v) return false
  if (v.startsWith("data:image/")) return true
  try {
    const url = new URL(v)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

/** Shows the image when there is one, otherwise the user's initial. */
function Avatar({
  src,
  name,
  className,
}: {
  src: string
  name: string
  className?: string
}) {
  const [broken, setBroken] = useState(false)
  const initial = (name.trim().charAt(0) || "?").toUpperCase()

  if (src && !broken) {
    return (
      <img
        src={src}
        alt={`${name || "User"}'s profile photo`}
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
        className={cn("size-full object-cover", className)}
      />
    )
  }

  return (
    <span
      aria-hidden
      className={cn(
        "grid size-full place-items-center bg-gradient-to-br from-[#FF6B2C] to-[#E85A1C] font-bold text-[#111827]",
        className
      )}
    >
      {initial}
    </span>
  )
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div>
      <h3 className="text-sm font-bold text-[#111827]">{title}</h3>
      {subtitle ? (
        <p className="mt-0.5 text-xs text-stone-500">{subtitle}</p>
      ) : null}
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-[#FAF6F0] text-stone-500">
        <Icon className="size-3.5" aria-hidden />
      </span>
      <div className="min-w-0">
        <dt className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">
          {label}
        </dt>
        <dd className="mt-0.5 text-sm break-words text-[#111827]">{value}</dd>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { data: session } = authClient.useSession()
  const user = session?.user as ProfileUser | undefined

  if (!user) return null

  return (
    <>
      <PageHeader
        title="My Profile"
        description="Your identity and account settings."
      />
      <ProfileEditor key={user.id ?? user.email} user={user} />
    </>
  )
}

function ProfileEditor({ user }: { user: ProfileUser }) {
  const reduce = useReducedMotion() ?? false
  const fileInput = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(user.name ?? "")
  const [image, setImage] = useState(user.image ?? "")
  const [phone, setPhone] = useState(user.phone ?? "")
  const [address, setAddress] = useState(user.address ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const role = normalizeRole(user.role)
  const photo = image.trim()
  const dirty =
    name.trim() !== (user.name ?? "") ||
    phone.trim() !== (user.phone ?? "") ||
    address.trim() !== (user.address ?? "") ||
    photo !== (user.image ?? "")

  function discard() {
    setName(user.name ?? "")
    setImage(user.image ?? "")
    setPhone(user.phone ?? "")
    setAddress(user.address ?? "")
    setError(null)
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = "" // allow picking the same file again
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.")
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image must be 2 MB or smaller.")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result)
        setError(null)
      }
    }
    reader.onerror = () => setError("Couldn't read that image. Try another.")
    reader.readAsDataURL(file)
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const cleanName = name.trim()
    if (!cleanName) return setError("Name is required.")
    if (photo && !isValidImageSrc(photo))
      return setError("Photo must be a valid image link.")

    setSaving(true)
    try {
      const result = await updateProfile({
        name: cleanName,
        image: photo || null,
        phone: phone.trim(),
        address: address.trim(),
      })
      if (!result.ok) {
        setError(result.error ?? "Could not update your profile.")
        return
      }
      toast.success("Profile updated")
    } catch {
      setError("Something went wrong. Try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
      {/* Identity card */}
      <motion.section
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
        className={cn(card, "h-fit overflow-hidden p-0 sm:p-0")}
      >
        <div className="relative h-28 overflow-hidden bg-gradient-to-br from-[#111827] via-[#27364C] to-[#FF6B2C]">
          <div
            aria-hidden
            className="absolute -top-12 -right-8 size-40 rounded-full border-[18px] border-white/10"
          />
          <div
            aria-hidden
            className="absolute -bottom-20 left-8 size-40 rounded-full border-[14px] border-white/10"
          />
          <span className="absolute top-4 right-4 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold tracking-widest text-white uppercase backdrop-blur">
            Member
          </span>
        </div>

        <div className="px-5 pb-5">
          <div className="relative -mt-10 mb-3 flex items-end justify-between gap-2">
            <div className="relative size-20 rounded-full bg-white p-1 shadow-lg">
              <div className="size-full overflow-hidden rounded-full">
                <Avatar key={photo || "empty"} src={photo} name={name} />
              </div>
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                aria-label="Change profile photo"
                className="absolute -right-1 -bottom-1 grid size-8 place-items-center rounded-full bg-[#FF6B2C] text-[#111827] ring-4 ring-white transition hover:bg-[#E85A1C]"
              >
                <Camera className="size-4" aria-hidden />
              </button>
            </div>
            {photo !== (user.image ?? "") ? (
              <span className="mb-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold tracking-wide text-amber-900 uppercase">
                Photo preview
              </span>
            ) : dirty ? (
              <span className="mb-1 rounded-full bg-stone-200 px-2.5 py-1 text-[10px] font-bold tracking-wide text-stone-700 uppercase">
                Unsaved
              </span>
            ) : null}
          </div>

          <h2 className="truncate text-xl font-bold text-[#111827]">
            {name || "Your name"}
          </h2>
          <p className="mt-0.5 truncate text-sm text-stone-500">{user.email}</p>
          <div className="mt-3">
            <StatusBadge tone={ROLE_TONE[role]}>{ROLE_LABEL[role]}</StatusBadge>
          </div>

          <dl className="mt-5 space-y-3 border-t border-stone-100 pt-4">
            <InfoRow icon={Mail} label="Email" value={user.email ?? "—"} />
            <InfoRow icon={Phone} label="Phone" value={phone || "Not added"} />
            <InfoRow
              icon={MapPin}
              label="Address"
              value={address || "Not added"}
            />
          </dl>
        </div>
      </motion.section>

      {/* Editor */}
      <motion.form
        onSubmit={onSubmit}
        noValidate
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.14, ease: EASE }}
        className={cn(card, "overflow-hidden p-0 sm:p-0")}
      >
        <header className="flex items-center gap-3 border-b border-stone-100 px-5 py-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#FF6B2C]/15 text-[#8A3300]">
            <UserRound className="size-4" aria-hidden />
          </span>
          <div>
            <h2 className="text-base font-bold text-[#111827]">Edit profile</h2>
            <p className="text-xs text-stone-500">
              Update how you appear across Rentora.
            </p>
          </div>
        </header>

        <div className="space-y-6 px-5 py-5">
          {/* Photo */}
          <section>
            <SectionTitle
              title="Profile photo"
              subtitle="Paste a link or upload an image — the preview updates instantly."
            />
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-[#FAF6F0]">
                <Avatar key={photo || "empty"} src={photo} name={name} />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <Input
                  id="photo"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  disabled={saving}
                  aria-label="Profile photo link"
                  className={fieldClass}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => fileInput.current?.click()}
                    disabled={saving}
                    className={btnOutline}
                  >
                    <ImagePlus className="size-3.5" aria-hidden />
                    Upload image
                  </Button>
                  {photo ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setImage("")}
                      disabled={saving}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                      Remove
                    </Button>
                  ) : null}
                  <span className="text-[11px] text-stone-400">
                    JPG, PNG or WEBP · max 2 MB
                  </span>
                </div>
              </div>
            </div>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
              aria-label="Upload profile photo"
            />
          </section>

          {/* Personal details */}
          <section className="border-t border-stone-100 pt-5">
            <SectionTitle
              title="Personal details"
              subtitle="Your name is visible to other renters."
            />
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold">
                  Full name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving}
                  className={fieldClass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold">
                  Email address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    value={user.email ?? ""}
                    disabled
                    readOnly
                    className={cn(fieldClass, "pr-10")}
                  />
                  <Check
                    aria-hidden
                    className="absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-emerald-600"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="border-t border-stone-100 pt-5">
            <SectionTitle
              title="Contact & address"
              subtitle="Used to coordinate your rentals."
            />
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-semibold">
                  Phone number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +880 1700 000000"
                  disabled={saving}
                  className={fieldClass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="font-semibold">
                  Address
                </Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, city, area"
                  disabled={saving}
                  className={fieldClass}
                />
              </div>
            </div>
          </section>

          {/* Account */}
          <section className="border-t border-stone-100 pt-5">
            <SectionTitle title="Account" subtitle="Managed by Rentora." />
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-[#FAF6F0] p-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-[#8A3300]">
                <ShieldCheck className="size-4" aria-hidden />
              </span>
              <div>
                <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                  Account type
                </p>
                <p className="text-sm font-bold text-[#111827]">
                  {ROLE_LABEL[role]}
                </p>
              </div>
            </div>
          </section>

          {error ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {error}
            </p>
          ) : null}
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 bg-[#FAF6F0]/60 px-5 py-4">
          <p className="text-xs text-stone-500">
            {dirty ? "You have unsaved changes." : "All changes saved."}
          </p>
          <div className="flex items-center gap-2">
            {dirty ? (
              <Button
                type="button"
                variant="ghost"
                onClick={discard}
                disabled={saving}
              >
                Discard
              </Button>
            ) : null}
            <Button
              type="submit"
              disabled={saving || !dirty}
              className={cn("h-11 px-6", btnPrimary)}
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Saving
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </footer>
      </motion.form>
    </div>
  )
}
