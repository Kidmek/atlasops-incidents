import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/cn";

/**
 * Renders nothing when there is no message, so call sites can mount it
 * unconditionally. Give it an `id` and point the field's `aria-describedby`
 * at it; a dangling reference is ignored when no message is present.
 */
export function FieldError({
  className,
  children,
  ...props
}: ComponentProps<"p">) {
  if (!children) {
    return null;
  }

  return (
    <p className={cn("text-sm text-danger", className)} {...props}>
      {children}
    </p>
  );
}
