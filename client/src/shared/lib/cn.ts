export type ClassValue = string | false | null | undefined;

/**
 * Joins conditional class names. Deliberately not clsx + tailwind-merge:
 * variants here are controlled by props, and `className` is reserved for
 * layout (margin, width). Add tailwind-merge only if real conflicts appear.
 */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
