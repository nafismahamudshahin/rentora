"use client"

// components/dashboard/data-table.tsx
// One reusable card + table with search, CSV export, row animations and an
// empty state. Below `lg` each row becomes a stacked card so no sideways
// scrolling is needed; from `lg` up it renders the dense table.

import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Download, Inbox, Search, Table2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { card, btnOutline } from "./styles"

export { bdt } from "@/lib/format"

export type Column<T> = {
  header: string
  /** Plain value, used for search and CSV export. */
  value: (row: T) => string | number
  /** Optional custom rendering (badges, bold text...). */
  cell?: (row: T) => ReactNode
  className?: string
}

type Props<T extends { id: string }> = {
  title: string
  rows: T[]
  columns: Column<T>[]
  /** Renders the buttons in the last "Actions" column. */
  actions?: (row: T) => ReactNode
  searchPlaceholder?: string
  exportName?: string
  emptyTitle?: string
  emptyAction?: ReactNode
}

const EASE = [0.22, 1, 0.36, 1] as const

export function DataTable<T extends { id: string }>({
  title,
  rows,
  columns,
  actions,
  searchPlaceholder = "Search",
  exportName = "export",
  emptyTitle = "Nothing here yet",
  emptyAction,
}: Props<T>) {
  const reduce = useReducedMotion() ?? false
  const [query, setQuery] = useState("")

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) =>
      columns
        .map((c) => String(c.value(r)))
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
  }, [rows, columns, query])

  function exportCsv() {
    const data = [
      columns.map((c) => c.header),
      ...visible.map((r) => columns.map((c) => String(c.value(r)))),
    ]
    const csv = data
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n")
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" })
    )
    const a = document.createElement("a")
    a.href = url
    a.download = `${exportName}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const [lead, ...details] = columns
  const render = (column: Column<T>, row: T) =>
    column.cell ? column.cell(row) : String(column.value(row))

  const rowAnimation = (idx: number) => ({
    initial: reduce ? false : { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: reduce ? { opacity: 0 } : { opacity: 0, y: -8 },
    transition: {
      duration: 0.35,
      delay: reduce ? 0 : Math.min(idx, 8) * 0.04,
      ease: EASE,
    },
  })

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
      className={cn(card, "overflow-hidden p-0 sm:p-0")}
    >
      {/* Toolbar */}
      <div className="flex flex-col gap-4 border-b border-stone-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#FF6B2C]/15 text-[#8A3300]">
            <Table2 className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-[#111827]">
              {title}
            </h2>
            <p className="text-xs text-stone-500">
              {visible.length} {visible.length === 1 ? "entry" : "entries"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1 sm:flex-none">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-stone-500"
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="h-9 w-full rounded-lg border-stone-300 bg-white pl-8 text-sm sm:w-52"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={exportCsv}
            disabled={visible.length === 0}
            className={cn("h-9 shrink-0 gap-1.5", btnOutline)}
          >
            <Download className="size-3.5" aria-hidden />
            Export
          </Button>
        </div>
      </div>

      {/* Desktop / tablet: dense table */}
      <div className="hidden px-3 pt-1 pb-3 sm:px-4 sm:pb-4 lg:block">
        <Table className="min-w-[680px]">
          <TableHeader>
            <TableRow className="border-0 bg-[#FAF6F0] hover:bg-[#FAF6F0]">
              {columns.map((c, i) => (
                <TableHead
                  key={c.header}
                  className={cn(
                    "h-10 px-3 text-[11px] font-bold tracking-wider text-stone-500 uppercase",
                    i === 0 && "rounded-l-lg",
                    !actions && i === columns.length - 1 && "rounded-r-lg"
                  )}
                >
                  {c.header}
                </TableHead>
              ))}
              {actions && (
                <TableHead className="h-10 rounded-r-lg px-3 text-[11px] font-bold tracking-wider text-stone-500 uppercase">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence initial={false}>
              {visible.map((r, idx) => (
                <motion.tr
                  key={r.id}
                  {...rowAnimation(idx)}
                  className="border-b border-stone-100 transition-colors last:border-0 hover:bg-[#FFF9F3]"
                >
                  {columns.map((c, i) => (
                    <TableCell
                      key={c.header}
                      className={cn(
                        "px-3 py-3 text-sm text-[#111827]",
                        i === 0 && "font-bold",
                        c.className
                      )}
                    >
                      {render(c, r)}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        {actions(r)}
                      </div>
                    </TableCell>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Small screens: one readable card per row */}
      <div className="divide-y divide-stone-100 lg:hidden">
        <AnimatePresence initial={false}>
          {visible.map((r, idx) => (
            <motion.article
              key={r.id}
              {...rowAnimation(idx)}
              className="p-4 first:pt-4 last:pb-4 sm:p-5"
            >
              {lead && (
                <div className="mb-3 rounded-xl bg-[#FAF6F0] px-3.5 py-2.5">
                  <p className="text-[10px] font-bold tracking-widest text-stone-500 uppercase">
                    {lead.header}
                  </p>
                  <div
                    className={cn(
                      "mt-0.5 text-base font-bold break-words text-[#111827]",
                      lead.className
                    )}
                  >
                    {render(lead, r)}
                  </div>
                </div>
              )}

              {details.length > 0 && (
                <dl className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
                  {details.map((c) => (
                    <div key={c.header} className="min-w-0">
                      <dt className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                        {c.header}
                      </dt>
                      <dd
                        className={cn(
                          "mt-1 text-sm break-words text-[#111827]",
                          c.className
                        )}
                      >
                        {render(c, r)}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              {actions && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3">
                  {actions(r)}
                </div>
              )}
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty / loading / error */}
      {visible.length === 0 && (
        <div className="p-4 sm:p-5">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-stone-200 bg-[#FAF6F0]/60 px-4 py-10 text-center"
          >
            <span className="grid size-12 place-items-center rounded-full bg-[#FF6B2C]/15 text-[#8A3300]">
              <Inbox className="size-5" aria-hidden />
            </span>
            <p className="text-sm font-semibold text-[#111827]">
              {rows.length === 0 ? emptyTitle : "No matches found"}
            </p>
            {rows.length === 0 ? emptyAction : null}
          </motion.div>
        </div>
      )}
    </motion.section>
  )
}
