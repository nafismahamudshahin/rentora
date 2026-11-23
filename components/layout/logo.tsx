import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ light = false }: { light?: boolean }) {
    return (
        <Link href="/" className="flex items-center gap-2.5" aria-label="Rentora home">
            {!light && (
                <span className="grid size-9 place-items-center rounded-[10px] bg-navy text-lg font-bold text-brand">
                    R
                </span>
            )}
            <span
                className={cn("text-xl font-bold tracking-tight", light ? "text-white" : "text-navy")}
            >
                Rentora
            </span>
        </Link>
    );
}