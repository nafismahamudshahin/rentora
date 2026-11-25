// backend-api/types.ts
// Shapes returned by the Express API and accepted by its write endpoints.

// ── Status values ────────────────────────────────────────────────────────────

export type BookingStatus = "Pending" | "Active" | "Completed" | "Cancelled"
export type PaymentStatus = "Paid" | "Pending" | "Refunded" | "Failed"
export type ListingStatus = "Available" | "Rented" | "Hidden"
export type ReviewStatus = "Approved" | "Pending review" | "Rejected"
export type RequestStatus = "Pending" | "Accepted" | "Declined"
export type PayoutStatus = "Paid" | "Pending"
export type TransactionStatus = "Succeeded" | "Pending" | "Refunded" | "Failed"

// ── Domain rows ──────────────────────────────────────────────────────────────

export type Equipment = {
  id: string
  name: string
  ownerId: string
  ownerName: string
  category: string
  pricePerDay: number
  location: string
  /** Longer text shown on the equipment details page. */
  description?: string
  /** Daily / Weekly / Monthly. Older rows do not have this field. */
  rentalType?: string
  /** Owner-facing availability. */
  status: ListingStatus
  /** Admin review state. */
  reviewStatus: ReviewStatus
  rating: number
  image: string
}

/** Sort values accepted by `GET /api/equipment?sort=`. */
export type EquipmentSort =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "rating-asc"
  | "rating-desc"

/** URL query params accepted by `GET /api/equipment`. */
export type EquipmentQuery = {
  q?: string
  id?: string
  name?: string
  ownerId?: string
  ownerName?: string
  category?: string
  location?: string
  status?: string
  reviewStatus?: string
  description?: string
  image?: string
  // Price/rating filters come from URL params, so they arrive as strings
  // from the catalog UI. The query helper converts them before sending.
  minPrice?: number | string
  maxPrice?: number | string
  minRating?: number | string
  maxRating?: number | string
  hasImage?: boolean
  sort?: EquipmentSort | string
}

export type Rental = {
  id: string
  code: string
  customerId: string
  customerName: string
  customerEmail: string
  ownerId: string
  ownerName: string
  ownerEmail: string
  equipmentId: string
  equipment: string
  startDate: string // ISO date, e.g. "2026-11-25"
  endDate: string
  bookingDate: string
  amount: number
  paymentStatus: PaymentStatus
  bookingStatus: BookingStatus
}

/** Raw favorite row (customer id + equipment id). */
export type FavoriteRecord = {
  id: string
  customerId: string
  equipmentId: string
}

/** A favorite joined with its equipment row; this is what the API returns. */
export type FavoriteItem = {
  id: string
  equipmentId: string
  name: string
  category: string
  pricePerDay: number
}

export type RentalRequest = {
  id: string
  ownerId: string
  customerId: string
  customerName: string
  equipmentId: string
  equipment: string
  startDate: string
  endDate: string
  amount: number
  status: RequestStatus
}

export type Payout = {
  id: string
  ownerId: string
  reference: string
  date: string
  amount: number
  status: PayoutStatus
}

export type EarningsData = {
  monthly: { m: string; amount: number }[]
  payouts: Payout[]
}

export type Payment = {
  id: string
  reference: string
  customerId: string
  customer: string
  equipmentId?: string
  equipment?: string
  ownerId?: string
  ownerName?: string
  amount: number
  /** Rentora's 2% authority fee. Older rows may not have it. */
  commission?: number
  /** Amount the owner receives after the fee. Older rows may not have it. */
  ownerAmount?: number
  method: string
  date: string
  status: TransactionStatus
}

export type Review = {
  id?: string
  name: string
  rating: number
  text: string
}

/** A customer's own review, linked to the rental that earned it. */
export type CustomerReview = Review & {
  id: string
  rentalId: string
  equipmentId: string
  customerId: string
  createdAt: string
}

export type NewReview = {
  rentalId: string
  rating: number
  text: string
}

// ── Screen-specific API shapes ──────────────────────────────────────────────

/** A dashboard stat card; the API computes these from the session role. */
export type Stat = {
  label: string
  value: string
  hint: string
}

/** Admin users row. `role` stays a string so the page can normalize it. */
export type AdminUser = {
  id: string
  name: string
  email: string
  image: string | null
  role: string
  createdAt: string | null
}

/** A date range already taken by another customer. */
export type UnavailableRange = {
  startDate: string
  endDate: string
}

/** Stripe Checkout session created by the server for a booking. */
export type CheckoutSession = {
  url: string
  sessionId: string
}

/** Everything the customer chooses before paying. */
export type BookingCheckoutInput = {
  equipmentId: string
  startDate: string
  endDate: string
  phone: string
  address: string
}

/** Result shown on the payment success page. */
export type PaymentVerification = {
  paid: boolean
  equipmentId?: string
  amount?: number
  commission?: number
  ownerAmount?: number
  reference?: string
  bookingCode?: string
  startDate?: string
  endDate?: string
}

// ── Write payloads ───────────────────────────────────────────────────────────

/** Add Equipment form. `price` is the API field; rows use `pricePerDay`. */
export type NewEquipment = {
  name: string
  category: string
  price: number
  location: string
  description: string
  image: string
}

export type ProfileUpdate = {
  name: string
  /** `null` clears the photo; `undefined` leaves it unchanged. */
  image?: string | null
  phone: string
  address: string
}

/** Result for actions whose caller displays the error inline. */
export type ActionResult = { ok: true } | { ok: false; error: string }
