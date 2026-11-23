"use client"

import { motion, useReducedMotion } from "framer-motion"
import type { Variants } from "framer-motion"
import { Star } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { getReviews } from "@/backend-api/api/reviews"
import { useAsync } from "@/hooks/use-async"

const EASE = [0.22, 1, 0.36, 1] as const

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const card: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

export function CustomerReviews() {
  const reduce = useReducedMotion() ?? false
  const { data: reviews = [], loading } = useAsync(() => getReviews(), [])

  return (
    <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <span
        className="mb-3.5 block h-[5px] w-11 rounded-full bg-[#FF6B2C]"
        aria-hidden
      />
      <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
        What customers say
      </h2>

      {loading ? (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <li
              key={i}
              className="flex flex-col gap-3 rounded-[26px] border border-[#EDE6D8] bg-white p-6"
            >
              <Skeleton className="h-[18px] w-24" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-20" />
            </li>
          ))}
        </ul>
      ) : (
        <motion.ul
          variants={list}
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {reviews.map((r) => (
            <motion.li
              key={r.name}
              variants={card}
              className="flex flex-col gap-3 rounded-[26px] border border-[#EDE6D8] bg-white p-6 shadow-[0_1px_2px_rgba(17,24,39,.05),0_18px_36px_-18px_rgba(17,24,39,.22)] transition-transform duration-200 hover:-translate-y-1"
            >
              <div
                className="flex gap-0.5"
                role="img"
                aria-label={`${r.rating} out of 5 stars`}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    aria-hidden
                    className={`size-[18px] ${
                      i < r.rating
                        ? "fill-[#B45309] text-[#B45309]"
                        : "fill-stone-200 text-stone-200"
                    }`}
                  />
                ))}
              </div>
              <p className="leading-relaxed text-stone-600">{r.text}</p>
              <p className="font-bold text-[#111827]">{r.name}</p>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </section>
  )
}

export default CustomerReviews
