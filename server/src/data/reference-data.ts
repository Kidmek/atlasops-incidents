import type { UserSummary } from "../domain/incident.js";

export const CURRENT_USER = {
  id: "usr-current",
  name: "Alex Morgan",
  email: "alex.morgan@example.com",
} satisfies UserSummary;

export const USERS = [
  CURRENT_USER,
  {
    id: "usr-1",
    name: "Maya Chen",
    email: "maya.chen@example.com",
  },
  {
    id: "usr-2",
    name: "Omar Hassan",
    email: "omar.hassan@example.com",
  },
  {
    id: "usr-3",
    name: "Daniel Brooks",
    email: "daniel.brooks@example.com",
  },
  {
    id: "usr-4",
    name: "Priya Shah",
    email: "priya.shah@example.com",
  },
  {
    id: "usr-5",
    name: "Sofia Martinez",
    email: "sofia.martinez@example.com",
  },
  {
    id: "usr-6",
    name: "Noah Williams",
    email: "noah.williams@example.com",
  },
  {
    id: "usr-7",
    name: "Amina Yusuf",
    email: "amina.yusuf@example.com",
  },
  {
    id: "usr-8",
    name: "Ethan Kim",
    email: "ethan.kim@example.com",
  },
  {
    id: "usr-9",
    name: "Grace Okafor",
    email: "grace.okafor@example.com",
  },
] as const satisfies readonly UserSummary[];

export const SERVICES = [
  "payments-api",
  "checkout-web",
  "identity-service",
  "notification-worker",
  "reporting-api",
  "orders-api",
  "customer-portal",
  "inventory-service",
  "search-api",
  "billing-worker",
] as const;

export type ServiceName = (typeof SERVICES)[number];
