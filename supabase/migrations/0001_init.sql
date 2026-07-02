-- alkatera LCA Verifier — initial schema (PRD § Data Model)

-- profiles (mirrors Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  company_name VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- standards (encoded catalogue of standards the verifier supports)
CREATE TABLE standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,      -- e.g. 'ISO_14044', 'ISO_14067'
  name VARCHAR(255) NOT NULL,            -- e.g. 'ISO 14044:2006'
  category VARCHAR(50) NOT NULL,         -- 'iso' | 'ghg' | 'global'
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- standard_clauses (individual checkable requirements within a standard)
CREATE TABLE standard_clauses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_id UUID NOT NULL REFERENCES standards(id) ON DELETE CASCADE,
  clause_ref VARCHAR(50) NOT NULL,       -- e.g. '4.2.3.6'
  title VARCHAR(255) NOT NULL,           -- e.g. 'Data quality requirements'
  check_description TEXT NOT NULL,       -- what a conforming study must show
  severity VARCHAR(20) NOT NULL DEFAULT 'major',  -- 'major' | 'minor'
  UNIQUE (standard_id, clause_ref)
);

-- verifications (one per uploaded LCA run)
CREATE TABLE verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_name VARCHAR(255),             -- extracted from LCA
  source_platform VARCHAR(255),          -- e.g. 'alkatera', 'unknown'
  file_path TEXT NOT NULL,               -- Supabase Storage path
  selected_standard_ids UUID[] NOT NULL, -- standards chosen by user
  status VARCHAR(30) NOT NULL DEFAULT 'pending', -- pending|extracting|evaluating|complete|failed
  extraction JSONB,                      -- structured LCA data
  extraction_confidence NUMERIC,         -- 0..1
  tier VARCHAR(20),                      -- 'not_certified'|'bronze'|'silver'|'gold'|'platinum'|null
  score NUMERIC,                         -- 0..100
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- findings (one per evaluated clause for a verification)
CREATE TABLE findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES verifications(id) ON DELETE CASCADE,
  standard_id UUID NOT NULL REFERENCES standards(id),
  clause_ref VARCHAR(50) NOT NULL,
  result VARCHAR(20) NOT NULL,           -- 'conforms'|'minor_gap'|'major_gap'|'insufficient_info'
  plain_summary TEXT NOT NULL,           -- plain-English finding
  reasoning TEXT NOT NULL,               -- cited justification
  recommendation TEXT,                   -- how to fix, if not conforming
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- calculation_checks (recomputed values cross-checked against the report)
CREATE TABLE calculation_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES verifications(id) ON DELETE CASCADE,
  check_name VARCHAR(255) NOT NULL,      -- e.g. 'GHG total reconciliation'
  reported_value NUMERIC,
  recomputed_value NUMERIC,
  unit VARCHAR(50),
  passed BOOLEAN NOT NULL,
  tolerance_note TEXT
);

-- badges (public verification artefacts, paid tier)
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL UNIQUE REFERENCES verifications(id) ON DELETE CASCADE,
  public_slug VARCHAR(64) NOT NULL UNIQUE,
  tier VARCHAR(20) NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- payments (Stripe records)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verification_id UUID REFERENCES verifications(id) ON DELETE SET NULL,
  stripe_session_id VARCHAR(255) NOT NULL,
  amount_total INTEGER,                  -- minor units
  currency VARCHAR(10),
  status VARCHAR(30) NOT NULL,           -- 'paid'|'failed'|'refunded'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes (PRD § Indexes). badges.public_slug and standards.code are
-- already covered by their UNIQUE constraints.
CREATE INDEX idx_verifications_user_created
  ON verifications (user_id, created_at DESC);   -- dashboard history
CREATE INDEX idx_verifications_status
  ON verifications (status);                     -- worker picks up pending jobs
CREATE INDEX idx_findings_verification
  ON findings (verification_id);                 -- render a result's findings
CREATE INDEX idx_calculation_checks_verification
  ON calculation_checks (verification_id);       -- render calculation checks
CREATE INDEX idx_standard_clauses_standard
  ON standard_clauses (standard_id);             -- load clauses for standards
CREATE INDEX idx_payments_stripe_session
  ON payments (stripe_session_id);               -- webhook reconciliation
