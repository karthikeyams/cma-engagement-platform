import { getRegistration } from "@/lib/zeffy/store";
import { SEED_MEMBERS } from "@/lib/zeffy/seed";
import type { PortalRegistration } from "@/lib/types";
import Link from "next/link";
import RegistrationClientWrapper from "./RegistrationClientWrapper";

interface RegistrationContentProps {
  email?: string;
}

export default async function RegistrationContent({ email }: RegistrationContentProps) {
  // No email — show member selector
  if (!email) {
    return <MemberSelector />;
  }

  const member = await getRegistration(email);

  if (!member) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px",
          color: "#7C6D66",
          border: "1px solid #E3D6D3",
          borderRadius: "12px",
          backgroundColor: "#fff",
        }}
      >
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>⚠️</div>
        <div style={{ fontSize: "16px", color: "#240C00", marginBottom: "8px" }}>
          Member not found
        </div>
        <div style={{ fontSize: "13px", marginBottom: "20px" }}>
          No registration found for <strong>{email}</strong>
        </div>
        <Link
          href="/portal/registration"
          style={{
            backgroundColor: "#240C00",
            color: "#F7F2F0",
            padding: "10px 24px",
            borderRadius: "20px",
            fontSize: "13px",
            textDecoration: "none",
          }}
        >
          ← Select a member
        </Link>
      </div>
    );
  }

  return <RegistrationClientWrapper member={member} />;
}

function MemberSelector() {
  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ color: "#240C00", fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
          Member Registration
        </h1>
        <div style={{ width: "48px", height: "2px", backgroundColor: "#7C6D66", marginBottom: "12px" }} />
        <p style={{ color: "#7C6D66", fontSize: "14px" }}>
          Select a member to complete their Zeffy membership payment.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
        {SEED_MEMBERS.map((member) => (
          <Link
            key={member.email}
            href={`/portal/registration?email=${encodeURIComponent(member.email)}`}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                backgroundColor: "#fff",
                border: "1px solid #E3D6D3",
                borderRadius: "12px",
                padding: "24px",
                cursor: "pointer",
                transition: "box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(36,12,0,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "#F7F2F0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  marginBottom: "16px",
                  border: "1px solid #E3D6D3",
                }}
              >
                🙏
              </div>
              <div style={{ color: "#240C00", fontSize: "16px", fontWeight: "bold", marginBottom: "4px" }}>
                {member.name}
              </div>
              <div style={{ color: "#7C6D66", fontSize: "12px", marginBottom: "8px" }}>
                {member.email}
              </div>
              <div
                style={{
                  display: "inline-block",
                  backgroundColor: "#F7F2F0",
                  color: "#7C6D66",
                  borderRadius: "12px",
                  padding: "4px 12px",
                  fontSize: "11px",
                  border: "1px solid #E3D6D3",
                }}
              >
                {member.membership_type}
              </div>
              <div
                style={{
                  marginTop: "16px",
                  color: "#C8A882",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Begin Registration →
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Salesforce + Production Callout */}
      <div
        style={{
          marginTop: "40px",
          backgroundColor: "#EEF4FF",
          border: "1px solid #B8D0F0",
          borderRadius: "12px",
          padding: "20px 24px",
        }}
      >
        <div style={{ fontWeight: "bold", color: "#1B3A6B", fontSize: "14px", marginBottom: "8px" }}>
          ℹ️ Production Architecture
        </div>
        <p style={{ color: "#3C5C8A", fontSize: "13px", lineHeight: "1.6", margin: 0 }}>
          In production, this page is rendered as a <strong>Lightning Web Component (LWC)</strong> inside
          a <strong>Salesforce Experience Cloud</strong> portal. The LWC reads the logged-in
          member&apos;s Contact record to pre-select their email, then embeds the Zeffy iframe.
          When payment completes, Zeffy fires a <code>postMessage</code> event (and/or a webhook)
          that triggers the CMA Engagement Platform&apos;s membership confirmation flow.
        </p>
      </div>
    </div>
  );
}
