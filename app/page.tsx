import Link from "next/link";
import { getFeatureMode, showEngagement, showRegistration } from "@/lib/config";

// ─── Colour tokens matching cmgurukul.org ────────────────────
// Primary dark brown : #240C00
// Warm taupe         : #7C6D66
// Beige background   : #F7F2F0
// Border             : #E3D6D3
// Muted text         : #988f8a

const upcomingEvents = [
  {
    title: "Gita Jnana Yajna — Chapter 12",
    type: "Satsang",
    date: "May 1–5, 2025",
    time: "6:30 PM daily",
    location: "CMA Ashram, Roswell GA",
    description:
      "A five-day intensive exposition of Bhagavad Gita Chapter 12 (Bhakti Yoga) by Swami Swaroopananda. Open to all seekers.",
  },
  {
    title: "Devi Bhava Celebration",
    type: "Cultural",
    date: "May 8, 2025",
    time: "5:00 PM",
    location: "CMA Ashram — Main Hall",
    description:
      "An evening of devotional music, Devi puja, and cultural performances celebrating the Divine Mother.",
  },
  {
    title: "Bala Vihar Spring Session",
    type: "Youth",
    date: "April 27, 2025",
    time: "10:00 AM",
    location: "CMA Ashram — Bala Vihar Hall",
    description:
      "Monthly session for children ages 6–16. Chanting, scriptural stories, and craft activities.",
  },
];

const programs = [
  {
    icon: "🕉️",
    title: "Vedanta Classes",
    description:
      "Weekly study of foundational Vedanta texts including Vivekachudamani and the Upanishads, guided by trained acharyas.",
  },
  {
    icon: "📖",
    title: "Gita Study",
    description:
      "Systematic study of the Bhagavad Gita — one of the most profound spiritual texts ever written.",
  },
  {
    icon: "👧",
    title: "Bala Vihar",
    description:
      "A joyful spiritual education program for children and youth, rooted in Indian culture and values.",
  },
  {
    icon: "🙏",
    title: "Satsang",
    description:
      "Sunday satsangs combining bhajans, meditation, and spiritual discourse in a warm community setting.",
  },
  {
    icon: "🌸",
    title: "Devi Bhava",
    description:
      "Seasonal celebrations honoring the Divine Mother through puja, music, and cultural programs.",
  },
  {
    icon: "🤝",
    title: "Seva",
    description:
      "Volunteer service opportunities that embody karma yoga — selfless action as a spiritual practice.",
  },
];

const allStats = [
  { value: "500+", label: "Active Members" },
  { value: "20+", label: "Years of Service" },
  { value: "6", label: "AI Agents" },
  { value: "4", label: "Upcoming Events" },
];

export default function HomePage() {
  const mode = getFeatureMode();

  const stats = mode === "registration"
    ? allStats.filter((s) => s.label !== "AI Agents")
    : allStats;

  const heroTitle =
    mode === "engagement"
      ? { line1: "AI-Powered", highlight: "Member Engagement", line2: "for Spiritual Communities" }
      : mode === "registration"
      ? { line1: "Seamless", highlight: "Event Registration", line2: "for Spiritual Communities" }
      : { line1: "Connecting Our", highlight: "Spiritual Community", line2: "Through AI" };

  const heroSubtitle =
    mode === "registration"
      ? "Seamless Zeffy-powered membership payment integrated directly into Salesforce Experience Cloud, with real-time webhook confirmation and automatic status tracking."
      : "Personalized event reminders, RSVP management, volunteer coordination, and member engagement — powered by intelligent agents built on the timeless values of Chinmaya Mission.";

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#F7F2F0", fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      {/* ── Navigation ─────────────────────────────────────── */}
      <header style={{ backgroundColor: "#240C00" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-3xl">ॐ</span>
            <div>
              <div
                className="text-lg font-bold leading-tight"
                style={{ color: "#F7F2F0", letterSpacing: "0.02em" }}
              >
                Chinmaya Mission Alpharetta
              </div>
              <div className="text-xs" style={{ color: "#988f8a" }}>
                Member Engagement Platform
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {["About", "Programs", "Events", "Seva", "Contact"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-cma-border hover:text-cma-beige transition-colors"
              >
                {item}
              </a>
            ))}
            <Link
              href="/architecture"
              className="transition-colors hover:opacity-80"
              style={{ color: "#C8A882" }}
            >
              Architecture
            </Link>
          </nav>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            {showRegistration(mode) && (
              <Link
                href="/portal/registration"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#C8A882", color: "#240C00" }}
              >
                Registration Demo →
              </Link>
            )}
            {showEngagement(mode) && (
              <Link
                href="/dashboard/events"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#7C6D66", color: "#F7F2F0" }}
              >
                Staff Dashboard →
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: "#240C00", minHeight: "520px" }}
      >
        {/* Decorative Sanskrit pattern overlay */}
        <div
          className="absolute inset-0 opacity-5 text-center"
          style={{
            fontSize: "12rem",
            color: "#F7F2F0",
            lineHeight: 1,
            paddingTop: "2rem",
            userSelect: "none",
          }}
        >
          ॐ
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">
          {/* Hero text */}
          <div className="flex-1 text-center md:text-left">
            <div
              className="inline-block rounded-full px-4 py-1.5 text-xs font-medium mb-6 tracking-widest uppercase"
              style={{ backgroundColor: "rgba(124,109,102,0.3)", color: "#E3D6D3" }}
            >
              Chinmaya Mission Alpharetta
            </div>
            <h1
              className="font-bold leading-tight mb-6"
              style={{
                color: "#F7F2F0",
                fontSize: "clamp(2rem, 4vw, 3rem)",
              }}
            >
              {heroTitle.line1}
              <br />
              <span style={{ color: "#C8A882" }}>{heroTitle.highlight}</span>
              <br />
              {heroTitle.line2}
            </h1>
            <p
              className="text-base leading-relaxed mb-8 max-w-lg"
              style={{ color: "#988f8a" }}
            >
              {heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              {showEngagement(mode) && (
                <Link
                  href="/dashboard/events"
                  className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#F7F2F0", color: "#240C00" }}
                >
                  Open Dashboard
                </Link>
              )}
              {showRegistration(mode) && (
                <Link
                  href="/portal/registration"
                  className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#C8A882", color: "#240C00" }}
                >
                  Registration Demo →
                  <span className="ml-1 text-xs opacity-70">powered by Zeffy</span>
                </Link>
              )}
              <Link
                href="/architecture"
                className="inline-flex items-center justify-center rounded-full border px-8 py-3 text-sm font-medium transition-colors"
                style={{ borderColor: "#7C6D66", color: "#E3D6D3" }}
              >
                How it Works →
              </Link>
              <a
                href="#programs"
                className="inline-flex items-center justify-center rounded-full border px-8 py-3 text-sm font-medium transition-colors"
                style={{ borderColor: "#7C6D66", color: "#E3D6D3" }}
              >
                Our Programs
              </a>
            </div>
          </div>

          {/* Stats card */}
          <div
            className="rounded-2xl p-8 grid grid-cols-2 gap-6 min-w-64"
            style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div
                  className="text-3xl font-bold mb-1"
                  style={{ color: "#C8A882" }}
                >
                  {s.value}
                </div>
                <div className="text-xs" style={{ color: "#988f8a" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Upcoming Events ────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2
              className="text-2xl font-bold mb-1"
              style={{ color: "#240C00" }}
            >
              Upcoming Events
            </h2>
            <div
              className="h-0.5 w-12 rounded"
              style={{ backgroundColor: "#7C6D66" }}
            />
          </div>
          {showEngagement(mode) && (
            <Link
              href="/dashboard/events"
              className="text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: "#7C6D66" }}
            >
              Manage all events →
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <div
              key={event.title}
              className="rounded-xl overflow-hidden transition-shadow hover:shadow-lg"
              style={{
                backgroundColor: "#fff",
                border: "1px solid #E3D6D3",
              }}
            >
              {/* Colour band by type */}
              <div
                className="h-1.5"
                style={{
                  backgroundColor:
                    event.type === "Satsang"
                      ? "#C8A882"
                      : event.type === "Cultural"
                      ? "#E08080"
                      : "#7CB8A8",
                }}
              />
              <div className="p-6">
                <span
                  className="inline-block rounded-full px-3 py-0.5 text-xs font-medium mb-3"
                  style={{ backgroundColor: "#F7F2F0", color: "#7C6D66" }}
                >
                  {event.type}
                </span>
                <h3
                  className="text-base font-semibold leading-snug mb-2"
                  style={{ color: "#240C00" }}
                >
                  {event.title}
                </h3>
                <p
                  className="text-xs leading-relaxed mb-4"
                  style={{ color: "#988f8a" }}
                >
                  {event.description}
                </p>
                <div
                  className="space-y-1 text-xs pt-4"
                  style={{
                    borderTop: "1px solid #E3D6D3",
                    color: "#7C6D66",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>📅</span> {event.date} · {event.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📍</span> {event.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ────────────────────────────────────────── */}
      <div
        className="max-w-6xl mx-auto px-6"
        style={{ borderTop: "1px solid #E3D6D3" }}
      />

      {/* ── Programs ───────────────────────────────────────── */}
      <section id="programs" className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: "#240C00" }}
          >
            Our Programs
          </h2>
          <div
            className="h-0.5 w-12 rounded mx-auto mb-4"
            style={{ backgroundColor: "#7C6D66" }}
          />
          <p className="text-sm max-w-xl mx-auto" style={{ color: "#988f8a" }}>
            Rooted in Vedanta, Chinmaya Mission Alpharetta offers a range of
            programs for all ages — from young children to seasoned seekers.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {programs.map((p) => (
            <div
              key={p.title}
              className="rounded-xl p-6 transition-shadow hover:shadow-md"
              style={{
                backgroundColor: "#fff",
                border: "1px solid #E3D6D3",
              }}
            >
              <div className="text-3xl mb-3">{p.icon}</div>
              <h3
                className="text-sm font-semibold mb-2"
                style={{ color: "#240C00" }}
              >
                {p.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "#988f8a" }}>
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature Banner ─────────────────────────────────── */}
      {showEngagement(mode) ? (
        <section style={{ backgroundColor: "#240C00" }}>
          <div className="max-w-6xl mx-auto px-6 py-14 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2
                className="text-xl font-bold mb-2"
                style={{ color: "#F7F2F0" }}
              >
                Member Engagement Platform
              </h2>
              <p className="text-sm max-w-lg" style={{ color: "#988f8a" }}>
                Six AI agents working together to send personalized reminders,
                collect feedback, coordinate volunteers, onboard new members, and
                re-engage at-risk members — all from one dashboard.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              {showRegistration(mode) && (
                <Link
                  href="/portal/registration"
                  className="inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#C8A882", color: "#240C00" }}
                >
                  Registration Demo
                  <span className="ml-1 text-xs opacity-70">powered by Zeffy</span>
                </Link>
              )}
              <Link
                href="/dashboard/events"
                className="inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#F7F2F0", color: "#240C00" }}
              >
                Event Dashboard
              </Link>
              <Link
                href="/architecture"
                className="inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "rgba(200,168,130,0.15)", color: "#C8A882", border: "1px solid rgba(200,168,130,0.3)" }}
              >
                Architecture →
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section style={{ backgroundColor: "#240C00" }}>
          <div className="max-w-6xl mx-auto px-6 py-14 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2
                className="text-xl font-bold mb-2"
                style={{ color: "#F7F2F0" }}
              >
                Zeffy Registration Platform
              </h2>
              <p className="text-sm max-w-lg" style={{ color: "#988f8a" }}>
                Production-grade event registration powered by Zeffy — embedded
                directly into Salesforce Experience Cloud via a Lightning Web
                Component. Real-time webhook confirmation replaces manual
                spreadsheet tracking.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link
                href="/portal/registration"
                className="inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#C8A882", color: "#240C00" }}
              >
                Registration Demo
                <span className="ml-1 text-xs opacity-70">powered by Zeffy</span>
              </Link>
              <Link
                href="/portal/dashboard"
                className="inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#F7F2F0", color: "#240C00" }}
              >
                View Dashboard
              </Link>
              <Link
                href="/architecture"
                className="inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "rgba(200,168,130,0.15)", color: "#C8A882", border: "1px solid rgba(200,168,130,0.3)" }}
              >
                Architecture →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer style={{ backgroundColor: "#1a0900", color: "#988f8a" }}>
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-2xl" style={{ color: "#C8A882" }}>ॐ</span>
            <div>
              <div className="text-sm font-semibold" style={{ color: "#E3D6D3" }}>
                Chinmaya Mission Alpharetta
              </div>
              <div className="text-xs">1475 Hembree Rd, Roswell, GA 30076</div>
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-6 text-xs">
            {["About", "Programs", "Events", "Seva", "Contact"].map((item) => (
              <a
                key={item}
                href="#"
                className="transition-colors hover:text-white"
                style={{ color: "#7C6D66" }}
              >
                {item}
              </a>
            ))}
          </div>

          {/* Social */}
          <div className="flex gap-4 text-lg">
            {["f", "▶", "in"].map((icon) => (
              <a
                key={icon}
                href="#"
                className="transition-colors hover:text-white text-xs font-bold"
                style={{ color: "#7C6D66" }}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        <div
          className="text-center text-xs py-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)", color: "#4a3f3a" }}
        >
          © 2025 Chinmaya Mission Alpharetta · Built with seva and AI · Hari Om
        </div>
      </footer>
    </div>
  );
}
