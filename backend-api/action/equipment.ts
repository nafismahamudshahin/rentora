// backend-api/action/equipment.ts
// Write: admin approval/removal and owner listing creation.
import { apiFetch, segment } from "../client"
import type { NewEquipment } from "../types"

/** Admin approves a pending listing. */
export async function approveEquipment(id: string): Promise<void> {
  await apiFetch(`/equipment/${segment(id)}/approve`, { method: "PATCH" })
}

/** Admin removes a listing. */
export async function removeEquipment(id: string): Promise<void> {
  await apiFetch(`/equipment/${segment(id)}`, { method: "DELETE" })
}

/** Owner submits the "Add Equipment" form. */
export async function createEquipment(input: NewEquipment): Promise<void> {
  await apiFetch("/equipment", {
    method: "POST",
    body: JSON.stringify(input),
  })
}
