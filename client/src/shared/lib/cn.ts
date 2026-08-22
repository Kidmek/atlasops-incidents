import { twMerge } from "tailwind-merge";

export type ClassValue = string | false | null | undefined;

/**
 * Joins class names and resolves Tailwind conflicts, so a caller's className
 * reliably beats a component default. Without it, `px-0` vs `px-2.5` is
 * decided by Tailwind's stylesheet order, not by call order.
 */
export function cn(...values: ClassValue[]): string {
  return twMerge(values.filter(Boolean).join(" "));
}
