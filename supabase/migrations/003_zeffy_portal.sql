CREATE TABLE cma.portal_registrations (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text        NOT NULL,
  email                 text        UNIQUE NOT NULL,
  membership_type       text        NOT NULL,
  status                text        NOT NULL DEFAULT 'Pending',
  payment_confirmed_at  timestamptz,
  transaction_id        text,
  created_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE cma.portal_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_portal_registrations_all"
  ON cma.portal_registrations FOR ALL TO service_role
  USING (true) WITH CHECK (true);

GRANT ALL ON cma.portal_registrations TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA cma TO service_role;

CREATE INDEX idx_portal_registrations_email ON cma.portal_registrations(email);
CREATE INDEX idx_portal_registrations_status ON cma.portal_registrations(status);
