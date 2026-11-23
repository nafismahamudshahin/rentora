// backend-api/client.ts
// Shared transport for every Express API call. Next rewrites /api/* to the
// Express server, so the browser keeps one origin and the auth cookie is sent.
// If a JWT is available it is also sent as a Bearer token; the cookie still
// works on its own after a refresh.

import { getStoredJwt } from "@/lib/jwt-store"

/** An API response with a non-2xx status. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function getErrorMessage(response: Response) {
  const fallback = `Request failed (${response.status})`
  try {
    const body = (await response.json()) as { error?: string }
    return body?.error || fallback
  } catch {
    return fallback
  }
}

/**
 * Request helper.
 * - `path` starts with "/" (e.g. `/equipment/${id}`).
 * - String bodies are sent as JSON; `headers` can override that.
 * - 204 resolves to `undefined`; non-2xx throws `ApiError`.
 */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const jwt = getStoredJwt()

  const response = await fetch(`/api${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      // Extra auth for services that accept JWT. The cookie is still sent too.
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      ...init?.headers,
    },
  })

  if (!response.ok) {
    throw new ApiError(await getErrorMessage(response), response.status)
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

type QueryValue = string | number | boolean | undefined

/** Build `?key=value` from defined, non-empty values. */
export const query = (params: Record<string, QueryValue>) => {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue
    search.set(key, String(value))
  }
  const result = search.toString()
  return result ? `?${result}` : ""
}

/** Escape a dynamic id before putting it in a URL path. */
export const segment = (value: string) => encodeURIComponent(value)
