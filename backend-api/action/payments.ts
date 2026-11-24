// backend-api/action/payments.ts
// Stripe: start a checkout and check its result after the redirect.
import { apiFetch, query } from "../client"
import type {
  BookingCheckoutInput,
  CheckoutSession,
  PaymentVerification,
} from "../types"

/**
 * Ask the server to create a Stripe Checkout session for a booking.
 * Dates and delivery info are checked on the server; the price always comes
 * from MongoDB, so the browser cannot change it.
 */
export async function createCheckout(
  input: BookingCheckoutInput
): Promise<CheckoutSession> {
  return apiFetch<CheckoutSession>("/payments/checkout", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

/** Verify the session Stripe sends back to the success page. */
export async function verifyPayment(
  sessionId: string
): Promise<PaymentVerification> {
  return apiFetch<PaymentVerification>(
    `/payments/verify${query({ session_id: sessionId })}`
  )
}

/** Give the dates back after the customer cancels at Stripe. */
export async function cancelHold(bookingId: string): Promise<void> {
  await apiFetch("/payments/cancel-hold", {
    method: "POST",
    body: JSON.stringify({ bookingId }),
  })
}
