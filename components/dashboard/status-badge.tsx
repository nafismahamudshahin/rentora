// components/dashboard/status-badge.tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const tones: Record<Tone, string> = {
    success: "bg-green-100 text-green-800",
    warning: "bg-amber-100 text-amber-900",
    danger: "bg-red-100 text-red-800",
    info: "bg-sky-100 text-sky-800",
    neutral: "bg-stone-200 text-stone-700",
};

export function StatusBadge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                tones[tone]
            )}
        >
            {children}
        </span>
    );
}