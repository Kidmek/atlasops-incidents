import { IncidentCardList } from "./IncidentCardList";
import { IncidentTable } from "./IncidentTable";
import type { Incident } from "../types/incident.types";

/**
 * Table on wide screens, cards below `md`. Both trees mount and one is hidden
 * with CSS: at 25 rows that costs nothing, and it avoids a media-query hook
 * that would render the wrong layout on the first paint.
 */
export function IncidentList({
  incidents,
  isLoading = false,
}: {
  incidents: Incident[];
  isLoading?: boolean;
}) {
  return (
    <>
      <div className="hidden md:block">
        <IncidentTable incidents={incidents} isLoading={isLoading} />
      </div>

      <div className="md:hidden">
        <IncidentCardList incidents={incidents} isLoading={isLoading} />
      </div>
    </>
  );
}
