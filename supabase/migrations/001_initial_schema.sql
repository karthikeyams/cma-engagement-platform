-- ============================================================
-- CMA Member Engagement Platform — Initial Schema
-- Migration: 001_initial_schema.sql
-- ============================================================

-- ─── TABLES ─────────────────────────────────────────────────

CREATE TABLE members (
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

CREATE TABLE events (
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

CREATE TABLE rsvps (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     uuid        REFERENCES members(id) ON DELETE CASCADE,
  event_id      uuid        REFERENCES events(id)  ON DELETE CASCADE,
  status        text        DEFAULT 'registered',
  registered_at timestamptz DEFAULT now(),
  confirmed_at  timestamptz,
  updated_at    timestamptz DEFAULT now(),
  UNIQUE(member_id, event_id)
);

CREATE TABLE feedback (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id        uuid        REFERENCES members(id) ON DELETE CASCADE,
  event_id         uuid        REFERENCES events(id)  ON DELETE CASCADE,
  rating           integer     CHECK (rating >= 1 AND rating <= 5),
  highlights       text,
  suggestions      text,
  would_recommend  boolean,
  submitted_at     timestamptz DEFAULT now(),
  UNIQUE(member_id, event_id)
);

CREATE TABLE agent_messages (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type   text        NOT NULL,
  member_id    uuid        REFERENCES members(id) ON DELETE CASCADE,
  event_id     uuid        REFERENCES events(id)  ON DELETE SET NULL,
  channel      text        NOT NULL,
  direction    text        NOT NULL,
  subject      text,
  content      text        NOT NULL,
  status       text        DEFAULT 'pending',
  sent_at      timestamptz,
  responded_at timestamptz,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE seva_opportunities (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text        NOT NULL,
  description   text,
  event_id      uuid        REFERENCES events(id) ON DELETE SET NULL,
  skills_needed text[],
  slots         integer     DEFAULT 1,
  filled_slots  integer     DEFAULT 0,
  status        text        DEFAULT 'open',
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE seva_commitments (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id      uuid        REFERENCES members(id)           ON DELETE CASCADE,
  opportunity_id uuid        REFERENCES seva_opportunities(id) ON DELETE CASCADE,
  status         text        DEFAULT 'invited',
  confirmed_at   timestamptz,
  created_at     timestamptz DEFAULT now(),
  UNIQUE(member_id, opportunity_id)
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────

ALTER TABLE members           ENABLE ROW LEVEL SECURITY;
ALTER TABLE events            ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps             ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback          ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_messages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE seva_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE seva_commitments  ENABLE ROW LEVEL SECURITY;

-- ─── SERVICE ROLE POLICIES (full access for agents) ──────────

CREATE POLICY "service_role_members_all"
  ON members FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_events_all"
  ON events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_rsvps_all"
  ON rsvps FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_feedback_all"
  ON feedback FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_agent_messages_all"
  ON agent_messages FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_seva_opportunities_all"
  ON seva_opportunities FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_seva_commitments_all"
  ON seva_commitments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─── INDEXES ─────────────────────────────────────────────────

CREATE INDEX idx_members_tier             ON members(tier);
CREATE INDEX idx_members_engagement_score ON members(engagement_score);
CREATE INDEX idx_rsvps_event_id           ON rsvps(event_id);
CREATE INDEX idx_rsvps_member_id          ON rsvps(member_id);
CREATE INDEX idx_agent_messages_member_id ON agent_messages(member_id);
CREATE INDEX idx_agent_messages_agent_type ON agent_messages(agent_type);
