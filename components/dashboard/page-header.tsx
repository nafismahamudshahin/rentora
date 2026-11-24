"use client";

// components/dashboard/page-header.tsx

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function PageHeader({
    title,
    description,
    actions,
}: {
    title: string;
    description?: string;
    actions?: ReactNode;
}) {
    const reduce = useReducedMotion() ?? false;
    return (
        <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 flex flex-wrap items-end justify-between gap-4"
        >
            <div>
                <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight">
                    {title}
                </h1>
                {description ? <p className="mt-1 text-sm text-stone-600">{description}</p> : null}
            </div>
            {actions}
        </motion.div>
    );
}