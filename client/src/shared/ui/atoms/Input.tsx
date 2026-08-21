import type { ComponentProps } from "react";

import { cn } from "@/shared/lib/cn";

export function Input({
  className,
  type = "text",
  ...props
}: ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-10 w-full rounded-control border border-border-strong bg-surface px-3 text-sm text-foreground",
        "placeholder:text-foreground-subtle",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid=true]:border-danger",
        className
      )}
      {...props}
    />
  );
}
