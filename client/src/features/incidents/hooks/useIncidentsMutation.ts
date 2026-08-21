import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateIncidentStatus } from "../api/incident-api";
import { incidentQueryKeys } from "../api/incident-query-keys";
import type { Incident, IncidentStatus } from "../types/incident.types";

export function useUpdateIncidentStatus(incidentId: string) {
  const queryClient = useQueryClient();
  const detailKey = incidentQueryKeys.detail(incidentId);

  return useMutation({
    mutationFn: (input: { status: IncidentStatus; version: number }) =>
      updateIncidentStatus(incidentId, input),

    onMutate: async ({ status }) => {
      await queryClient.cancelQueries({ queryKey: detailKey });

      const previous = queryClient.getQueryData<Incident>(detailKey);

      if (previous) {
        queryClient.setQueryData<Incident>(detailKey, {
          ...previous,
          status,
          updatedAt: new Date().toISOString(),
        });
      }

      return { previous };
    },

    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(detailKey, context.previous);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: detailKey });
      void queryClient.invalidateQueries({ queryKey: incidentQueryKeys.lists });
    },
  });
}
