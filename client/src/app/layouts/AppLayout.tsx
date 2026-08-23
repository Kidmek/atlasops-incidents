import { Outlet } from "react-router";

import { OfflineBanner } from "@/shared/ui/molecules/OfflineBanner";
import { ThemeToggle } from "@/shared/ui/molecules/ThemeToggle";

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <OfflineBanner />

      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <span className="text-lg font-semibold tracking-tight">AtlasOps</span>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
