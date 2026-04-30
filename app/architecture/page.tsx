import Link from "next/link";
import { getFeatureMode, showEngagement, showRegistration, type FeatureMode } from "@/lib/config";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

const ENGAGEMENT_DIAGRAM = `
┌────────────────────────────────────────────────────┐
│            CMA Staff Dashboard                     │
│   /dashboard/events  →  Trigger T7/T1 Reminder    │
└───────────────────────────┬────────────────────────┘
                            │ POST /api/agents/remind
                            ▼
┌────────────────────────────────────────────────────┐
│         EventReminderAgent (lib/agents/)           │
│  • Fetches member + event from Supabase            │
│  • Generates message via Claude API                │
│  • Selects channel: WhatsApp → Email fallback      │
└──────┬──────────────────────────────────┬──────────┘
       │ Anthropic API                    │ Log
       ▼                                  ▼
┌──────────────────┐        ┌─────────────────────────┐
│  Claude Sonnet   │        │  Supabase (cma schema)  │
│  claude-sonnet   │        │  • agent_messages        │
│  -4-6            │        │  • rsvps / members       │
└──────────────────┘        └─────────────────────────┘
       │ Personalised message
       ▼
┌────────────────────────────────────────────────────┐
│         Member Receives Reminder                   │
│      WhatsApp (Twilio) or Email (Resend)           │
└────────────────────────────────────────────────────┘
`.trim();

const REGISTRATION_DIAGRAM = `
┌────────────────────────────────────────────────────┐
│   Salesforce Experience Cloud (Production)         │
│         Lightning Web Component (LWC)              │
│  [Simulated by /portal/registration in this POC]  │
└───────────────────────────┬────────────────────────┘
                            │ iframe embed
                            ▼
┌────────────────────────────────────────────────────┐
│          ZeffyPaymentEmbed Component               │
│  • Renders Zeffy payment iframe                    │
│  • Listens for postMessage events                  │
│  • Polling fallback via /api/registration-status   │
└───────────────────────────┬────────────────────────┘
                            │ Member completes payment
                            ▼
┌────────────────────────────────────────────────────┐
│            Zeffy Payment Platform                  │
│  • Fires postMessage to parent frame               │
│  • POSTs webhook to /api/zeffy-webhook             │
└───────────────────────────┬────────────────────────┘
                            │ Webhook
                            ▼
┌────────────────────────────────────────────────────┐
│       /api/zeffy-webhook  (Next.js Route)          │
│  • Validates payload, extracts email               │
│  • Updates portal_registrations → status=Complete  │
│  • Logs to webhook event log                       │
└───────────────────────────┬────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────┐
│      Supabase (cma.portal_registrations)           │
│  status: Pending → Complete                        │
│  payment_confirmed_at + transaction_id stored      │
└────────────────────────────────────────────────────┘
`.trim();

function TechChip({ label }: { label: string }) {
  return (
    <span
      className="inline-block rounded-full px-3 py-1 text-xs font-medium"
      style={{ backgroundColor: "rgba(200,168,130,0.15)", color: "#C8A882", border: "1px solid rgba(200,168,130,0.3)" }}
    >
      {label}
    </span>
  );
}

function EngagementTab({ mode }: { mode: FeatureMode }) {
  return (
    <div>
      <p className="text-base leading-relaxed mb-8 max-w-2xl" style={{ color: "#988f8a" }}>
        Six AI agents work in concert to keep members connected to the community. The{" "}
        <strong style={{ color: "#C8A882" }}>EventReminderAgent</strong> personalises event
        reminders using Claude, selects the best delivery channel (WhatsApp or email), tracks RSVP
        confirmations, and updates each member&apos;s engagement score — all orchestrated from the
        CMA Staff Dashboard.
      </p>

      {/* Diagram */}
      <div
        className="rounded-xl mb-8 overflow-x-auto"
        style={{ backgroundColor: "#1a0900", border: "1px solid rgba(200,168,130,0.2)" }}
      >
        <div className="px-4 py-2 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: "#E08080" }} />
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: "#C8A882" }} />
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: "#7CB8A8" }} />
          <span className="ml-2 text-xs" style={{ color: "#4a3f3a" }}>Architecture Diagram — Member Engagement</span>
        </div>
        <pre
          className="p-6 text-sm leading-relaxed overflow-x-auto"
          style={{ fontFamily: "var(--font-geist-mono), 'Courier New', monospace", color: "#C8A882", margin: 0 }}
        >
          {ENGAGEMENT_DIAGRAM}
        </pre>
      </div>

      {/* Data Flow */}
      <div className="mb-8">
        <h3 className="text-base font-semibold mb-4" style={{ color: "#F7F2F0" }}>Data Flow</h3>
        <ol className="space-y-3">
          {[
            "Staff clicks the T7 or T1 reminder button on an event card in the Staff Dashboard.",
            "The UI calls POST /api/agents/remind with { eventId, reminderType }.",
            "EventReminderAgent fetches all registered members and the event details from Supabase.",
            "For each member, the agent calls the Anthropic Claude API to generate a personalised reminder in a warm, spiritually-grounded tone.",
            "The agent selects the best channel — WhatsApp (Twilio) first, falling back to Email (Resend).",
            "Each outbound message and inbound RSVP confirmation is logged to cma.agent_messages.",
            "Member engagement scores are updated (+5 for YES, −2 for NO) in cma.members.",
          ].map((step, i) => (
            <li key={i} className="flex gap-4">
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: "rgba(200,168,130,0.2)", color: "#C8A882" }}
              >
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed" style={{ color: "#988f8a" }}>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Tech Stack */}
      <div className="mb-10">
        <h3 className="text-base font-semibold mb-4" style={{ color: "#F7F2F0" }}>Tech Stack</h3>
        <div className="flex flex-wrap gap-2">
          {["Next.js 14 App Router", "TypeScript", "Supabase (PostgreSQL)", "Anthropic Claude", "Twilio (WhatsApp)", "Resend (Email)"].map((t) => (
            <TechChip key={t} label={t} />
          ))}
        </div>
      </div>

      {/* Key Components */}
      <div className="mb-10">
        <h3 className="text-base font-semibold mb-4" style={{ color: "#F7F2F0" }}>Key Components</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: "/dashboard/events", desc: "Staff dashboard — trigger reminders, view RSVPs, see message logs" },
            { name: "lib/agents/event-reminder-agent.ts", desc: "Core agent: personalisation, channel selection, score updates" },
            { name: "lib/agents/base-agent.ts", desc: "Abstract base: Anthropic client, message logging, member/event helpers" },
            { name: "cma.agent_messages", desc: "Supabase table recording every outbound message and inbound reply" },
          ].map(({ name, desc }) => (
            <div
              key={name}
              className="rounded-lg p-4"
              style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(200,168,130,0.15)" }}
            >
              <div className="text-xs font-mono mb-1" style={{ color: "#C8A882" }}>{name}</div>
              <div className="text-xs" style={{ color: "#7C6D66" }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {showEngagement(mode) && (
        <Link
          href="/dashboard/events"
          className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#F7F2F0", color: "#240C00" }}
        >
          Open Staff Dashboard →
        </Link>
      )}
    </div>
  );
}

function RegistrationTab({ mode }: { mode: FeatureMode }) {
  return (
    <div>
      <p className="text-base leading-relaxed mb-8 max-w-2xl" style={{ color: "#988f8a" }}>
        Production-grade payment registration replacing manual spreadsheet tracking. A{" "}
        <strong style={{ color: "#C8A882" }}>Salesforce Experience Cloud Lightning Web Component</strong>{" "}
        embeds the Zeffy payment iframe, listens for postMessage events, and confirms registration
        status via webhook — all in real time. This POC simulates the LWC at{" "}
        <code style={{ color: "#C8A882" }}>/portal/registration</code>.
      </p>

      {/* Diagram */}
      <div
        className="rounded-xl mb-8 overflow-x-auto"
        style={{ backgroundColor: "#1a0900", border: "1px solid rgba(200,168,130,0.2)" }}
      >
        <div className="px-4 py-2 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: "#E08080" }} />
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: "#C8A882" }} />
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: "#7CB8A8" }} />
          <span className="ml-2 text-xs" style={{ color: "#4a3f3a" }}>Architecture Diagram — Zeffy Registration</span>
        </div>
        <pre
          className="p-6 text-sm leading-relaxed overflow-x-auto"
          style={{ fontFamily: "var(--font-geist-mono), 'Courier New', monospace", color: "#C8A882", margin: 0 }}
        >
          {REGISTRATION_DIAGRAM}
        </pre>
      </div>

      {/* Data Flow */}
      <div className="mb-8">
        <h3 className="text-base font-semibold mb-4" style={{ color: "#F7F2F0" }}>Data Flow</h3>
        <ol className="space-y-3">
          {[
            "Member logs into the Salesforce Experience Cloud portal (simulated by /portal/registration in this POC).",
            "The Lightning Web Component (LWC) renders ZeffyPaymentEmbed, which loads a Zeffy payment iframe.",
            "Member completes payment inside the Zeffy iframe.",
            "Zeffy fires a postMessage (zeffy-embed:thank-you-animation-shown) to the parent frame.",
            "Simultaneously, Zeffy POSTs a webhook payload to /api/zeffy-webhook.",
            "The webhook route validates the payload, extracts the member email, and updates cma.portal_registrations → status=Complete.",
            "The dashboard at /portal/dashboard polls every 5 seconds and reflects the new status immediately.",
          ].map((step, i) => (
            <li key={i} className="flex gap-4">
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: "rgba(200,168,130,0.2)", color: "#C8A882" }}
              >
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed" style={{ color: "#988f8a" }}>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Tech Stack */}
      <div className="mb-10">
        <h3 className="text-base font-semibold mb-4" style={{ color: "#F7F2F0" }}>Tech Stack</h3>
        <div className="flex flex-wrap gap-2">
          {["Next.js 14 App Router", "TypeScript", "Supabase (PostgreSQL)", "Zeffy", "Salesforce LWC", "Zod"].map((t) => (
            <TechChip key={t} label={t} />
          ))}
        </div>
      </div>

      {/* Key Components */}
      <div className="mb-10">
        <h3 className="text-base font-semibold mb-4" style={{ color: "#F7F2F0" }}>Key Components</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: "/portal/registration", desc: "POC simulation of the Salesforce LWC — member selector + Zeffy embed" },
            { name: "components/ZeffyPaymentEmbed.tsx", desc: "Iframe wrapper with postMessage listener, health check, and polling fallback" },
            { name: "/api/zeffy-webhook", desc: "Receives Zeffy payment event, updates Supabase, logs every step" },
            { name: "cma.portal_registrations", desc: "Supabase table tracking registration status, payment timestamp, and transaction ID" },
            { name: "/portal/dashboard", desc: "Live dashboard polling every 5s — shows all registration statuses" },
            { name: "components/WebhookEventLog.tsx", desc: "Terminal-style live log of all webhook calls (useful for demos)" },
          ].map(({ name, desc }) => (
            <div
              key={name}
              className="rounded-lg p-4"
              style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(200,168,130,0.15)" }}
            >
              <div className="text-xs font-mono mb-1" style={{ color: "#C8A882" }}>{name}</div>
              <div className="text-xs" style={{ color: "#7C6D66" }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {showRegistration(mode) && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/portal/registration"
            className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#C8A882", color: "#240C00" }}
          >
            Try Portal Demo →
          </Link>
          <Link
            href="/portal/dashboard"
            className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "rgba(200,168,130,0.15)", color: "#C8A882", border: "1px solid rgba(200,168,130,0.3)" }}
          >
            View Dashboard →
          </Link>
        </div>
      )}
    </div>
  );
}

export default async function ArchitecturePage({ searchParams }: PageProps) {
  const mode = getFeatureMode();
  const params = await searchParams;

  const engagementEnabled = showEngagement(mode);
  const registrationEnabled = showRegistration(mode);

  // Determine active tab: use query param if valid and enabled, otherwise default to first enabled
  let activeTab: "engagement" | "registration" =
    engagementEnabled ? "engagement" : "registration";
  if (params.tab === "engagement" && engagementEnabled) activeTab = "engagement";
  if (params.tab === "registration" && registrationEnabled) activeTab = "registration";

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#0f0500", fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      {/* Header */}
      <header style={{ backgroundColor: "#240C00", borderBottom: "1px solid rgba(200,168,130,0.15)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl" style={{ color: "#C8A882" }}>ॐ</span>
            <div>
              <div className="text-sm font-bold" style={{ color: "#F7F2F0" }}>
                Chinmaya Mission Atlanta
              </div>
              <div className="text-xs" style={{ color: "#988f8a" }}>Platform Architecture</div>
            </div>
          </div>
          <Link
            href="/"
            className="text-sm transition-opacity hover:opacity-70"
            style={{ color: "#988f8a" }}
          >
            ← Home
          </Link>
        </div>
      </header>

      {/* Page Title */}
      <div className="max-w-5xl mx-auto px-6 pt-12 pb-8">
        <div
          className="inline-block rounded-full px-4 py-1.5 text-xs font-medium mb-4 tracking-widest uppercase"
          style={{ backgroundColor: "rgba(124,109,102,0.3)", color: "#E3D6D3" }}
        >
          Technical Architecture
        </div>
        <h1 className="text-3xl font-bold mb-3" style={{ color: "#F7F2F0" }}>
          How It Works
        </h1>
        <p className="text-sm max-w-xl" style={{ color: "#7C6D66" }}>
          Two complementary capabilities — AI-powered member engagement and seamless Zeffy payment
          registration — built on a modern serverless stack.
        </p>
      </div>

      {/* Tab Bar */}
      <div className="max-w-5xl mx-auto px-6 mb-8">
        <div
          className="inline-flex rounded-xl p-1 gap-1"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(200,168,130,0.15)" }}
        >
          {engagementEnabled && (
            <Link
              href="/architecture?tab=engagement"
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all"
              style={
                activeTab === "engagement"
                  ? { backgroundColor: "#240C00", color: "#F7F2F0", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }
                  : { color: "#7C6D66" }
              }
            >
              <span>🧠</span> Member Engagement
            </Link>
          )}
          {registrationEnabled && (
            <Link
              href="/architecture?tab=registration"
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all"
              style={
                activeTab === "registration"
                  ? { backgroundColor: "#240C00", color: "#F7F2F0", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }
                  : { color: "#7C6D66" }
              }
            >
              <span>💳</span> Zeffy Registration
            </Link>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        {activeTab === "engagement" && engagementEnabled && <EngagementTab mode={mode} />}
        {activeTab === "registration" && registrationEnabled && <RegistrationTab mode={mode} />}
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: "#1a0900", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <span className="text-xs" style={{ color: "#4a3f3a" }}>
            © 2025 Chinmaya Mission Atlanta · Hari Om
          </span>
          <Link
            href="/"
            className="text-xs transition-colors hover:text-white"
            style={{ color: "#7C6D66" }}
          >
            ← Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
