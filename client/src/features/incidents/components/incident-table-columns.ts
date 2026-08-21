export const INCIDENT_TABLE_COLUMNS = [
  { key: "id", label: "ID" },
  { key: "title", label: "Title" },
  { key: "severity", label: "Severity", sortField: "severity" },
  { key: "status", label: "Status" },
  { key: "service", label: "Service" },
  { key: "assignee", label: "Assignee" },
  { key: "createdAt", label: "Created", sortField: "createdAt" },
  { key: "updatedAt", label: "Updated", sortField: "updatedAt" },
] as const;
