"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { PortalRegistration } from "@/lib/types";

const POLL_INTERVAL_MS = 5_000;

export default function DashboardPage() {
  const [registrations, setRegistrations] = useState<PortalRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistrations = useCallback(async () => {
    try {
      const res = await fetch("/api/portal-registrations");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setRegistrations(json.data ?? []);
      setLastRefreshed(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + polling
  useEffect(() => {
    fetchRegistrations();
    const interval = setInterval(fetchRegistrations, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchRegistrations]);

  async function handleReset() {
    setResetting(true);
    try {
      const res = await fetch("/api/portal-registrations", { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setRegistrations(json.data ?? []);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setResetting(false);
    }
  }

  const completeCount = registrations.filter((r) => r.status === "Complete").length;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F7F2F0",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      {/* Header */}
      <header style={{ backgroundColor: "#240C00" }}>
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "28px" }}>ॐ</span>
            <div>
              <div style={{ color: "#F7F2F0", fontSize: "16px", fontWeight: "bold", letterSpacing: "0.02em" }}>
                Chinmaya Mission America
              </div>
              <div style={{ color: "#988f8a", fontSize: "12px" }}>Registration Dashboard</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link
              href="/portal/registration"
              style={{ color: "#C8A882", fontSize: "13px", textDecoration: "none" }}
            >
              ← Registration Portal
            </Link>
            <Link
              href="/"
              style={{ color: "#988f8a", fontSize: "12px", textDecoration: "none" }}
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      {/* Salesforce banner */}
      <div style={{ backgroundColor: "#1B3A6B", padding: "8px 24px", textAlign: "center" }}>
        <span style={{ color: "#A8C4E8", fontSize: "12px" }}>
          Simulated Salesforce Experience Cloud Portal — Admin Dashboard
        </span>
      </div>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Page title row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1 style={{ color: "#240C00", fontSize: "22px", fontWeight: "bold", marginBottom: "4px" }}>
              Portal Registrations
            </h1>
            <div style={{ width: "48px", height: "2px", backgroundColor: "#7C6D66" }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {lastRefreshed && (
              <span style={{ color: "#988f8a", fontSize: "12px" }}>
                Last refreshed: {lastRefreshed.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={handleReset}
              disabled={resetting}
              style={{
                backgroundColor: resetting ? "#7C6D66" : "#fff",
                color: resetting ? "#F7F2F0" : "#240C00",
                border: "1px solid #E3D6D3",
                borderRadius: "20px",
                padding: "8px 18px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: resetting ? "not-allowed" : "pointer",
                opacity: resetting ? 0.7 : 1,
              }}
            >
              {resetting ? "Resetting..." : "Reset All to Pending"}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <StatCard label="Total Registrations" value={registrations.length} color="#240C00" />
          <StatCard label="Payments Complete" value={completeCount} color="#15803D" />
          <StatCard label="Pending Payment" value={registrations.length - completeCount} color="#92400E" />
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "8px",
              padding: "12px 16px",
              color: "#DC2626",
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            Error: {error}
          </div>
        )}

        {/* Table */}
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #E3D6D3",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <div style={{ padding: "48px", textAlign: "center", color: "#7C6D66", fontSize: "14px" }}>
              Loading registrations...
            </div>
          ) : registrations.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", color: "#988f8a", fontSize: "14px" }}>
              No registrations found.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#F7F2F0", borderBottom: "1px solid #E3D6D3" }}>
                  {["Name", "Email", "Membership Type", "Status", "Payment Confirmed At", "Transaction ID"].map(
                    (col) => (
                      <th
                        key={col}
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#7C6D66",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {registrations.map((row, idx) => (
                  <tr
                    key={row.id}
                    style={{
                      backgroundColor: row.status === "Complete" ? "#f0fdf4" : "transparent",
                      borderBottom: idx < registrations.length - 1 ? "1px solid #E3D6D3" : "none",
                      transition: "background-color 0.8s ease",
                    }}
                  >
                    <td style={cellStyle}>{row.name}</td>
                    <td style={{ ...cellStyle, color: "#7C6D66" }}>{row.email}</td>
                    <td style={cellStyle}>{row.membership_type}</td>
                    <td style={cellStyle}>
                      <StatusBadge status={row.status} />
                    </td>
                    <td style={{ ...cellStyle, color: "#7C6D66", fontSize: "12px" }}>
                      {row.payment_confirmed_at
                        ? new Date(row.payment_confirmed_at).toLocaleString()
                        : "—"}
                    </td>
                    <td style={{ ...cellStyle, color: "#988f8a", fontSize: "11px", fontFamily: "monospace" }}>
                      {row.transaction_id ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Polling note */}
        <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#C8A882",
              display: "inline-block",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
          <span style={{ color: "#988f8a", fontSize: "12px" }}>
            Auto-refreshing every 5 seconds
          </span>
        </div>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

const cellStyle: React.CSSProperties = {
  padding: "14px 16px",
  fontSize: "13px",
  color: "#240C00",
  verticalAlign: "middle",
};

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "1px solid #E3D6D3",
        borderRadius: "12px",
        padding: "20px 24px",
      }}
    >
      <div style={{ fontSize: "28px", fontWeight: "bold", color, marginBottom: "4px" }}>{value}</div>
      <div style={{ fontSize: "12px", color: "#7C6D66" }}>{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isComplete = status === "Complete";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "4px 10px",
        borderRadius: "12px",
        fontSize: "11px",
        fontWeight: 600,
        backgroundColor: isComplete ? "#DCFCE7" : "#FEF9EC",
        color: isComplete ? "#15803D" : "#92400E",
        border: `1px solid ${isComplete ? "#BBF7D0" : "#FDE68A"}`,
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: isComplete ? "#22C55E" : "#F59E0B",
        }}
      />
      {status}
    </span>
  );
}
