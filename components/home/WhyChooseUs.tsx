"use client"

import { motion, useReducedMotion } from "framer-motion"
import type { Variants } from "framer-motion"

const EASE = [0.22, 1, 0.36, 1] as const

const benefits = [
  {
    title: "Fair prices",
    text: "Transparent daily, weekly and monthly rates.",
  },
  {
    title: "Verified owners",
    text: "Every listing is approved by our admins.",
  },
  {
    title: "Flexible periods",
    text: "Rent for a day or a season.",
  },
  {
    title: "Secure payments",
    text: "Pay safely through Stripe Checkout.",
  },
]

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

export function WhyChooseUs() {
  const reduce = useReducedMotion() ?? false

  return (
    <section className="relative bg-[#111827] text-white">
      {/* subtle dot texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:22px_22px]"
      />

      <div className="relative container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <span
          className="mb-3.5 block h-[5px] w-11 rounded-full bg-[#FF6B2C]"
          aria-hidden
        />
        <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Why choose Rentora
        </h2>

        <motion.ul
          variants={list}
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-9 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {benefits.map((b) => (
            <motion.li
              key={b.title}
              variants={item}
              className="flex flex-col gap-2"
            >
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-[#FF6B2C]">
                {b.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-300">{b.text}</p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}

export default WhyChooseUs
