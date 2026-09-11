-- alkatera LCA Verifier — Row Level Security (PRD § Security)
-- The service role bypasses RLS and is confined to trusted server code.
-- Users can never write status/tier/score/is_paid: there is deliberately
-- no UPDATE policy on verifications for authenticated users.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE standard_clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculation_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- profiles: users see and edit only their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- standards catalogue: publicly readable, writable only by service role
CREATE POLICY "standards_public_read" ON standards
  FOR SELECT USING (true);
CREATE POLICY "standard_clauses_public_read" ON standard_clauses
  FOR SELECT USING (true);

-- verifications: owners read, create, and delete their own runs
CREATE POLICY "verifications_select_own" ON verifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "verifications_insert_own" ON verifications
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "verifications_delete_own" ON verifications
  FOR DELETE USING (user_id = auth.uid());

-- findings: readable through the owning verification
CREATE POLICY "findings_select_own" ON findings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM verifications v
      WHERE v.id = findings.verification_id AND v.user_id = auth.uid()
    )
  );

-- calculation_checks: readable through the owning verification
CREATE POLICY "calculation_checks_select_own" ON calculation_checks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM verifications v
      WHERE v.id = calculation_checks.verification_id AND v.user_id = auth.uid()
    )
  );

-- badges: public verification artefacts (tier, slug, issue date only —
-- no private data). Looked up publicly by unguessable slug.
CREATE POLICY "badges_public_read" ON badges
  FOR SELECT USING (true);

-- payments: owners read their own payment history
CREATE POLICY "payments_select_own" ON payments
  FOR SELECT USING (user_id = auth.uid());
