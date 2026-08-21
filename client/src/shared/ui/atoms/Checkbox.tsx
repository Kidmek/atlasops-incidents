import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/cn";

/** `type` is omitted so a checkbox cannot be turned into another input kind. */
type CheckboxProps = Omit<ComponentProps<"input">, "type">;

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={cn(
        "size-4 shrink-0 accent-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
