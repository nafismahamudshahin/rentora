// backend-api/api/reviews.ts
// Read: homepage customer reviews.
import { apiFetch } from "../client"
import type { Review } from "../types"

/** Homepage customer reviews. */
export async function getReviews(): Promise<Review[]> {
  return apiFetch<Review[]>("/reviews")
}
