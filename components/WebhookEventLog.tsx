"use client";

import { useState, useEffect, useCallback } from "react";

interface WebhookLogEntry {
  id: string;
  received_at: string;
  payload: Record<string, unknown>;
  email: string | null;
  result: "skipped" | "updated" | "not_found" | "error";
  reason?: string;
  transaction_id?: string;
  steps: string[];
}

const POLL_MS = 2_000;

const resultColors: Record<WebhookLogEntry["result"], { bg: string; text: string; border: string; label: string }> = {
  updated:   { bg: "#DCFCE7", text: "#15803D", border: "#BBF7D0", label: "✓ Updated" },
  skipped:   { bg: "#FEF9EC", text: "#92400E", border: "#FDE68A", label: "⚠ Skipped" },
  not_found: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA", label: "✗ Not Found" },
  error:     { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA", label: "✗ Error" },
};

export default function WebhookEventLog() {
  const [entries, setEntries] = useState<WebhookLogEntry[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [prevCount, setPrevCount] = useState(0);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/webhook-logs");
      if (!res.ok) return;
      const json = await res.json();
      const newEntries: WebhookLogEntry[] = json.data ?? [];
      setEntries(newEntries);
      // Auto-expand the newest entry when a new one arrives
      if (newEntries.length > prevCount && newEntries[0]) {
        setExpanded((prev) => new Set([...prev, newEntries[0].id]));
        setPrevCount(newEntries.length);
      }
    } catch {
      // silent
    }
  }, [prevCount]);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleClear() {
    await fetch("/api/webhook-logs", { method: "DELETE" });
    setEntries([]);
    setExpanded(new Set());
    setPrevCount(0);
  }

  return (
    <div
      style={{
        backgroundColor: "#0D1117",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #30363D",
        fontFamily: "'SF Mono', 'Fira Code', monospace",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #30363D",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Traffic lights */}
          {["#FF5F56", "#FFBD2E", "#27C93F"].map((c) => (
            <span key={c} style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: c, display: "inline-block" }} />
          ))}
          <span style={{ color: "#8B949E", fontSize: "12px", marginLeft: "4px" }}>
            Webhook Event Log
          </span>
          {entries.length > 0 && (
            <span
              style={{
                backgroundColor: "#21262D",
                color: "#58A6FF",
                borderRadius: "10px",
                padding: "1px 8px",
                fontSize: "11px",
                border: "1px solid #30363D",
              }}
            >
              {entries.length}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "#3FB950", fontSize: "11px", display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#3FB950", display: "inline-block", animation: "pulse 2s ease-in-out infinite" }} />
            live
          </span>
          {entries.length > 0 && (
            <button
              onClick={handleClear}
              style={{ background: "none", border: "none", color: "#8B949E", fontSize: "11px", cursor: "pointer", padding: "2px 6px" }}
            >
              clear
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {entries.length === 0 && (
        <div style={{ padding: "32px", textAlign: "center", color: "#484F58", fontSize: "13px" }}>
          Waiting for webhook events…
          <br />
          <span style={{ fontSize: "11px", marginTop: "4px", display: "block" }}>
            Click &quot;Simulate Zeffy Payment&quot; above to fire one
          </span>
        </div>
      )}

      {/* Event list */}
      {entries.map((entry, idx) => {
        const isOpen = expanded.has(entry.id);
        const colors = resultColors[entry.result];
        const time = new Date(entry.received_at).toLocaleTimeString();
        const isNewest = idx === 0;

        return (
          <div
            key={entry.id}
            style={{
              borderBottom: idx < entries.length - 1 ? "1px solid #21262D" : "none",
              backgroundColor: isNewest && isOpen ? "#161B22" : "transparent",
              transition: "background-color 0.3s ease",
            }}
          >
            {/* Row header — always visible */}
            <div
              onClick={() => toggleExpanded(entry.id)}
              style={{
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
              }}
            >
              <span style={{ color: "#484F58", fontSize: "11px", minWidth: "72px" }}>{time}</span>

              <span
                style={{
                  backgroundColor: colors.bg,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "4px",
                  padding: "1px 8px",
                  fontSize: "11px",
                  fontWeight: 600,
                  minWidth: "90px",
                  textAlign: "center",
                }}
              >
                {colors.label}
              </span>

              <span style={{ color: "#E6EDF3", fontSize: "12px", flex: 1 }}>
                POST /api/zeffy-webhook
                {entry.email && (
                  <span style={{ color: "#58A6FF", marginLeft: "8px" }}>← {entry.email}</span>
                )}
              </span>

              <span style={{ color: "#484F58", fontSize: "12px" }}>{isOpen ? "▲" : "▼"}</span>
            </div>

            {/* Expanded detail */}
            {isOpen && (
              <div style={{ padding: "0 16px 16px 16px" }}>
                {/* Processing steps */}
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ color: "#8B949E", fontSize: "11px", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Processing Steps
                  </div>
                  {entry.steps.map((step, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ color: "#3FB950", fontSize: "11px", minWidth: "16px" }}>{i + 1}.</span>
                      <span style={{ color: "#E6EDF3", fontSize: "12px" }}>{step}</span>
                    </div>
                  ))}
                </div>

                {/* Raw payload */}
                <div>
                  <div style={{ color: "#8B949E", fontSize: "11px", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Raw Payload
                  </div>
                  <pre
                    style={{
                      backgroundColor: "#010409",
                      border: "1px solid #30363D",
                      borderRadius: "6px",
                      padding: "12px",
                      fontSize: "11px",
                      color: "#79C0FF",
                      overflowX: "auto",
                      margin: 0,
                      lineHeight: "1.6",
                    }}
                  >
                    {JSON.stringify(entry.payload, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
