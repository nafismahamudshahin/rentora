// backend-api/api/payments.ts
// Read: admin payment transactions.
import { apiFetch } from "../client"
import type { Payment } from "../types"

/** Payment transactions (admin). */
export async function getPayments(): Promise<Payment[]> {
  return apiFetch<Payment[]>("/payments")
}
