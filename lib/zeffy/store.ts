/**
 * Zeffy Portal Registration Store
 * Server-only module — do not import from client components.
 * Provides Supabase-backed CRUD with in-memory fallback.
 */

import { supabaseAdmin } from "@/lib/supabase/server";
import type {
  PortalRegistration,
  PortalRegistrationInsert,
  PortalRegistrationUpdate,
} from "@/lib/types";
import { SEED_MEMBERS } from "./seed";

// ─── Webhook Event Log (in-memory, per process) ──────────────
export interface WebhookLogEntry {
  id: string;
  received_at: string;
  payload: Record<string, unknown>;
  email: string | null;
  result: "skipped" | "updated" | "not_found" | "error";
  reason?: string;
  transaction_id?: string;
  steps: string[];
}

const MAX_LOG_ENTRIES = 20;
const webhookLog: WebhookLogEntry[] = [];

export function appendWebhookLog(entry: WebhookLogEntry): void {
  webhookLog.unshift(entry); // newest first
  if (webhookLog.length > MAX_LOG_ENTRIES) webhookLog.pop();
}

export function getWebhookLog(): WebhookLogEntry[] {
  return webhookLog;
}

export function clearWebhookLog(): void {
  webhookLog.length = 0;
}

// ─── In-memory fallback (used when DB table is unavailable) ──
let inMemoryStore: PortalRegistration[] | null = null;

function getInMemoryStore(): PortalRegistration[] {
  if (!inMemoryStore) {
    inMemoryStore = SEED_MEMBERS.map((m, i) => ({
      id: `mem-${i + 1}`,
      name: m.name,
      email: m.email,
      membership_type: m.membership_type,
      status: m.status,
      payment_confirmed_at: null,
      transaction_id: null,
      created_at: new Date().toISOString(),
    }));
  }
  return inMemoryStore;
}

// ─── DB availability probe ────────────────────────────────────
export async function isTableAvailable(): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("portal_registrations")
      .select("id")
      .limit(1);
    return !error;
  } catch {
    return false;
  }
}

// ─── Auto-seed if table is empty ──────────────────────────────
export async function autoSeedIfEmpty(): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from("portal_registrations")
    .select("id")
    .limit(1);

  if (error || (data && data.length > 0)) return;

  await supabaseAdmin
    .from("portal_registrations")
    .insert(SEED_MEMBERS as PortalRegistrationInsert[]);
}

// ─── Read all registrations ───────────────────────────────────
export async function getAllRegistrations(): Promise<PortalRegistration[]> {
  const available = await isTableAvailable();
  if (!available) {
    console.warn("[store] Table unavailable — using in-memory fallback");
    return getInMemoryStore();
  }

  await autoSeedIfEmpty();

  const { data, error } = await supabaseAdmin
    .from("portal_registrations")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[store] getAllRegistrations error:", error.message);
    return getInMemoryStore();
  }

  return (data ?? []) as PortalRegistration[];
}

// ─── Read single registration by email ───────────────────────
export async function getRegistration(
  email: string
): Promise<PortalRegistration | null> {
  const available = await isTableAvailable();
  if (!available) {
    return getInMemoryStore().find((r) => r.email === email) ?? null;
  }

  await autoSeedIfEmpty();

  const { data, error } = await supabaseAdmin
    .from("portal_registrations")
    .select("*")
    .eq("email", email)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    console.error("[store] getRegistration error:", error.message);
    return getInMemoryStore().find((r) => r.email === email) ?? null;
  }

  return data as PortalRegistration;
}

// ─── Update a registration by email ──────────────────────────
export async function updateRegistration(
  email: string,
  updates: PortalRegistrationUpdate
): Promise<PortalRegistration | null> {
  const available = await isTableAvailable();
  if (!available) {
    const store = getInMemoryStore();
    const idx = store.findIndex((r) => r.email === email);
    if (idx === -1) return null;
    store[idx] = { ...store[idx], ...updates };
    return store[idx];
  }

  const { data, error } = await supabaseAdmin
    .from("portal_registrations")
    .update(updates)
    .eq("email", email)
    .select()
    .single();

  if (error) {
    console.error("[store] updateRegistration error:", error.message);
    // Fall back to in-memory
    const store = getInMemoryStore();
    const idx = store.findIndex((r) => r.email === email);
    if (idx === -1) return null;
    store[idx] = { ...store[idx], ...updates };
    return store[idx];
  }

  return data as PortalRegistration;
}

// ─── Reset all registrations to Pending ──────────────────────
export async function resetAll(): Promise<void> {
  const available = await isTableAvailable();
  if (!available) {
    const store = getInMemoryStore();
    store.forEach((r) => {
      r.status = "Pending";
      r.payment_confirmed_at = null;
      r.transaction_id = null;
    });
    return;
  }

  const { error } = await supabaseAdmin
    .from("portal_registrations")
    .update({
      status: "Pending",
      payment_confirmed_at: null,
      transaction_id: null,
    })
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (error) {
    console.error("[store] resetAll error:", error.message);
    // Fall back to in-memory reset
    const store = getInMemoryStore();
    store.forEach((r) => {
      r.status = "Pending";
      r.payment_confirmed_at = null;
      r.transaction_id = null;
    });
  }
}
