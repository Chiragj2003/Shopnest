import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Warm, editorial empty state — a soft accent icon tile over a friendly
 * heading. Used across the dashboard so every "nothing here yet" moment
 * looks designed rather than blank.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3 px-6 py-14 text-center", className)}>
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
        <Icon className="h-6 w-6" />
      </span>
      <div className="space-y-1">
        <h3 className="text-base font-bold">{title}</h3>
        {description && (
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
