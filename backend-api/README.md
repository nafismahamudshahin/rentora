# backend-api

Pages never call `fetch` directly. They import from here; this folder is the
only frontend data layer.

```
backend-api/
├── api/       # reads (GET-style)
├── action/    # writes (POST/PATCH/DELETE-style)
├── client.ts  # fetch, ApiError, query/segment helpers
├── types.ts   # shared response and form shapes
├── load.ts    # deprecated alias for apiFetch (no callers)
└── README.md  # this file
```

## Request flow

```
page (useAsync / event handler)
  → backend-api/api or backend-api/action
  → client.apiFetch("/...")
  → browser: /api/...
  → next.config.ts beforeFiles rewrite → API_SERVER_URL (default :5000)
  → Express sibling → MongoDB
```

The browser only sees same-origin `/api/...`, so the better-auth cookie is sent
without CORS setup. The rewrite runs before Next route handlers, so the local
`app/api/**` handlers are shadowed. The source of truth for endpoints is
`../../rentora node server/index.js`; setup notes are in
`../../rentora node server/README.md`.

Express derives the role and user id from the session. The `ownerId` /
`customerId` query values are admin-only overrides; non-admins get their own
rows. `getOverview()` takes no arguments for the same reason.

### JWT

`authClient` (`lib/auth-client.ts`) has the JWT plugin enabled. Login and
sign-up call `getJwtToken()` as soon as they succeed, and session responses also
include a `set-auth-jwt` header. The token is saved in `lib/jwt-store.ts`
(memory only, cleared on sign-out). `apiFetch()` adds it as an
`Authorization: Bearer <token>` header when available. The cookie still works
on its own, including after a page refresh, so this is additive — not a
replacement for the normal login session.

The Express API verifies the signature and then reads the current role from
MongoDB, so an old token cannot keep rights that were later removed.

`api/*` resolves with data. Most `action/*` functions resolve `void` and throw
`ApiError` on failure; `addFavorite` resolves the saved row, while
`changeUserRole` and `updateProfile` return `{ ok, error? }` because their pages
show the message inline.

`public/data/*.json` are only the seed source for a fresh MongoDB, not app data.

## Reads

| Function                           | File            | Endpoint                               | Scope                          |
| ---------------------------------- | --------------- | -------------------------------------- | ------------------------------ |
| `getOverview()`                    | `api/overview`  | `GET /overview`                        | session role/user              |
| `getHomeEquipment()`               | `api/equipment` | `GET /equipment/home`                  | public; first 6 listings       |
| `getEquipment(params?)`            | `api/equipment` | `GET /equipment?filters`               | public; every field filterable |
| `getEquipmentById(id)`             | `api/equipment` | `GET /equipment/:id`                   | public; 404 → `undefined`      |
| `getAvailability(id, start, end)`  | `api/equipment` | `GET /equipment/:id/availability`      | public; free units for a range |
| `getUnavailableDates(id)`          | `api/equipment` | `GET /equipment/:id/unavailable-dates` | public; fully booked ranges    |
| `getListings(ownerId)`             | `api/listings`  | `GET /listings?ownerId=`               | owner, or admin override       |
| `getRentals()`                     | `api/rentals`   | `GET /rentals`                         | role-scoped (admin sees all)   |
| `getRentalsByCustomer(customerId)` | `api/rentals`   | `GET /rentals?customerId=`             | admin filter                   |
| `getBookings()`                    | `api/bookings`  | `GET /bookings`                        | admin                          |
| `getRequests(ownerId)`             | `api/requests`  | `GET /requests?ownerId=`               | owner, or admin override       |
| `getFavorites(customerId)`         | `api/favorites` | `GET /favorites?customerId=`           | customer, or admin override    |
| `getEarnings(ownerId)`             | `api/earnings`  | `GET /earnings?ownerId=`               | owner, or admin override       |
| `getPayments()`                    | `api/payments`  | `GET /payments`                        | admin                          |
| `getReviews()`                     | `api/reviews`   | `GET /reviews`                         | public                         |
| `getUsers()`                       | `api/users`     | `GET /admin/users`                     | admin; unwraps `{ users }`     |

## Writes

| Function                         | File               | Endpoint                          | Effect                                |
| -------------------------------- | ------------------ | --------------------------------- | ------------------------------------- |
| `createEquipment(input)`         | `action/equipment` | `POST /equipment`                 | owner/admin adds listing              |
| `approveEquipment(id)`           | `action/equipment` | `PATCH /equipment/:id/approve`    | admin approves                        |
| `setListingHidden(id, hidden)`   | `action/listings`  | `PATCH /equipment/:id/visibility` | owner hides/shows                     |
| `removeEquipment(id)`            | `action/equipment` | `DELETE /equipment/:id`           | admin removes                         |
| `deleteListing(id)`              | `action/listings`  | `DELETE /equipment/:id`           | owner deletes                         |
| `cancelRental(id)`               | `action/rentals`   | `PATCH /rentals/:id/cancel`       | customer cancels unpaid hold          |
| `updateRentalStatus(id, status)` | `action/rentals`   | `PATCH /rentals/:id/status`       | admin sets Active/Completed/Cancelled |
| `respondToRequest(id, status)`   | `action/requests`  | `PATCH /requests/:id`             | owner accepts/declines                |
| `addFavorite(equipmentId)`       | `action/favorites` | `POST /favorites`                 | saves; returns favorite row           |
| `removeFavorite(id)`             | `action/favorites` | `DELETE /favorites/:id`           | customer removes                      |
| `changeUserRole(id, role)`       | `action/users`     | `PATCH /admin/users/:id`          | admin; returns `{ ok }`               |
| `setMyRole(role)`                | `action/account`   | `POST /me/role`                   | sign-up; customer/owner only          |
| `updateProfile(input)`           | `action/profile`   | better-auth `updateUser`          | returns `{ ok }`                      |
| `createCheckout(input)`          | `action/payments`  | `POST /payments/checkout`         | Stripe URL; holds dates               |
| `verifyPayment(sessionId)`       | `action/payments`  | `GET /payments/verify`            | confirms and books                    |
| `cancelHold(bookingId)`          | `action/payments`  | `POST /payments/cancel-hold`      | releases cancelled dates              |

## Notes

- `query()` drops empty/undefined values; `segment()` escapes ids used in paths.
- `removeEquipment` and `deleteListing` hit the same endpoint; the names match
  the admin and owner screens. `getBookings` and `getRentals` likewise return
  the same records for different screens.
- `updateProfile` is the only write that bypasses `apiFetch`: better-auth's
  `updateUser` goes through the same `/api/auth/*` proxy. There is no upload
  endpoint — the page stores an http(s) URL or a local file read as a data URL;
  `image: null` clears it.
- `createCheckout()` sends the customer's phone, address and optional notes
  from the booking modal. The API stores them on the rental before Stripe and
  repeats them through payment metadata for the verified booking.
- `createEquipment()` sends `availableQuantity` with the listing. `Rental` rows
  also carry `quantity`; checkout price is `pricePerDay × days × quantity`.
  `getAvailability()` is the source of truth for how many units a customer may
  choose for a date range; `getUnavailableDates()` only reports fully booked
  dates. Legacy rows without either field are treated as one unit.
- `verifyPayment()` returns the receipt fields (`equipmentName`, `customerName`,
  `customerEmail`, `paidAt`, `method`) alongside the booking code and payment
  reference. The success page and customer rentals use `lib/receipt.ts` to save
  them as a PDF; no receipt is stored on the server.
- Booking status is normalized by the API: a successful payment is `Active`,
  expired unpaid holds are `Cancelled`, and finished rentals become `Completed`.
  The dashboard tables share labels from `components/dashboard/booking-status.ts`.
- `getEquipment(params?)` accepts `EquipmentQuery` and sends it as query params.
  Public reads only return approved, non-hidden listings.
  `getAdminEquipment()` is the admin-only version that includes pending and
  rejected listings for the review page. The API filters/sorts on the server;
  see `../../rentora node server/README.md` for the full parameter list.
- `addFavorite()` returns the saved row; pass its `id` to `removeFavorite()`.
- `getEarnings(ownerId)` returns a six-month chart, one payout per successful
  payment, and net totals after Rentora's 2% fee. Non-admins can only read their
  own ownerId.
- `getMyReviews()` lists the signed-in customer's reviews; `createReview()`
  posts `{ rentalId, rating, text }` for one paid rental (one review per rental).
- The API also has `POST /api/rentals`; no frontend wrapper exists for it yet.
  Booking is customer-only: owners and admins get 403 from both this route and
  `POST /payments/checkout`.
