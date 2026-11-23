// lib/jwt-store.ts
// A very small place to keep the JWT in browser memory.
//
// Why memory and not localStorage?
// - It disappears when the tab closes, which is safer.
// - The normal cookie session still works after a refresh, so nothing breaks.

let token: string | null = null
let expiresAt = 0

// The backend issues tokens for 1 hour. We stop using it 5 minutes early so
// we never send a token that is about to expire.
const TOKEN_LIFETIME_MS = 55 * 60 * 1000

/** Remember a JWT after login or after calling getJwtToken(). */
export function saveJwt(value: string) {
  token = value
  expiresAt = Date.now() + TOKEN_LIFETIME_MS
}

/** Return the remembered JWT, or null if there isn't a valid one. */
export function getStoredJwt(): string | null {
  if (!token) return null

  if (Date.now() >= expiresAt) {
    token = null
    expiresAt = 0
    return null
  }

  return token
}

/** Forget the JWT on sign-out. */
export function clearJwt() {
  token = null
  expiresAt = 0
}
