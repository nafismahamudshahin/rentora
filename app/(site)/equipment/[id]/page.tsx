// app/(site)/equipment/[id]/page.tsx
import type { Metadata } from "next"

import { EquipmentDetails } from "@/components/equipment/equipment-details"

export const metadata: Metadata = {
  title: "Equipment details | Rentora",
  description: "See the price, availability and owner details for one rental listing.",
}

export default async function EquipmentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EquipmentDetails id={id} />
}
