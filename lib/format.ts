// lib/format.ts
// Small display helpers shared by pages and the backend-api layer.

export const bdt = (n: number) => `৳${n.toLocaleString("en-US")}`

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

/** Parse "2026-11-25" as a local date (avoids UTC off-by-one). */
function parse(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!m) return null
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}

/** "2026-11-25" → "Nov 25, 2026" */
export function formatDate(iso: string): string {
  const d = parse(iso)
  if (!d) return iso
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

/** "2026-11-25" → "Nov 22" (no year) */
export function formatDateShort(iso: string): string {
  const d = parse(iso)
  if (!d) return iso
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

/** "2026-11-25".."2026-11-27" → "Nov 25 – Nov 27, 2026" */
export function formatDateRange(start: string, end: string): string {
  const a = parse(start)
  const b = parse(end)
  if (!a || !b) return `${start} – ${end}`
  const left = `${MONTHS[a.getMonth()]} ${a.getDate()}`
  const right =
    a.getFullYear() === b.getFullYear()
      ? `${MONTHS[b.getMonth()]} ${b.getDate()}`
      : formatDate(end)
  return `${left} – ${right}, ${a.getFullYear()}`
}
