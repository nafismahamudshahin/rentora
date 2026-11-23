"use client"

import { motion, useReducedMotion } from "framer-motion"
import type { Variants } from "framer-motion"

const EASE = [0.22, 1, 0.36, 1] as const

const steps = [
  {
    title: "Find your gear",
    text: "Search by name, location or category and compare prices.",
  },
  {
    title: "Book and pay",
    text: "Pick your dates and pay securely with Stripe.",
  },
  {
    title: "Pick up and return",
    text: "Meet the owner, use the gear, return it on time.",
  },
]

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const card: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

export function HowItWorks() {
  const reduce = useReducedMotion() ?? false

  return (
    <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <span
        className="mb-3.5 block h-[5px] w-11 rounded-full bg-[#FF6B2C]"
        aria-hidden
      />
      <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
        How it works
      </h2>

      <motion.ol
        variants={list}
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="mt-8 grid gap-6 md:grid-cols-3"
      >
        {steps.map((s, i) => (
          <motion.li
            key={s.title}
            variants={card}
            className="flex flex-col gap-3 rounded-[22px] border border-stone-200 bg-white p-7 shadow-[0_1px_2px_rgba(17,24,39,.05),0_18px_36px_-18px_rgba(17,24,39,.22)] transition-transform duration-200 hover:-translate-y-1"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-[#111827] font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-[#FF6B2C]">
              {i + 1}
            </span>
            <h3 className="font-[family-name:var(--font-space-grotesk)] text-[22px] font-bold text-[#111827]">
              {s.title}
            </h3>
            <p className="text-sm leading-relaxed text-stone-600">{s.text}</p>
          </motion.li>
        ))}
      </motion.ol>
    </section>
  )
}

export default HowItWorks
