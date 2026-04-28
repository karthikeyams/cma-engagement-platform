"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface ZeffyPaymentEmbedProps {
  memberEmail: string;
  memberName: string;
  onPaymentComplete: () => void;
}

// Supports both slug ("cma-balavihar") and UUID form IDs.
// The env var holds whichever format Zeffy gives you.
const ZEFFY_FORM_ID = process.env.NEXT_PUBLIC_ZEFFY_FORM_ID ?? "";

// Build the embed src — Zeffy uses /ticketing/ for event/ticket forms
// and /membership/ for membership forms. We try to detect from the form ID
// but ultimately the embed format is the same; Zeffy routes by slug internally.
function buildEmbedSrc(formId: string): string {
  if (!formId || formId === "your-zeffy-form-id-here") return "";
  // UUIDs → membership embed; slugs → ticketing embed
  const isUUID = /^[0-9a-f-]{36}$/i.test(formId);
  const type = isUUID ? "membership" : "ticketing";
  return `https://www.zeffy.com/en-US/embed/${type}/${formId}`;
}

const EMBED_SRC = buildEmbedSrc(ZEFFY_FORM_ID);

const POLL_INTERVAL_MS = 5_000;
const POLL_START_DELAY_MS = 10_000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;
// If no Zeffy postMessage arrives within this time after onLoad, treat as broken
const IFRAME_HEALTH_TIMEOUT_MS = 6_000;

export default function ZeffyPaymentEmbed({
  memberEmail,
  memberName,
  onPaymentComplete,
}: ZeffyPaymentEmbedProps) {
  const noFormId = !EMBED_SRC;
  // Start in error state immediately if there's no valid form ID configured
  const [iframeError, setIframeError] = useState(noFormId);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [simulateLoading, setSimulateLoading] = useState(false);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingStartedRef = useRef(false);
  const healthTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iframeHealthyRef = useRef(false);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null; }
    if (pollTimeoutRef.current) { clearTimeout(pollTimeoutRef.current); pollTimeoutRef.current = null; }
    setIsPolling(false);
    pollingStartedRef.current = false;
  }, []);

  const startPolling = useCallback(() => {
    if (pollingStartedRef.current) return;
    pollingStartedRef.current = true;
    setIsPolling(true);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/registration-status?email=${encodeURIComponent(memberEmail)}`);
        if (!res.ok) return;
        const json = await res.json();
        if (json.data?.status === "Complete") { stopPolling(); onPaymentComplete(); }
      } catch { /* silent */ }
    }, POLL_INTERVAL_MS);

    pollTimeoutRef.current = setTimeout(stopPolling, POLL_TIMEOUT_MS);
  }, [memberEmail, onPaymentComplete, stopPolling]);

  // Start polling 10s after iframe signals it's loaded
  useEffect(() => {
    if (!iframeLoaded) return;
    const timer = setTimeout(startPolling, POLL_START_DELAY_MS);
    return () => clearTimeout(timer);
  }, [iframeLoaded, startPolling]);

  // postMessage listener — catches both payment_complete and org-not-connected signals
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!event.origin.includes("zeffy.com")) return;

      // Zeffy signals org dashboard not connected via various message shapes
      const data = event.data as Record<string, unknown> | null;
      if (
        typeof data?.type === "string" &&
        (data.type.includes("NOT_CONNECTED") ||
          data.type.includes("ORG_DASHBOARD") ||
          data.type === "error")
      ) {
        setIframeError(true);
        return;
      }

      if (data?.type === "payment_complete") {
        iframeHealthyRef.current = true;
        stopPolling();
        onPaymentComplete();
      }

      // Any message from zeffy.com means the iframe is alive and healthy
      iframeHealthyRef.current = true;
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onPaymentComplete, stopPolling]);

  // Health check: after onLoad + 6s, if no postMessage from Zeffy yet → show error
  function handleIframeLoad() {
    setIframeLoaded(true);
    healthTimerRef.current = setTimeout(() => {
      if (!iframeHealthyRef.current) {
        setIframeError(true);
      }
    }, IFRAME_HEALTH_TIMEOUT_MS);
  }

  useEffect(() => {
    return () => {
      stopPolling();
      if (healthTimerRef.current) clearTimeout(healthTimerRef.current);
    };
  }, [stopPolling]);

  async function handleSimulate() {
    setSimulateLoading(true);
    try {
      const res = await fetch("/api/zeffy-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_status: "paid",
          order: { email: memberEmail },
          transaction_id: `sim_${Date.now()}`,
        }),
      });
      const json = await res.json();
      if (json.updated) { stopPolling(); onPaymentComplete(); }
    } catch (err) {
      console.error("[simulate] Error:", err);
    } finally {
      setSimulateLoading(false);
    }
  }

  return (
    <div style={{ border: "1px solid #E3D6D3", borderRadius: "12px", overflow: "hidden", backgroundColor: "#fff" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#240C00", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ color: "#F7F2F0", fontSize: "14px", fontWeight: 600 }}>Secure Payment via Zeffy</div>
        <div style={{ color: "#988f8a", fontSize: "12px" }}>{memberName}</div>
      </div>

      {/* iframe area */}
      <div style={{ position: "relative", backgroundColor: "#F7F2F0" }}>
        {/* Loading shimmer */}
        {!iframeLoaded && !iframeError && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px", color: "#7C6D66", fontSize: "14px" }}>
            Loading payment form...
          </div>
        )}

        {/* Error / not-configured fallback */}
        {iframeError && (
          <div style={{ padding: "40px 32px", textAlign: "center", backgroundColor: "#FEF9EC", borderTop: "1px solid #FDE68A", borderBottom: "1px solid #FDE68A" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔒</div>
            <div style={{ color: "#92400E", fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>
              {noFormId ? "No Zeffy form configured" : "Zeffy form not yet embeddable"}
            </div>
            <div style={{ color: "#7C6D66", fontSize: "12px", lineHeight: "1.6", maxWidth: "360px", margin: "0 auto 16px" }}>
              {noFormId
                ? "Set NEXT_PUBLIC_ZEFFY_FORM_ID in .env.local to embed your Zeffy form."
                : "Zeffy requires a connected bank account before the embed URL goes live. Connect your bank in the Zeffy dashboard, then the form will appear here."}
            </div>
            {!noFormId && (
              <div style={{ backgroundColor: "#F7F2F0", border: "1px solid #E3D6D3", borderRadius: "8px", padding: "10px 16px", fontSize: "11px", color: "#7C6D66", display: "inline-block", marginBottom: "12px" }}>
                Form ID: <code style={{ color: "#240C00" }}>{ZEFFY_FORM_ID}</code>
                &nbsp;·&nbsp;
                <a href={`https://www.zeffy.com/en-US/${ZEFFY_FORM_ID.includes("-") && ZEFFY_FORM_ID.length < 36 ? "ticketing" : "membership"}/${ZEFFY_FORM_ID}`} target="_blank" rel="noreferrer" style={{ color: "#7C6D66" }}>
                  Open on Zeffy ↗
                </a>
              </div>
            )}
            <div style={{ fontSize: "12px", color: "#7C6D66" }}>
              Use <strong>"Simulate Zeffy Payment"</strong> below to demo the full webhook flow ↓
            </div>
          </div>
        )}

        {/* The actual iframe — rendered even when errored so onLoad fires */}
        {!noFormId && (
          <iframe
            src={EMBED_SRC}
            width="100%"
            height={iframeError ? "0" : "600"}
            allow="payment"
            title="Zeffy Membership Payment"
            onLoad={handleIframeLoad}
            style={{
              border: "none",
              display: "block",
              opacity: iframeLoaded && !iframeError ? 1 : 0,
              transition: "opacity 0.4s ease",
              overflow: "hidden",
            }}
          />
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 20px", borderTop: "1px solid #E3D6D3", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FDFAF9" }}>
        <div style={{ fontSize: "12px", color: "#7C6D66" }}>
          {isPolling ? (
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#C8A882", display: "inline-block", animation: "pulse 1.5s ease-in-out infinite" }} />
              Verifying payment...
            </span>
          ) : (
            <span style={{ color: "#988f8a" }}>{iframeError ? "Demo mode — bank not connected" : "Complete payment above"}</span>
          )}
        </div>

        <button
          onClick={handleSimulate}
          disabled={simulateLoading}
          style={{ backgroundColor: simulateLoading ? "#7C6D66" : "#240C00", color: "#F7F2F0", border: "none", borderRadius: "20px", padding: "8px 18px", fontSize: "12px", fontWeight: 600, cursor: simulateLoading ? "not-allowed" : "pointer", opacity: simulateLoading ? 0.7 : 1, transition: "opacity 0.2s ease" }}
        >
          {simulateLoading ? "Processing..." : "Simulate Zeffy Payment"}
        </button>
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  );
}
