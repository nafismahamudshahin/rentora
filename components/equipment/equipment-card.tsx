"use client"

// components/equipment/equipment-card.tsx
// One equipment listing card. Shared by the home section and catalog page.

import Link from "next/link"
import { ArrowRight, Boxes, Heart, MapPin, Star } from "lucide-react"

import type { Equipment } from "@/backend-api/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { unitsOf } from "@/lib/booking"
import { bdt } from "@/lib/format"
import { cn } from "@/lib/utils"

type EquipmentCardProps = {
  item: Equipment
  isFavorite: boolean
  pending: boolean
  onToggleFavorite: (item: Equipment) => void
}

export function EquipmentCard({
  item,
  isFavorite,
  pending,
  onToggleFavorite,
}: EquipmentCardProps) {
  const isRented = item.status === "Rented"

  return (
    <Card className="group flex h-full gap-0 overflow-hidden rounded-[24px] border-[#EDE6D8] bg-white py-0 shadow-[0_1px_2px_rgba(17,24,39,.05),0_18px_36px_-18px_rgba(17,24,39,.22)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_50px_-22px_rgba(17,24,39,.32)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={item.name}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="grid size-full place-items-center text-sm text-stone-500">
            No image yet
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <Badge className="rounded-full border-0 bg-white/95 px-3 py-1 text-[11px] font-bold text-[#111827] shadow-sm backdrop-blur hover:bg-white">
            {item.category}
          </Badge>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            aria-label={
              isFavorite
                ? `Remove ${item.name} from favorites`
                : `Add ${item.name} to favorites`
            }
            aria-pressed={isFavorite}
            disabled={pending}
            onClick={() => onToggleFavorite(item)}
            className="size-9 shrink-0 rounded-full border border-white/70 bg-white/90 text-[#111827] shadow-sm backdrop-blur hover:bg-white"
          >
            <Heart
              aria-hidden
              className={cn(
                "size-[18px]",
                isFavorite && "fill-[#FF6B2C] text-[#FF6B2C]"
              )}
            />
          </Button>
        </div>

        <div className="absolute bottom-3 left-3">
          <Badge
            className={cn(
              "rounded-full border-0 px-2.5 py-1 text-[11px] font-bold shadow-sm",
              isRented
                ? "bg-[#FFF4ED] text-[#9A3412]"
                : "bg-[#111827] text-white"
            )}
          >
            <span
              className={cn(
                "mr-1.5 size-1.5 rounded-full",
                isRented ? "bg-[#FF6B2C]" : "bg-green-400"
              )}
              aria-hidden
            />
            {isRented ? "Rented" : "Available"}
          </Badge>
        </div>
      </div>

      <CardHeader className="gap-1.5 px-5 pt-5 pb-0">
        <CardTitle className="line-clamp-1 font-[family-name:var(--font-space-grotesk)] text-xl text-[#111827]">
          {item.name}
        </CardTitle>
        <CardDescription className="flex items-center gap-1.5 text-stone-500">
          <MapPin className="size-3.5" aria-hidden />
          {item.location}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 px-5 pt-3 pb-0">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
          <span className="flex items-center gap-1.5">
            <Boxes className="size-3.5 shrink-0" aria-hidden />
            {unitsOf(item.availableQuantity)} available
          </span>
          <span className="flex items-center gap-1 font-semibold text-[#B45309]">
            <Star className="size-3.5 fill-current" aria-hidden />
            {item.rating > 0 ? item.rating.toFixed(1) : "New"}
          </span>
        </div>
        <p className="mt-2 line-clamp-1 text-xs text-stone-500">
          by {item.ownerName || "Rentora owner"}
        </p>
      </CardContent>

      <CardFooter className="mt-5 items-center justify-between gap-3 border-t border-[#EDE6D8] px-5 py-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.12em] text-stone-400 uppercase">
            From
          </p>
          <p className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-[#111827]">
            {bdt(item.pricePerDay)}
            <span className="ml-1 text-sm font-medium text-stone-500">
              / day
            </span>
          </p>
        </div>
        <Button
          render={<Link href={`/equipment/${item.id}`} />}
          nativeButton={false}
          size="sm"
          className="h-10 rounded-full bg-[#FF6B2C] px-4 font-bold text-[#111827] hover:bg-[#FF6B2C]/90"
        >
          Details
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </CardFooter>
    </Card>
  )
}

export default EquipmentCard
