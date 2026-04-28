"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface ZeffyPaymentEmbedProps {
  memberEmail: string;
  memberName: string;
  onPaymentComplete: () => void;
}

const ZEFFY_FORM_ID = process.env.NEXT_PUBLIC_ZEFFY_FORM_ID ?? "demo-form";
const POLL_INTERVAL_MS = 5_000;
const POLL_START_DELAY_MS = 10_000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export default function ZeffyPaymentEmbed({
  memberEmail,
  memberName,
  onPaymentComplete,
}: ZeffyPaymentEmbedProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [simulateLoading, setSimulateLoading] = useState(false);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingStartedRef = useRef(false);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
    setIsPolling(false);
    pollingStartedRef.current = false;
  }, []);

  const startPolling = useCallback(() => {
    if (pollingStartedRef.current) return;
    pollingStartedRef.current = true;
    setIsPolling(true);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/registration-status?email=${encodeURIComponent(memberEmail)}`
        );
        if (!res.ok) return;
        const json = await res.json();
        if (json.data?.status === "Complete") {
          stopPolling();
          onPaymentComplete();
        }
      } catch {
        // silent — will retry next interval
      }
    }, POLL_INTERVAL_MS);

    // Auto-stop after 5 minutes
    pollTimeoutRef.current = setTimeout(() => {
      stopPolling();
    }, POLL_TIMEOUT_MS);
  }, [memberEmail, onPaymentComplete, stopPolling]);

  // Start polling 10s after iframe loads
  useEffect(() => {
    if (!iframeLoaded) return;
    const timer = setTimeout(startPolling, POLL_START_DELAY_MS);
    return () => clearTimeout(timer);
  }, [iframeLoaded, startPolling]);

  // postMessage listener (primary Zeffy signal)
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!event.origin.includes("zeffy.com")) return;
      if (event.data?.type === "payment_complete") {
        stopPolling();
        onPaymentComplete();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onPaymentComplete, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopPolling();
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
      if (json.updated) {
        stopPolling();
        onPaymentComplete();
      }
    } catch (err) {
      console.error("[simulate] Error:", err);
    } finally {
      setSimulateLoading(false);
    }
  }

  return (
    <div
      style={{
        border: "1px solid #E3D6D3",
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "#fff",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          backgroundColor: "#240C00",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ color: "#F7F2F0", fontSize: "14px", fontWeight: 600 }}>
          Secure Payment via Zeffy
        </div>
        <div style={{ color: "#988f8a", fontSize: "12px" }}>
          {memberName}
        </div>
      </div>

      {/* iframe */}
      <div style={{ position: "relative", backgroundColor: "#F7F2F0" }}>
        {!iframeLoaded && !iframeError && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "200px",
              color: "#7C6D66",
              fontSize: "14px",
            }}
          >
            Loading payment form...
          </div>
        )}

        {iframeError ? (
          <div
            style={{
              padding: "40px 32px",
              textAlign: "center",
              backgroundColor: "#FEF9EC",
              borderTop: "1px solid #FDE68A",
              borderBottom: "1px solid #FDE68A",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔒</div>
            <div style={{ color: "#92400E", fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>
              Zeffy form not yet embeddable
            </div>
            <div style={{ color: "#7C6D66", fontSize: "12px", lineHeight: "1.6", maxWidth: "340px", margin: "0 auto 16px" }}>
              Zeffy requires a connected bank account before the embed URL goes live.
              Connect your bank in the Zeffy dashboard to enable the live iframe.
            </div>
            <div
              style={{
                backgroundColor: "#F7F2F0",
                border: "1px solid #E3D6D3",
                borderRadius: "8px",
                padding: "10px 16px",
                fontSize: "11px",
                color: "#7C6D66",
                display: "inline-block",
              }}
            >
              Form ID: <code style={{ color: "#240C00" }}>{ZEFFY_FORM_ID}</code>
            </div>
            <div style={{ marginTop: "16px", fontSize: "12px", color: "#7C6D66" }}>
              Use the <strong>"Simulate Zeffy Payment"</strong> button below to demo the full flow ↓
            </div>
          </div>
        ) : (
          <iframe
            src={`https://www.zeffy.com/en-US/embed/membership/${ZEFFY_FORM_ID}`}
            width="100%"
            height="600"
            allow="payment"
            title="Zeffy Membership Payment"
            onLoad={() => setIframeLoaded(true)}
            onError={() => setIframeError(true)}
            style={{
              border: "none",
              display: "block",
              opacity: iframeLoaded ? 1 : 0,
              transition: "opacity 0.4s ease",
            }}
          />
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "12px 20px",
          borderTop: "1px solid #E3D6D3",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#FDFAF9",
        }}
      >
        {/* Polling indicator */}
        <div style={{ fontSize: "12px", color: "#7C6D66" }}>
          {isPolling ? (
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#C8A882",
                  display: "inline-block",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
              Verifying payment...
            </span>
          ) : (
            <span style={{ color: "#988f8a" }}>Complete payment above</span>
          )}
        </div>

        {/* Simulate button */}
        <button
          onClick={handleSimulate}
          disabled={simulateLoading}
          style={{
            backgroundColor: simulateLoading ? "#7C6D66" : "#240C00",
            color: "#F7F2F0",
            border: "none",
            borderRadius: "20px",
            padding: "8px 18px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: simulateLoading ? "not-allowed" : "pointer",
            opacity: simulateLoading ? 0.7 : 1,
            transition: "opacity 0.2s ease",
          }}
        >
          {simulateLoading ? "Processing..." : "Simulate Zeffy Payment"}
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
