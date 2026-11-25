// backend-api/api/reviews.ts
// Read: homepage customer reviews and the signed-in customer's own reviews.
import { apiFetch } from "../client"
import type { CustomerReview, Review } from "../types"

/** Homepage customer reviews. */
export async function getReviews(): Promise<Review[]> {
  return apiFetch<Review[]>("/reviews")
}

/** Reviews written by the signed-in customer. */
export async function getMyReviews(): Promise<CustomerReview[]> {
  return apiFetch<CustomerReview[]>("/reviews/mine")
}
