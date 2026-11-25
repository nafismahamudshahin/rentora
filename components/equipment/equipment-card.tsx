"use client"

// components/equipment/equipment-card.tsx
// One equipment listing card. Shared by the home section and catalog page.

import Link from "next/link"
import { Boxes, Heart, MapPin, Star } from "lucide-react"

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
  return (
    <Card className="group h-full gap-0 overflow-hidden rounded-[22px] border-[#EDE6D8] bg-white py-0 shadow-[0_1px_2px_rgba(17,24,39,.05),0_18px_36px_-18px_rgba(17,24,39,.22)] transition-transform duration-200 hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={item.name}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center text-sm text-stone-500">
            No image yet
          </div>
        )}
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
          className="absolute top-3 right-3 size-9 rounded-full border border-white/70 bg-white/90 text-[#111827] shadow-sm backdrop-blur hover:bg-white"
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

      <CardHeader className="gap-2 px-5 pt-5 pb-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="rounded-full border-[#F6D9C8] bg-[#FFF4ED] text-[#9A3412]"
          >
            {item.category}
          </Badge>
        </div>
        <CardTitle className="mt-1 line-clamp-1 font-[family-name:var(--font-space-grotesk)] text-xl text-[#111827]">
          {item.name}
        </CardTitle>
        <CardDescription className="flex items-center gap-1.5 text-stone-500">
          <MapPin className="size-3.5" aria-hidden />
          {item.location}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex items-center justify-between gap-3 px-5 pt-3 pb-0 text-xs text-stone-500">
        <span className="flex items-center gap-1.5 truncate">
          <Boxes className="size-3.5 shrink-0" aria-hidden />
          {unitsOf(item.availableQuantity)} available · by {item.ownerName || "Rentora owner"}
        </span>
        <span className="flex shrink-0 items-center gap-1 font-semibold text-[#B45309]">
          <Star className="size-3.5 fill-current" aria-hidden />
          {item.rating > 0 ? item.rating.toFixed(1) : "New"}
        </span>
      </CardContent>

      <CardFooter className="justify-between gap-3 px-5 py-5">
        <p className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-[#111827]">
          {bdt(item.pricePerDay)}
          <span className="ml-1 text-sm font-medium text-stone-500">/ day</span>
        </p>
        <Button
          render={<Link href={`/equipment/${item.id}`} />}
          nativeButton={false}
          size="sm"
          className="h-9 rounded-full bg-[#FF6B2C] px-4 font-bold text-[#111827] hover:bg-[#FF6B2C]/90"
        >
          Details
        </Button>
      </CardFooter>
    </Card>
  )
}

export default EquipmentCard
