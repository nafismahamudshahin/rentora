import { cn } from "@/lib/utils";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("px-3 py-1 text-sm font-medium text-[#111827]/70", className)}
      {...props}
    />
  );
}
