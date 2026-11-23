import { cn } from "@/lib/utils";

/* Floating-label input: label sits inside the field and floats up on focus/typing */
export function FloatingInput({
    id,
    label,
    icon: Icon,
    right,
    className,
    ...props
}: React.ComponentProps<"input"> & {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    right?: React.ReactNode;
}) {
    return (
        <div className="group relative">
            <Icon className="pointer-events-none absolute left-4 top-1/2 size-[19px] -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input
                id={id}
                placeholder=" "
                {...props}
                className={cn(
                    "peer h-[58px] w-full rounded-2xl border border-input bg-muted/40 pb-1.5 pl-12 pr-4 pt-5 text-[15px] text-foreground outline-none transition-all",
                    "hover:border-primary/40 focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15",
                    right && "pr-12",
                    className
                )}
            />
            <label
                htmlFor={id}
                className={cn(
                    "pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-[15px] text-muted-foreground transition-all duration-200",
                    "peer-focus:top-[17px] peer-focus:text-[11px] peer-focus:font-medium peer-focus:text-primary",
                    "peer-[:not(:placeholder-shown)]:top-[17px] peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-medium"
                )}
            >
                {label}
            </label>
            {right}
        </div>
    );
}