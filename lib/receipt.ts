// lib/receipt.ts
// Client-side PDF receipt generator. Kept separate from the pages so the
// success screen and My Rentals share exactly the same receipt layout.

import type { jsPDF } from "jspdf"

import { formatDate } from "@/lib/format"

export type ReceiptData = {
  /** Booking code, or the payment reference when no code is available. */
  number: string
  /** ISO date or an already formatted date. */
  issuedOn: string
  customer: string
  email: string
  equipment: string
  period: string
  quantity: number
  amount: number
  reference?: string
  method: string
}

const INK = [15, 23, 42] as const
const MUTED = [100, 116, 139] as const
const SOFT_MUTED = [148, 163, 184] as const
const ORANGE = [255, 107, 44] as const
const GREEN = [16, 185, 129] as const
const BORDER = [226, 232, 240] as const
const SURFACE = [248, 250, 252] as const

// jsPDF's built-in fonts do not include the Bengali taka sign.
function money(amount: number): string {
  const value = Number.isFinite(amount) ? amount : 0
  return `BDT ${value.toLocaleString("en-US")}`
}

function displayDate(value: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? formatDate(value) : value
}

function safeText(value: string | undefined, fallback = "—"): string {
  const text = String(value || "").trim()
  return text || fallback
}

function filePart(value: string): string {
  return (
    value
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "rentora"
  )
}

/** Shorten text with an ellipsis so it never overflows its column. */
function fit(doc: jsPDF, text: string, width: number): string {
  if (doc.getTextWidth(text) <= width) return text
  let out = text
  while (out.length > 1 && doc.getTextWidth(`${out}…`) > width) {
    out = out.slice(0, -1)
  }
  return `${out}…`
}

/** Build and download a one-page payment receipt as a PDF. */
export async function downloadReceipt(data: ReceiptData): Promise<void> {
  const { jsPDF: Pdf } = await import("jspdf")
  const doc = new Pdf({ unit: "pt", format: "a4" })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 48
  const right = pageWidth - margin
  const contentWidth = right - margin

  doc.setProperties({
    title: `Rentora receipt ${data.number}`,
    subject: "Payment receipt",
    creator: "Rentora",
  })

  // Accent bar across the top edge.
  doc.setFillColor(...ORANGE)
  doc.rect(0, 0, pageWidth, 8, "F")

  // Brand header.
  doc.setFillColor(...INK)
  doc.roundedRect(margin, 44, 36, 36, 10, 10, "F")
  doc.setTextColor(...ORANGE)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.text("R", margin + 18, 68, { align: "center" })

  doc.setTextColor(...INK)
  doc.setFontSize(20)
  doc.text("Rentora", margin + 48, 60)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text("Equipment rentals", margin + 48, 74)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(...ORANGE)
  doc.text("RECEIPT", right, 58, { align: "right" })
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(...MUTED)
  doc.text(displayDate(safeText(data.issuedOn)), right, 74, { align: "right" })

  // Hero card: amount paid.
  const heroY = 108
  const heroH = 96
  doc.setFillColor(...INK)
  doc.roundedRect(margin, heroY, contentWidth, heroH, 16, 16, "F")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(...SOFT_MUTED)
  doc.text("AMOUNT PAID", margin + 24, heroY + 30)
  doc.setFontSize(30)
  doc.setTextColor(255, 255, 255)
  doc.text(money(data.amount), margin + 24, heroY + 68)

  const pillW = 68
  doc.setFillColor(...GREEN)
  doc.roundedRect(right - 24 - pillW, heroY + 24, pillW, 24, 12, 12, "F")
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.text("PAID", right - 24 - pillW / 2, heroY + 39.5, { align: "center" })
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...SOFT_MUTED)
  doc.text("Payment received", right - 24, heroY + 68, { align: "right" })

  // Receipt identity.
  let y = heroY + heroH + 32
  const half = contentWidth / 2
  writeField(doc, "RECEIPT NO.", safeText(data.number), margin, y, half - 12)
  writeField(
    doc,
    "RECEIPT DATE",
    displayDate(safeText(data.issuedOn)),
    margin + half,
    y,
    half - 12
  )
  y += 46

  // Info cards: billed to + payment.
  const gap = 16
  const cardW = (contentWidth - gap) / 2
  const cardH = 88
  drawCard(
    doc,
    margin,
    y,
    cardW,
    cardH,
    "BILLED TO",
    safeText(data.customer, "Customer"),
    safeText(data.email)
  )
  drawCard(
    doc,
    margin + cardW + gap,
    y,
    cardW,
    cardH,
    "PAYMENT",
    safeText(data.method, "Stripe"),
    data.reference ? `Ref: ${data.reference}` : "Paid in full"
  )
  y += cardH + 36

  // Line item table.
  const colPeriod = margin + 230
  const colQty = margin + 392
  const itemW = 210
  const periodW = 148

  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text("ITEM", margin, y)
  doc.text("PERIOD", colPeriod, y)
  doc.text("QTY", colQty, y)
  doc.text("AMOUNT", right, y, { align: "right" })
  y += 10
  doc.setDrawColor(...INK)
  doc.setLineWidth(1)
  doc.line(margin, y, right, y)
  y += 22

  const quantity = Math.max(1, Math.round(data.quantity || 1))
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  const itemLines: string[] = doc.splitTextToSize(
    safeText(data.equipment, "Equipment"),
    itemW
  )
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  const periodLines: string[] = doc.splitTextToSize(
    safeText(data.period),
    periodW
  )

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(...INK)
  doc.text(itemLines, margin, y)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(...MUTED)
  doc.text(periodLines, colPeriod, y)
  doc.setTextColor(...INK)
  doc.text(`${quantity} ${quantity === 1 ? "unit" : "units"}`, colQty, y)
  doc.setFont("helvetica", "bold")
  doc.text(money(data.amount), right, y, { align: "right" })

  y += Math.max(itemLines.length, periodLines.length) * 14 + 10
  doc.setDrawColor(...BORDER)
  doc.setLineWidth(0.75)
  doc.line(margin, y, right, y)

  // Totals.
  y += 30
  const totalW = 230
  doc.setFillColor(...SURFACE)
  doc.roundedRect(right - totalW, y - 20, totalW, 44, 12, 12, "F")
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(...MUTED)
  doc.text("Total paid", right - totalW + 16, y + 6)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.setTextColor(...ORANGE)
  doc.text(money(data.amount), right - 16, y + 7, { align: "right" })

  // Footer.
  const footerY = pageHeight - 56
  doc.setDrawColor(...BORDER)
  doc.setLineWidth(0.75)
  doc.line(margin, footerY, right, footerY)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(...INK)
  doc.text("Thank you for renting with Rentora.", margin, footerY + 20)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text(
    "This receipt confirms a successful payment for your Rentora booking.",
    margin,
    footerY + 34
  )

  const name = `Rentora-receipt-${filePart(data.number)}.pdf`
  doc.save(name)
}

function writeField(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number
): void {
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text(label, x, y)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.setTextColor(...INK)
  doc.text(fit(doc, value, width), x, y + 17)
}

function drawCard(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  title: string,
  subtitle: string
): void {
  const pad = 18
  const inner = width - pad * 2

  doc.setFillColor(...SURFACE)
  doc.setDrawColor(...BORDER)
  doc.setLineWidth(0.75)
  doc.roundedRect(x, y, width, height, 12, 12, "FD")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(...ORANGE)
  doc.text(label, x + pad, y + 26)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.setTextColor(...INK)
  doc.text(fit(doc, title, inner), x + pad, y + 48)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(...MUTED)
  doc.text(fit(doc, subtitle, inner), x + pad, y + 66)
}