-- ============================================================
-- CMA Member Engagement Platform — Initial Schema
-- Migration: 001_initial_schema.sql
-- All tables live in the "cma" schema to isolate from existing
-- tables in the shared database.
-- ============================================================

-- ─── SCHEMA ──────────────────────────────────────────────────

CREATE SCHEMA IF NOT EXISTS cma;

-- ─── TABLES ──────────────────────────────────────────────────

CREATE TABLE cma.members (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text        NOT NULL,
  email             text        UNIQUE NOT NULL,
  phone             text,
  interests         text[],
  preferred_channel text        DEFAULT 'email',
  engagement_score  integer     DEFAULT 50,
  tier              text        DEFAULT 'passive',
  joined_at         timestamptz DEFAULT now(),
  last_active_at    timestamptz DEFAULT now(),
  created_at        timestamptz DEFAULT now()
);

CREATE TABLE cma.events (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text        NOT NULL,
  description text,
  event_date  timestamptz NOT NULL,
  location    text,
  type        text,
  capacity    integer,
  status      text        DEFAULT 'upcoming',
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE cma.rsvps (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     uuid        REFERENCES cma.members(id) ON DELETE CASCADE,
  event_id      uuid        REFERENCES cma.events(id)  ON DELETE CASCADE,
  status        text        DEFAULT 'registered',
  registered_at timestamptz DEFAULT now(),
  confirmed_at  timestamptz,
  updated_at    timestamptz DEFAULT now(),
  UNIQUE(member_id, event_id)
);

CREATE TABLE cma.feedback (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id        uuid        REFERENCES cma.members(id) ON DELETE CASCADE,
  event_id         uuid        REFERENCES cma.events(id)  ON DELETE CASCADE,
  rating           integer     CHECK (rating >= 1 AND rating <= 5),
  highlights       text,
  suggestions      text,
  would_recommend  boolean,
  submitted_at     timestamptz DEFAULT now(),
  UNIQUE(member_id, event_id)
);

CREATE TABLE cma.agent_messages (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type   text        NOT NULL,
  member_id    uuid        REFERENCES cma.members(id) ON DELETE CASCADE,
  event_id     uuid        REFERENCES cma.events(id)  ON DELETE SET NULL,
  channel      text        NOT NULL,
  direction    text        NOT NULL,
  subject      text,
  content      text        NOT NULL,
  status       text        DEFAULT 'pending',
  sent_at      timestamptz,
  responded_at timestamptz,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE cma.seva_opportunities (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text        NOT NULL,
  description   text,
  event_id      uuid        REFERENCES cma.events(id) ON DELETE SET NULL,
  skills_needed text[],
  slots         integer     DEFAULT 1,
  filled_slots  integer     DEFAULT 0,
  status        text        DEFAULT 'open',
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE cma.seva_commitments (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id      uuid        REFERENCES cma.members(id)                ON DELETE CASCADE,
  opportunity_id uuid        REFERENCES cma.seva_opportunities(id)     ON DELETE CASCADE,
  status         text        DEFAULT 'invited',
  confirmed_at   timestamptz,
  created_at     timestamptz DEFAULT now(),
  UNIQUE(member_id, opportunity_id)
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────

ALTER TABLE cma.members            ENABLE ROW LEVEL SECURITY;
ALTER TABLE cma.events             ENABLE ROW LEVEL SECURITY;
ALTER TABLE cma.rsvps              ENABLE ROW LEVEL SECURITY;
ALTER TABLE cma.feedback           ENABLE ROW LEVEL SECURITY;
ALTER TABLE cma.agent_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE cma.seva_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE cma.seva_commitments   ENABLE ROW LEVEL SECURITY;

-- ─── SERVICE ROLE POLICIES (full access for agents) ──────────

CREATE POLICY "service_role_members_all"
  ON cma.members FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_events_all"
  ON cma.events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_rsvps_all"
  ON cma.rsvps FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_feedback_all"
  ON cma.feedback FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_agent_messages_all"
  ON cma.agent_messages FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_seva_opportunities_all"
  ON cma.seva_opportunities FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_seva_commitments_all"
  ON cma.seva_commitments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─── GRANT SCHEMA USAGE TO ROLES ─────────────────────────────
-- Required so PostgREST (Supabase API) can access the cma schema

GRANT USAGE ON SCHEMA cma TO anon, authenticated, service_role;
GRANT ALL   ON ALL TABLES    IN SCHEMA cma TO service_role;
GRANT ALL   ON ALL SEQUENCES IN SCHEMA cma TO service_role;

-- ─── INDEXES ─────────────────────────────────────────────────

CREATE INDEX idx_members_tier              ON cma.members(tier);
CREATE INDEX idx_members_engagement_score  ON cma.members(engagement_score);
CREATE INDEX idx_rsvps_event_id            ON cma.rsvps(event_id);
CREATE INDEX idx_rsvps_member_id           ON cma.rsvps(member_id);
CREATE INDEX idx_agent_messages_member_id  ON cma.agent_messages(member_id);
CREATE INDEX idx_agent_messages_agent_type ON cma.agent_messages(agent_type);
