import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "muted";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        variant === "default" && "border-primary/30 bg-primary/10 text-primary",
        variant === "success" && "border-success/30 bg-success/10 text-success",
        variant === "warning" && "border-warning/30 bg-warning/10 text-warning",
        variant === "muted" && "border-border bg-card-elevated text-muted",
        className
      )}
      {...props}
    />
  );
}
