"use client";

import { useState } from "react";
import Link from "next/link";
import type { PortalRegistration } from "@/lib/types";
import ZeffyPaymentEmbed from "@/components/ZeffyPaymentEmbed";

interface Props {
  member: PortalRegistration;
}

export default function RegistrationClientWrapper({ member }: Props) {
  const [isComplete, setIsComplete] = useState(member.status === "Complete");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", alignItems: "start" }}>
      {/* Left panel — member info */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <MemberInfoPanel member={member} isComplete={isComplete} />
        <ProductionCallout />
      </div>

      {/* Right panel — payment or success */}
      <div>
        {isComplete ? (
          <PaymentSuccessPanel member={member} />
        ) : (
          <ZeffyPaymentEmbed
            memberEmail={member.email}
            memberName={member.name}
            onPaymentComplete={() => setIsComplete(true)}
          />
        )}
      </div>
    </div>
  );
}

function MemberInfoPanel({
  member,
  isComplete,
}: {
  member: PortalRegistration;
  isComplete: boolean;
}) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "1px solid #E3D6D3",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Card header */}
      <div
        style={{
          backgroundColor: "#240C00",
          padding: "16px 20px",
          color: "#F7F2F0",
          fontSize: "13px",
          fontWeight: 600,
        }}
      >
        Member Details
      </div>

      <div style={{ padding: "20px" }}>
        {/* Avatar */}
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "#F7F2F0",
            border: "2px solid #E3D6D3",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            marginBottom: "16px",
          }}
        >
          🙏
        </div>

        <Field label="Name" value={member.name} />
        <Field label="Email" value={member.email} />
        <Field label="Membership" value={member.membership_type} />

        {/* Status badge */}
        <div style={{ marginTop: "16px" }}>
          <div style={{ fontSize: "11px", color: "#988f8a", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Status
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 600,
              backgroundColor: isComplete ? "#DCFCE7" : "#FEF9EC",
              color: isComplete ? "#15803D" : "#92400E",
              border: `1px solid ${isComplete ? "#BBF7D0" : "#FDE68A"}`,
              transition: "all 0.4s ease",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: isComplete ? "#22C55E" : "#F59E0B",
              }}
            />
            {isComplete ? "Complete" : "Pending Payment"}
          </span>
        </div>

        <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #E3D6D3" }}>
          <Link
            href="/portal/registration"
            style={{ color: "#7C6D66", fontSize: "12px", textDecoration: "none" }}
          >
            ← Change member
          </Link>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <div
        style={{
          fontSize: "11px",
          color: "#988f8a",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "2px",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "14px", color: "#240C00" }}>{value}</div>
    </div>
  );
}

function ProductionCallout() {
  return (
    <div
      style={{
        backgroundColor: "#EEF4FF",
        border: "1px solid #B8D0F0",
        borderRadius: "12px",
        padding: "16px",
      }}
    >
      <div style={{ fontWeight: "bold", color: "#1B3A6B", fontSize: "12px", marginBottom: "8px" }}>
        ℹ️ LWC → Salesforce Mapping
      </div>
      <p style={{ color: "#3C5C8A", fontSize: "11px", lineHeight: "1.6", margin: 0 }}>
        In production, this iframe is rendered by a <strong>Lightning Web Component</strong> that
        reads the Contact&apos;s email from Salesforce context. Payment confirmation flows back via
        Zeffy webhook → this API → Salesforce Platform Events.
      </p>
    </div>
  );
}

function PaymentSuccessPanel({ member }: { member: PortalRegistration }) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "2px solid #BBF7D0",
        borderRadius: "12px",
        padding: "48px 32px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "56px", marginBottom: "16px" }}>✅</div>
      <h2 style={{ color: "#15803D", fontSize: "22px", fontWeight: "bold", marginBottom: "8px" }}>
        Registration Complete!
      </h2>
      <p style={{ color: "#7C6D66", fontSize: "14px", marginBottom: "24px" }}>
        Payment confirmed for <strong>{member.name}</strong>.
        <br />
        Welcome to Chinmaya Mission America!
      </p>

      <div
        style={{
          backgroundColor: "#F0FDF4",
          border: "1px solid #BBF7D0",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "24px",
          textAlign: "left",
        }}
      >
        <div style={{ fontSize: "12px", color: "#15803D", fontWeight: 600, marginBottom: "8px" }}>
          Confirmation Details
        </div>
        <div style={{ fontSize: "12px", color: "#7C6D66" }}>
          <div>Email: {member.email}</div>
          <div>Membership: {member.membership_type}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
        <Link
          href="/portal/dashboard"
          style={{
            backgroundColor: "#240C00",
            color: "#F7F2F0",
            padding: "10px 24px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          View Dashboard
        </Link>
        <Link
          href="/portal/registration"
          style={{
            backgroundColor: "#F7F2F0",
            color: "#240C00",
            padding: "10px 24px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: 600,
            textDecoration: "none",
            border: "1px solid #E3D6D3",
          }}
        >
          New Registration
        </Link>
      </div>
    </div>
  );
}
