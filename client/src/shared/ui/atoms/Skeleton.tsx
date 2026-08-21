import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/cn";

/**
 * A decorative loading placeholder. It is aria-hidden on purpose: the loading
 * state is announced once by the container (aria-busy / a live region), not
 * repeated by every placeholder block.
 *
 * Size and shape come from `className`, e.g. <Skeleton className="h-4 w-32" />.
 */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "motion-safe:animate-pulse rounded-control bg-surface-subtle",
        className
      )}
      {...props}
    />
  );
}
