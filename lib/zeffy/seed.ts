import type { PortalRegistrationInsert } from "@/lib/types";

export const SEED_MEMBERS: PortalRegistrationInsert[] = [
  {
    name: "Arjun Sharma",
    email: "arjun.sharma@example.com",
    membership_type: "Family Membership",
    status: "Pending",
  },
  {
    name: "Priya Nair",
    email: "priya.nair@example.com",
    membership_type: "Individual Membership",
    status: "Pending",
  },
  {
    name: "Vikram Iyer",
    email: "vikram.iyer@example.com",
    membership_type: "Student Membership",
    status: "Pending",
  },
];
