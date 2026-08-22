import { useTheme } from "@/shared/hooks/useTheme";
import { Button } from "@/shared/ui/atoms/Button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      className="px-2 py-2 flex items-center justify-center"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
      >
        {isDark ? (
          <>
            <circle cx="10" cy="10" r="3.5" />
            <path d="M10 2v1.5M10 16.5V18M18 10h-1.5M3.5 10H2M15.7 4.3l-1 1M5.3 14.7l-1 1M15.7 15.7l-1-1M5.3 5.3l-1-1" />
          </>
        ) : (
          <path d="M16 11.7A6.5 6.5 0 0 1 8.3 4a6.5 6.5 0 1 0 7.7 7.7Z" />
        )}
      </svg>
    </Button>
  );
}
