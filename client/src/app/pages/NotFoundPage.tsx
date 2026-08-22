import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-md space-y-3 py-16 text-center">
      <p className="font-mono text-sm text-foreground-subtle">404</p>

      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>

      <p className="text-sm text-foreground-muted">
        This page does not exist or has moved.
      </p>

      <Link
        to="/incidents"
        className="inline-flex h-10 items-center rounded-control bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover"
      >
        Back to incidents
      </Link>
    </div>
  );
}
