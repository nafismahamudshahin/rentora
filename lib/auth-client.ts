import { inferAdditionalFields, jwtClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import type { auth } from "./auth"
import { clearJwt, saveJwt } from "./jwt-store"

// One client only: signIn/signUp/signOut/useSession, profile updates and JWTs
// all share the same base URL (the Express API proxied at /api/auth).
export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [inferAdditionalFields<typeof auth>(), jwtClient()],

  // The JWT plugin adds a `set-auth-jwt` header to session responses.
  // Save it automatically so the API helper can send it as a Bearer token.
  fetchOptions: {
    onSuccess: (ctx) => {
      const jwt = ctx.response.headers.get("set-auth-jwt")
      if (jwt) saveJwt(jwt)
    },
  },
})

export const { signIn, signUp, useSession } = authClient

type SignOutOptions = Parameters<typeof authClient.signOut>[0]

/** Sign out and forget the JWT as well. */
export async function signOut(options?: SignOutOptions) {
  clearJwt()
  return authClient.signOut(options)
}

/**
 * Get a JWT for the signed-in user. It is valid for 1 hour.
 * The token is also remembered for the API helper.
 */
export async function getJwtToken(): Promise<string> {
  const { data, error } = await authClient.token()

  if (error || !data) {
    throw new Error(error?.message || "Could not get a JWT")
  }

  saveJwt(data.token)
  return data.token
}

export { getStoredJwt, clearJwt } from "./jwt-store"
