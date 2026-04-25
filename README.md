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

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/karthikeyamalavalli/cma-engagement-platform)

The Codespace will automatically:
- Install all npm dependencies
- Install the Supabase CLI
- Create your `.env.local` from `.env.local.example`
- Print next-step instructions in the terminal

### Local Development

**1. Clone the repository**
```bash
git clone https://github.com/karthikeyamalavalli/cma-engagement-platform.git
cd cma-engagement-platform
npm install
```

**2. Fill in environment variables**

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

**3. Run the database migration**
```bash
npm run db:migrate
```

**4. Seed the database with demo data**
```bash
npm run db:seed
```

**5. Start the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Commands

```bash
npm run db:migrate   # Apply all migrations (supabase db push)
npm run db:seed      # Load seed data for demo
npm run db:reset     # Reset database to clean state
npm run db:studio    # Open Supabase Studio UI
```

---

## Project Structure

```
/app                    Next.js App Router pages
  /dashboard            Main engagement dashboard
  /api                  API route handlers
/components             Shared UI components
/lib
  /agents               One file per AI agent
  /supabase             Supabase client (browser + server)
  /types                Shared TypeScript interfaces
/scripts                Seed scripts and utilities
/.devcontainer          GitHub Codespaces configuration
/supabase/migrations    SQL migration files
```

---

## Supabase Dashboard

[https://supabase.com/dashboard](https://supabase.com/dashboard)

---

## Deployment

This project is deployed on [Vercel](https://vercel.com). Connect your GitHub repo to Vercel and add the environment variables from `.env.local.example` in the Vercel project settings.

---

*Built for Chinmaya Mission Atlanta — Hari Om!*
