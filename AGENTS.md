<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Rentora

Next.js 16 App Router + React 19 + Tailwind v4 (`base-nova`). Single package, no tests/CI.

## Commands

- `npm run dev` (3000), `npm run build`, `npm run start` (after build).
- Verify: `npm run lint` → `npm run typecheck` → `npm run build`.
- `npm run format` rewrites all TS; for scoped edits use `npx prettier --write <files>` (no semicolons, double quotes, 2 spaces, 80 cols, Tailwind class sorting).

## Layout / chrome

- `app/layout.tsx`: fonts, `ThemeProvider`, `Toaster` only. `app/(site)/layout.tsx` adds Navbar/Footer; home is `app/(site)/page.tsx` (no `app/page.tsx`).
- `app/(auth)/{login,sign-up}` use the root layout. `app/dashboard/layout.tsx` wraps routes in `DashboardShell` (session pending → loader; signed out → `/login`).
- Roles in `components/dashboard/nav-config.ts`: `admin | owner | customer`, default `customer`; `NAV` also drives the route allow-list.

## Conventions

- Page wrappers use Tailwind `container` + `mx-auto px-4 sm:px-6 lg:px-8`; no custom container utility.
- `components/dashboard/data-table.tsx` is the only table UI: pass `columns` (`value` for search/CSV, optional `cell`) and optional `actions`; it renders cards `<lg`, table `≥lg`.
- `hooks/use-async.ts`: `useAsync(loader, deps)` → `{ data, loading, error, reload, setData }`. Guard loaders on the session user id; actions resolve first, then pages patch rows with `setData`.

## Data layer

- All reads/writes go through `backend-api/` (`api/*` reads, `action/*` writes); pages never call `fetch`. See `backend-api/README.md` for the function→endpoint map.
- `backend-api/client.ts` calls same-origin `/api/...`; `next.config.ts` rewrites those to `API_SERVER_URL` (default `http://localhost:5000`) **before** Next route handlers, so `app/api/**` handlers are shadowed and auth cookies stay same-origin.
- The Express sibling (`../rentora node server/index.js`) owns auth + data and derives role/user id from the session. Query ids (`ownerId`, `customerId`) are only honoured for admins; `getOverview()` takes no args.
- `action/profile.ts` is the exception: better-auth `updateUser` via the same `/api/auth/*` proxy. No upload endpoint: profile uses an http(s) URL or a local file read as a data URL (≤2 MB); `image: null` clears it.
- `public/data/*.json` only seeds a fresh MongoDB on the API server.

## 404s

- Unmatched URLs skip nested layouts: `app/not-found.tsx` adds Navbar/Footer itself. `app/(site)/not-found.tsx` and `app/dashboard/not-found.tsx` render in their layouts; shared view: `components/layout/not-found-view.tsx`.
- Keep `app/dashboard/[...not-found]/page.tsx` or `/dashboard/<bad>` falls through to the root 404.

## Environment

- Frontend `.env` (gitignored, no `.env.example`) keys used in source: `MONGODB_URL`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `API_SERVER_URL`. `DB_USER`/`DB_PASSWORD` are unused; empty Google keys still let the build pass with a warning.
- MongoDB is required at runtime for auth/admin routes. API server env/example live in `../rentora node server/`.
- `app/layout.tsx` uses `next/font/google`; a flaky connection can fail the first build on font fetch, then pass on retry.
