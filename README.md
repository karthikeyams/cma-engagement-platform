# CMA Member Engagement AI Platform

A multi-agent AI system for **Chinmaya Mission Atlanta (CMA)** that automates and personalizes member communications — event reminders, feedback collection, announcements, volunteer coordination, engagement insights, and member onboarding.

> **Board Demo Milestone: May 2, 2025**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| AI Agents | Anthropic Claude API (`claude-sonnet-4-6`) |
| Email | Resend |
| WhatsApp/SMS | Twilio |
| Deployment | Vercel |
| Charts | Recharts |

---

## AI Agents

| Agent | Purpose |
|---|---|
| Event Reminder Agent | Sends personalized reminders and collects RSVP confirmations |
| Feedback Collection Agent | Gathers post-event ratings and suggestions |
| Announcement Agent | Broadcasts program announcements across channels |
| Volunteer Coordination Agent | Matches and recruits seva volunteers |
| Engagement Insight Agent | Re-engages at-risk and lapsed members |
| Onboarding Agent | Welcomes and guides new members |

---

## Getting Started

### Open in GitHub Codespaces (Recommended)

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/karthikeyams/cma-engagement-platform)

The Codespace will automatically:
- Install all npm dependencies
- Install the Supabase CLI
- Create your `.env.local` from `.env.local.example`
- Print next-step instructions in the terminal

### Local Development

**1. Use Node 20** (Next.js 14 is not compatible with Node 22+)
```bash
nvm install 20 && nvm use 20
```

**2. Clone the repository**
```bash
git clone https://github.com/karthikeyams/cma-engagement-platform.git
cd cma-engagement-platform
npm install
```

**3. Fill in environment variables**

Copy `.env.local.example` to `.env.local` and fill in each value:

```bash
cp .env.local.example .env.local
```

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page as above |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page — **never expose this to the browser** |
| `ANTHROPIC_API_KEY` | [Anthropic Console](https://console.anthropic.com/settings/keys) |
| `RESEND_API_KEY` | [Resend Dashboard](https://resend.com/api-keys) |
| `TWILIO_ACCOUNT_SID` | [Twilio Console](https://console.twilio.com) |
| `TWILIO_AUTH_TOKEN` | Same page as above |
| `TWILIO_WHATSAPP_FROM` | Twilio Console → Messaging → Senders (format: `whatsapp:+1415XXXXXXX`) |

**4. Run the database migration**
```bash
npm run db:migrate
```

**5. Seed the database with demo data**
```bash
npm run db:seed
```

**6. Start the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## npm Scripts

```bash
# Development
npm run dev            # Start Next.js dev server (localhost:3000)
npm run build          # Production build (requires Node 20)
npm run lint           # ESLint

# Database
npm run db:migrate     # Apply all migrations  (supabase db push)
npm run db:seed        # Load seed data for demo
npm run db:reset       # Reset database to clean state
npm run db:studio      # Open Supabase Studio UI

# Testing
npm run test:reminder  # Run Event Reminder Agent end-to-end test
```

---

## Project Structure

```
/app
  /dashboard
    /events             Event RSVP dashboard (Session 2)
  /api
    /agents
      /remind           POST — trigger event reminders
      /confirm          POST — handle RSVP confirmations
    /events
      /route.ts         GET — events with RSVP counts
      /[id]/rsvps       GET — RSVPs with member details
      /[id]/messages    GET — agent message log per event
/components             Shared UI components
/lib
  /agents
    base-agent.ts       Abstract base (Anthropic + Supabase)
    event-reminder-agent.ts  sendReminder, sendBulkReminders, processConfirmation
  /supabase
    client.ts           Browser client (anon key, RLS enforced)
    server.ts           Server client (service role, cma schema)
  /types
    index.ts            All TypeScript interfaces and union types
/scripts
  test-reminder-flow.ts End-to-end agent test
/.devcontainer          GitHub Codespaces configuration
/supabase/migrations
  001_initial_schema.sql  All tables in cma schema + RLS + indexes
  002_seed_data.sql       20 members, 4 events, RSVPs, agent messages
```

---

## Supabase Dashboard

[https://supabase.com/dashboard](https://supabase.com/dashboard)

---

## Deployment

This project is deployed on [Vercel](https://vercel.com). Connect your GitHub repo to Vercel and add the environment variables from `.env.local.example` in the Vercel project settings.

---

*Built for Chinmaya Mission Atlanta — Hari Om!*
