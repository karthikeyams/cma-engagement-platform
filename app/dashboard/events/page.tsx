"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import type { EventWithStats } from "@/app/api/events/route";
import type { RSVPWithMember } from "@/app/api/events/[id]/rsvps/route";
import type { AgentMessage } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

// ─── Helpers ──────────────────────────────────────────────────

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    confirmed: "bg-green-100 text-green-800",
    registered: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
    attended: "bg-purple-100 text-purple-800",
    no_show: "bg-gray-100 text-gray-600",
    waitlisted: "bg-yellow-100 text-yellow-800",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function eventTypeBadge(type: string | null) {
  const styles: Record<string, string> = {
    satsang: "bg-orange-100 text-orange-800",
    youth: "bg-cyan-100 text-cyan-800",
    cultural: "bg-pink-100 text-pink-800",
    study_group: "bg-indigo-100 text-indigo-800",
    seva: "bg-teal-100 text-teal-800",
  };
  const t = type ?? "other";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[t] ?? "bg-gray-100 text-gray-600"}`}
    >
      {t.replace("_", " ")}
    </span>
  );
}

function channelIcon(channel: string) {
  if (channel === "whatsapp") return "💬";
  if (channel === "sms") return "📱";
  return "✉️";
}

// ─── Toast ────────────────────────────────────────────────────

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-lg px-4 py-3 text-sm font-medium shadow-lg text-white transition-all ${
            t.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithStats[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [rsvps, setRsvps] = useState<RSVPWithMember[]>([]);
  const [loadingRsvps, setLoadingRsvps] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [reminderLoading, setReminderLoading] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ── Toast helper
  const showToast = useCallback((message: string, type: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  // ── Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      const json = await res.json() as { success: boolean; data: EventWithStats[] };
      if (json.success) setEvents(json.data);
    } catch {
      showToast("Failed to load events", "error");
    } finally {
      setLoadingEvents(false);
    }
  }, [showToast]);

  // ── Fetch RSVPs for selected event
  const fetchRsvps = useCallback(async (eventId: string) => {
    setLoadingRsvps(true);
    try {
      const res = await fetch(`/api/events/${eventId}/rsvps`);
      const json = await res.json() as { success: boolean; data: RSVPWithMember[] };
      if (json.success) setRsvps(json.data);
    } catch {
      showToast("Failed to load RSVPs", "error");
    } finally {
      setLoadingRsvps(false);
    }
  }, [showToast]);

  // ── Fetch agent messages for selected event
  const fetchMessages = useCallback(async (eventId: string) => {
    setLoadingMessages(true);
    try {
      // Fetch via supabase directly through a simple API call
      const res = await fetch(`/api/events/${eventId}/messages`);
      const json = await res.json() as { success: boolean; data: AgentMessage[] };
      if (json.success) setMessages(json.data);
    } catch {
      // silently fail — messages are supplementary
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  // Auto-refresh RSVPs every 30 seconds
  useEffect(() => {
    if (!selectedEventId) return;
    const interval = setInterval(() => {
      void fetchRsvps(selectedEventId);
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedEventId, fetchRsvps]);

  // ── Select event
  const selectEvent = useCallback(
    (eventId: string) => {
      if (selectedEventId === eventId) {
        setSelectedEventId(null);
        setRsvps([]);
        setMessages([]);
        return;
      }
      setSelectedEventId(eventId);
      void fetchRsvps(eventId);
      void fetchMessages(eventId);
    },
    [selectedEventId, fetchRsvps, fetchMessages]
  );

  // ── Send reminder
  const sendReminder = useCallback(
    async (eventId: string, reminderType: "T7" | "T1") => {
      const key = `${eventId}-${reminderType}`;
      setReminderLoading((prev) => ({ ...prev, [key]: true }));
      try {
        const res = await fetch("/api/agents/remind", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, reminderType }),
        });
        const json = await res.json() as { success: boolean; data: { sent: number; failed: number } };
        if (json.success) {
          showToast(
            `${reminderType} reminders sent: ${json.data.sent} sent, ${json.data.failed} failed`,
            "success"
          );
          void fetchEvents();
          if (selectedEventId === eventId) void fetchMessages(eventId);
        } else {
          showToast("Reminder failed — check console", "error");
        }
      } catch {
        showToast("Network error sending reminders", "error");
      } finally {
        setReminderLoading((prev) => ({ ...prev, [key]: false }));
      }
    },
    [showToast, fetchEvents, fetchMessages, selectedEventId]
  );

  // ── Simulate confirm / cancel
  const simulateResponse = useCallback(
    async (memberId: string, eventId: string, response: "YES" | "NO") => {
      const key = `${memberId}-${response}`;
      setActionLoading((prev) => ({ ...prev, [key]: true }));
      try {
        const res = await fetch("/api/agents/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId, eventId, response }),
        });
        const json = await res.json() as { success: boolean };
        if (json.success) {
          showToast(
            response === "YES" ? "Member confirmed!" : "Member cancelled.",
            "success"
          );
          void fetchRsvps(eventId);
          void fetchEvents();
          void fetchMessages(eventId);
        } else {
          showToast("Action failed — check console", "error");
        }
      } catch {
        showToast("Network error", "error");
      } finally {
        setActionLoading((prev) => ({ ...prev, [key]: false }));
      }
    },
    [showToast, fetchRsvps, fetchEvents, fetchMessages]
  );

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // ─── Render ──────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer toasts={toasts} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Send reminders, track RSVPs, and monitor member confirmations.
        </p>
      </div>

      {/* Event Cards */}
      {loadingEvents ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {events.map((event) => {
            const isSelected = selectedEventId === event.id;
            const t7Key = `${event.id}-T7`;
            const t1Key = `${event.id}-T1`;

            return (
              <div
                key={event.id}
                className={`rounded-xl border bg-white shadow-sm transition-all ${
                  isSelected ? "border-orange-400 ring-2 ring-orange-200" : "border-gray-200"
                }`}
              >
                <div className="p-5">
                  {/* Type + Status */}
                  <div className="mb-3 flex items-center justify-between">
                    {eventTypeBadge(event.type)}
                    <span className="text-xs text-gray-400">
                      {format(new Date(event.event_date), "MMM d")}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="mb-1 text-base font-semibold leading-tight text-gray-900">
                    {event.title}
                  </h2>
                  <p className="mb-4 text-xs text-gray-500 truncate">
                    {event.location ?? "CMA Ashram"}
                  </p>

                  {/* RSVP Stats */}
                  <div className="mb-4 grid grid-cols-3 gap-1 rounded-lg bg-gray-50 p-3 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">{event.confirmed}</div>
                      <div className="text-xs text-gray-500">Confirmed</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600">{event.registered}</div>
                      <div className="text-xs text-gray-500">Registered</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-400">{event.total_rsvps}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  </div>

                  {/* Reminder Buttons */}
                  <div className="mb-3 flex gap-2">
                    <button
                      onClick={() => void sendReminder(event.id, "T7")}
                      disabled={!!reminderLoading[t7Key]}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-orange-50 px-3 py-2 text-xs font-medium text-orange-700 hover:bg-orange-100 disabled:opacity-50"
                    >
                      {reminderLoading[t7Key] ? (
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
                      ) : (
                        "📅 T7"
                      )}
                    </button>
                    <button
                      onClick={() => void sendReminder(event.id, "T1")}
                      disabled={!!reminderLoading[t1Key]}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                    >
                      {reminderLoading[t1Key] ? (
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                      ) : (
                        "🔔 T1"
                      )}
                    </button>
                  </div>

                  {/* View RSVPs */}
                  <button
                    onClick={() => selectEvent(event.id)}
                    className={`w-full rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      isSelected
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {isSelected ? "▲ Hide RSVPs" : "▼ View RSVPs"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RSVP Detail Panel */}
      {selectedEvent && (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              RSVPs — {selectedEvent.title}
            </h2>
            <span className="text-xs text-gray-400">Auto-refreshes every 30s</span>
          </div>

          {loadingRsvps ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            </div>
          ) : rsvps.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center text-gray-400">
              No RSVPs found for this event.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Member</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Channel</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Registered</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Confirmed</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rsvps.map((rsvp) => {
                    const confirmKey = `${rsvp.member_id}-YES`;
                    const cancelKey = `${rsvp.member_id}-NO`;
                    return (
                      <tr key={rsvp.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{rsvp.member_name}</div>
                          <div className="text-xs text-gray-400">{rsvp.member_email}</div>
                        </td>
                        <td className="px-4 py-3">{statusBadge(rsvp.status)}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {channelIcon(rsvp.member_preferred_channel)}{" "}
                          <span className="capitalize">{rsvp.member_preferred_channel}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {format(new Date(rsvp.registered_at), "MMM d, h:mm a")}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {rsvp.confirmed_at
                            ? format(new Date(rsvp.confirmed_at), "MMM d, h:mm a")
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                void simulateResponse(rsvp.member_id, selectedEvent.id, "YES")
                              }
                              disabled={
                                rsvp.status === "confirmed" || !!actionLoading[confirmKey]
                              }
                              className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-40"
                            >
                              {actionLoading[confirmKey] ? "…" : "✓ Confirm"}
                            </button>
                            <button
                              onClick={() =>
                                void simulateResponse(rsvp.member_id, selectedEvent.id, "NO")
                              }
                              disabled={
                                rsvp.status === "cancelled" || !!actionLoading[cancelKey]
                              }
                              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-40"
                            >
                              {actionLoading[cancelKey] ? "…" : "✕ Cancel"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Message Log */}
          <div className="mt-8">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">Message Log</h3>
            {loadingMessages ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
              </div>
            ) : messages.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 py-8 text-center text-sm text-gray-400">
                No messages logged for this event yet.
                <br />
                <span className="text-xs">Send a reminder to see messages here.</span>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Agent</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Member</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Channel</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Direction</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {messages.slice(0, 10).map((msg) => (
                      <tr key={msg.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                          {msg.sent_at
                            ? format(new Date(msg.sent_at), "MMM d, h:mm a")
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700 capitalize">
                            {msg.agent_type.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{msg.member_id ?? "—"}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 capitalize">
                          {channelIcon(msg.channel)} {msg.channel}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-medium capitalize ${
                              msg.direction === "outbound"
                                ? "text-blue-600"
                                : "text-green-600"
                            }`}
                          >
                            {msg.direction === "outbound" ? "↑ out" : "↓ in"}
                          </span>
                        </td>
                        <td className="max-w-xs px-4 py-3 text-xs text-gray-600">
                          <span className="line-clamp-1">{msg.content}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
