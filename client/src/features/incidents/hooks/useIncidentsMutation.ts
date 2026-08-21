import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  addIncidentNote,
  assignIncident,
  updateIncidentStatus,
} from "../api/incident-api";
import { incidentQueryKeys } from "../api/incident-query-keys";
import type {
  Incident,
  IncidentStatus,
  UserSummary,
} from "../types/incident.types";

const CURRENT_USER: UserSummary = {
  id: "usr-current",
  name: "Alex Morgan",
  email: "alex.morgan@example.com",
};

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

export function useAssignIncident(incidentId: string) {
  const queryClient = useQueryClient();
  const detailKey = incidentQueryKeys.detail(incidentId);

  return useMutation({
    // Takes the whole user, not just an id, so the optimistic write has a name
    // to render. The API call pulls the id out.
    mutationFn: (assignee: UserSummary | null) =>
      assignIncident(incidentId, assignee?.id ?? null),

    onMutate: async (assignee) => {
      await queryClient.cancelQueries({ queryKey: detailKey });

      const previous = queryClient.getQueryData<Incident>(detailKey);

      if (previous) {
        queryClient.setQueryData<Incident>(detailKey, {
          ...previous,
          assignee,
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

export function useAddIncidentNote(incidentId: string) {
  const queryClient = useQueryClient();
  const detailKey = incidentQueryKeys.detail(incidentId);

  return useMutation({
    mutationFn: (message: string) => addIncidentNote(incidentId, message),

    onMutate: async (message) => {
      await queryClient.cancelQueries({ queryKey: detailKey });

      const previous = queryClient.getQueryData<Incident>(detailKey);

      if (previous) {
        queryClient.setQueryData<Incident>(detailKey, {
          ...previous,
          notes: [
            ...previous.notes,
            {
              id: `optimistic-${previous.notes.length + 1}`,
              incidentId,
              author: CURRENT_USER,
              message,
              createdAt: new Date().toISOString(),
            },
          ],
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
    },
  });
}
