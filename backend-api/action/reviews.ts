// backend-api/action/reviews.ts
// Write: a customer reviews a rental they paid for.
import { apiFetch } from "../client"
import type { CustomerReview, NewReview } from "../types"

/** Create a review for one paid rental. One review per rental is allowed. */
export async function createReview(input: NewReview): Promise<CustomerReview> {
  return apiFetch<CustomerReview>("/reviews", {
    method: "POST",
    body: JSON.stringify(input),
  })
}
