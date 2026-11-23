"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import type { Variants } from "framer-motion"
import { ArrowRight, Check, Search } from "lucide-react"
import HERO_IMAGE from "@/public/images/herobanner.jpg"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const EASE = [0.22, 1, 0.36, 1] as const

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

const perks = [
  "Verified owners",
  "Secure Stripe payments",
  "Flexible rental periods",
]

export function HeroBanner() {
  const reduce = useReducedMotion() ?? false

  return (
    <section className="relative overflow-hidden bg-[#FAF7F2]">
      <div className="container mx-auto grid items-center gap-14 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        {/* Text */}
        <motion.div
          variants={container}
          initial={reduce ? false : "hidden"}
          animate="show"
          className="flex flex-col items-start gap-7"
        >
          <motion.div variants={item}>
            <Badge
              variant="outline"
              className="gap-2 rounded-full border-stone-300 bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[#111827]"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#FF6B2C] opacity-70" />
                <span className="relative inline-flex size-2 rounded-full bg-[#FF6B2C]" />
              </span>
              Equipment rental marketplace
            </Badge>
          </motion.div>

          <motion.h1
            variants={item}
            className="font-[family-name:var(--font-space-grotesk)] text-5xl leading-[1.05] font-bold tracking-[-0.04em] text-[#111827] sm:text-6xl lg:text-7xl"
          >
            Rent the gear.
            <br />
            <span className="text-[#FF6B2C]">Skip the buying.</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="max-w-[480px] text-lg leading-relaxed text-stone-600"
          >
            Cameras, excavators, tractors and event kits from trusted local
            owners. Book by the day, week or month.
          </motion.p>

          <motion.form
            variants={item}
            action="/equipment"
            method="get"
            role="search"
            className="flex w-full max-w-[520px] items-center gap-2 rounded-full border border-stone-200 bg-white p-2 pl-5 shadow-[0_12px_30px_-14px_rgba(17,24,39,.25)] focus-within:border-[#FF6B2C]"
          >
            <Search className="size-5 shrink-0 text-stone-500" aria-hidden />
            <label htmlFor="hero-q" className="sr-only">
              Search equipment
            </label>
            <input
              id="hero-q"
              name="q"
              placeholder="Search excavator, camera, tractor"
              className="min-w-0 flex-1 bg-transparent text-base text-[#111827] outline-none placeholder:text-stone-500"
            />
            <Button
              type="submit"
              className="h-11 rounded-full bg-[#FF6B2C] px-6 font-bold text-[#111827] hover:bg-[#FF6B2C]/90"
            >
              Search
            </Button>
          </motion.form>

          <motion.div
            variants={item}
            className="flex flex-wrap items-center gap-x-6 gap-y-3"
          >
            <Link
              href="/equipment"
              className={cn(
                buttonVariants({ variant: "link" }),
                "group h-auto p-0 font-bold text-[#111827]"
              )}
            >
              Browse all equipment
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-600">
              {perks.map((p) => (
                <li key={p} className="flex items-center gap-1.5">
                  <Check className="size-4 text-green-700" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Image */}
        <div className="relative mx-auto w-full max-w-[540px]">
          <motion.div
            aria-hidden
            initial={reduce ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: EASE }}
            className="absolute -top-6 -right-6 size-[78%] rounded-full bg-[#FF6B2C]"
          />
          <motion.div
            aria-hidden
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-8 -left-8 size-40 rounded-full border-2 border-dashed border-[#111827]/25"
          />
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
          >
            <motion.div
              animate={reduce ? undefined : { y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative aspect-[4/3] overflow-hidden rounded-[32px] bg-white shadow-[0_40px_70px_-30px_rgba(17,24,39,.5)]"
            >
              <Image
                src={HERO_IMAGE}
                alt="Yellow excavator digging dirt against a blue sky"
                fill
                priority
                sizes="(min-width: 1024px) 540px, 100vw"
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default HeroBanner
