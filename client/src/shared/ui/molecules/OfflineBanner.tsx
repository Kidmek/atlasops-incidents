import { onlineManager } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";

/**
 * Reads TanStack Query's own connectivity state rather than navigator.onLine,
 * so the banner and the query cache can never disagree: the same signal that
 * pauses queries and mutations is the one being displayed.
 *
 * Not exported — the banner is its only consumer.
 */
function useIsOnline() {
  return useSyncExternalStore(
    (onStoreChange) => onlineManager.subscribe(onStoreChange),
    () => onlineManager.isOnline()
  );
}

export function OfflineBanner() {
  const isOnline = useIsOnline();

  if (isOnline) {
    return null;
  }

  return (
    // "status" rather than "alert": losing connection is a state change, not
    // an error to interrupt the user with.
    <div
      role="status"
      className="border-b border-warning bg-warning-subtle px-4 py-2 text-center text-sm text-warning sm:px-6 lg:px-8"
    >
      You are offline. Changes you make will be sent when the connection
      returns.
    </div>
  );
}
