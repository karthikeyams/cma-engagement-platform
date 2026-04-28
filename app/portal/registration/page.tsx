import { Suspense } from "react";
import Link from "next/link";
import RegistrationContent from "./RegistrationContent";

interface PageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function RegistrationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const email = params.email;

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
            maxWidth: "900px",
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
              <div
                style={{
                  color: "#F7F2F0",
                  fontSize: "16px",
                  fontWeight: "bold",
                  letterSpacing: "0.02em",
                }}
              >
                Chinmaya Mission America
              </div>
              <div style={{ color: "#988f8a", fontSize: "12px" }}>
                Member Registration Portal
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link
              href="/portal/dashboard"
              style={{
                color: "#C8A882",
                fontSize: "13px",
                textDecoration: "none",
              }}
            >
              View Dashboard →
            </Link>
            <Link
              href="/"
              style={{
                color: "#988f8a",
                fontSize: "12px",
                textDecoration: "none",
              }}
            >
              ← Home
            </Link>
          </div>
        </div>
      </header>

      {/* Salesforce Experience Cloud simulation banner */}
      <div
        style={{
          backgroundColor: "#1B3A6B",
          padding: "8px 24px",
          textAlign: "center",
        }}
      >
        <span style={{ color: "#A8C4E8", fontSize: "12px" }}>
          Simulated Salesforce Experience Cloud Portal — Zeffy iframe embedded via LWC
        </span>
      </div>

      {/* Main content */}
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px" }}>
        <Suspense fallback={<LoadingState />}>
          <RegistrationContent email={email} />
        </Suspense>
      </main>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ textAlign: "center", padding: "60px", color: "#7C6D66" }}>
      Loading registration...
    </div>
  );
}
