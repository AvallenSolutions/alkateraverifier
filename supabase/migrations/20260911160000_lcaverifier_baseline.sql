-- alkatera verifier: the lcaverifier schema (baseline)
--
-- TARGET: Supabase project alkatera-staging (vwhdyqvlgjqmlzmsvaes), which becomes
-- alkatera production at the v2 cutover. NOT Alkatera2 (dfcezkyaejrxmbwunhry).
-- Run by pasting into the Supabase SQL editor. Do not `supabase db push` it: the
-- migration tracker in that project belongs to the alkatera platform repo.
--
-- Moves the verifier from Alkatera2 to alkatera-staging. Same tables, columns and
-- seed data as Alkatera2, with these deliberate changes (see tasks/review-2026-09-11.md):
--   1. Least-privilege grants. Signed-in users can read only their own rows and
--      edit two profile fields. Every write goes through the server's service role. (S2)
--   2. No user INSERT or DELETE policy on verifications. This closes the hole where a
--      user could insert a fake paid Platinum verification. (S2)
--   3. Badges are readable by their owner only. The public badge page reads through
--      the service role, so nobody can list every badge over the API.
--   4. payments.stripe_session_id is unique, so a Stripe event delivered twice at the
--      same moment cannot record two payments. (S7)
--   5. CHECK constraints on status, tier, result, severity, category and payment status.
--   6. product_name and source_platform are TEXT, so a long product name can no longer
--      make the worker's update fail and silently drop the extraction. (E13)
--
-- No auth trigger. The platform's public.handle_new_user() already runs for every
-- sign-up (one login for both products). Verifier profiles are created lazily by
-- ensureProfile() in src/lib/supabase/profile.ts.
--
-- Idempotent: safe to run twice.

-- Wrong-database guard: public.wiki_pages exists in alkatera-staging only.
do $$ begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'wiki_pages'
  ) then
    raise exception 'WRONG DATABASE: this migration belongs in alkatera-staging (vwhdyqvlgjqmlzmsvaes)';
  end if;
end $$;

create schema if not exists lcaverifier;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- One row per auth user who has used the verifier.
create table if not exists lcaverifier.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email varchar(255) not null,
  display_name varchar(255),
  company_name varchar(255),
  created_at timestamptz not null default now()
);

-- The catalogue of standards the verifier supports.
create table if not exists lcaverifier.standards (
  id uuid primary key default gen_random_uuid(),
  code varchar(50) not null unique,
  name varchar(255) not null,
  category varchar(50) not null check (category in ('iso', 'ghg', 'global')),
  description text,
  is_active boolean not null default true
);

-- Individual checkable requirements within a standard.
create table if not exists lcaverifier.standard_clauses (
  id uuid primary key default gen_random_uuid(),
  standard_id uuid not null references lcaverifier.standards(id) on delete cascade,
  clause_ref varchar(50) not null,
  title varchar(255) not null,
  check_description text not null,
  severity varchar(20) not null default 'major' check (severity in ('major', 'minor')),
  unique (standard_id, clause_ref)
);

-- One row per uploaded LCA run.
create table if not exists lcaverifier.verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references lcaverifier.profiles(id) on delete cascade,
  product_name text,
  source_platform text,
  file_path text not null,
  selected_standard_ids uuid[] not null,
  status varchar(30) not null default 'pending'
    check (status in ('pending', 'extracting', 'evaluating', 'complete', 'failed')),
  extraction jsonb,
  extraction_confidence numeric,
  tier varchar(20)
    check (tier in ('not_certified', 'bronze', 'silver', 'gold', 'platinum')),
  score numeric,
  is_paid boolean not null default false,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  failure_reason text,
  gates jsonb
);

-- One row per evaluated clause.
create table if not exists lcaverifier.findings (
  id uuid primary key default gen_random_uuid(),
  verification_id uuid not null references lcaverifier.verifications(id) on delete cascade,
  standard_id uuid not null references lcaverifier.standards(id),
  clause_ref varchar(50) not null,
  result varchar(20) not null
    check (result in ('conforms', 'minor_gap', 'major_gap', 'insufficient_info')),
  plain_summary text not null,
  reasoning text not null,
  recommendation text,
  created_at timestamptz not null default now()
);

-- Recomputed values cross-checked against the report.
create table if not exists lcaverifier.calculation_checks (
  id uuid primary key default gen_random_uuid(),
  verification_id uuid not null references lcaverifier.verifications(id) on delete cascade,
  check_name varchar(255) not null,
  reported_value numeric,
  recomputed_value numeric,
  unit varchar(50),
  passed boolean not null,
  tolerance_note text
);

-- Public verification badges (paid).
create table if not exists lcaverifier.badges (
  id uuid primary key default gen_random_uuid(),
  verification_id uuid not null unique references lcaverifier.verifications(id) on delete cascade,
  public_slug varchar(64) not null unique,
  tier varchar(20) not null
    check (tier in ('not_certified', 'bronze', 'silver', 'gold', 'platinum')),
  issued_at timestamptz not null default now()
);

-- Stripe payment records.
create table if not exists lcaverifier.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references lcaverifier.profiles(id) on delete cascade,
  verification_id uuid references lcaverifier.verifications(id) on delete set null,
  stripe_session_id varchar(255) not null unique,
  amount_total integer,
  currency varchar(10),
  status varchar(30) not null check (status in ('paid', 'failed', 'refunded')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes (unique constraints above already index code, slug, session id)
-- ---------------------------------------------------------------------------

create index if not exists idx_verifications_user_created
  on lcaverifier.verifications (user_id, created_at desc);
create index if not exists idx_verifications_status
  on lcaverifier.verifications (status);
create index if not exists idx_findings_verification
  on lcaverifier.findings (verification_id);
create index if not exists idx_findings_standard
  on lcaverifier.findings (standard_id);
create index if not exists idx_calculation_checks_verification
  on lcaverifier.calculation_checks (verification_id);
create index if not exists idx_standard_clauses_standard
  on lcaverifier.standard_clauses (standard_id);
create index if not exists idx_payments_user
  on lcaverifier.payments (user_id);
create index if not exists idx_payments_verification
  on lcaverifier.payments (verification_id);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table lcaverifier.profiles enable row level security;
alter table lcaverifier.standards enable row level security;
alter table lcaverifier.standard_clauses enable row level security;
alter table lcaverifier.verifications enable row level security;
alter table lcaverifier.findings enable row level security;
alter table lcaverifier.calculation_checks enable row level security;
alter table lcaverifier.badges enable row level security;
alter table lcaverifier.payments enable row level security;

drop policy if exists profiles_select_own on lcaverifier.profiles;
create policy profiles_select_own on lcaverifier.profiles
  for select to authenticated using (id = (select auth.uid()));

drop policy if exists profiles_update_own on lcaverifier.profiles;
create policy profiles_update_own on lcaverifier.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists standards_public_read on lcaverifier.standards;
create policy standards_public_read on lcaverifier.standards
  for select to anon, authenticated using (true);

drop policy if exists standard_clauses_public_read on lcaverifier.standard_clauses;
create policy standard_clauses_public_read on lcaverifier.standard_clauses
  for select to anon, authenticated using (true);

drop policy if exists verifications_select_own on lcaverifier.verifications;
create policy verifications_select_own on lcaverifier.verifications
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists findings_select_own on lcaverifier.findings;
create policy findings_select_own on lcaverifier.findings
  for select to authenticated using (
    exists (
      select 1 from lcaverifier.verifications v
      where v.id = findings.verification_id and v.user_id = (select auth.uid())
    )
  );

drop policy if exists calculation_checks_select_own on lcaverifier.calculation_checks;
create policy calculation_checks_select_own on lcaverifier.calculation_checks
  for select to authenticated using (
    exists (
      select 1 from lcaverifier.verifications v
      where v.id = calculation_checks.verification_id and v.user_id = (select auth.uid())
    )
  );

drop policy if exists badges_select_own on lcaverifier.badges;
create policy badges_select_own on lcaverifier.badges
  for select to authenticated using (
    exists (
      select 1 from lcaverifier.verifications v
      where v.id = badges.verification_id and v.user_id = (select auth.uid())
    )
  );

drop policy if exists payments_select_own on lcaverifier.payments;
create policy payments_select_own on lcaverifier.payments
  for select to authenticated using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Grants: least privilege. Start from nothing, then add back what the app needs.
-- ---------------------------------------------------------------------------

revoke all on all tables in schema lcaverifier from anon, authenticated;
alter default privileges in schema lcaverifier revoke all on tables from anon, authenticated;

grant usage on schema lcaverifier to anon, authenticated, service_role;
grant all on all tables in schema lcaverifier to service_role;
alter default privileges in schema lcaverifier grant all on tables to service_role;

grant select on lcaverifier.standards, lcaverifier.standard_clauses to anon, authenticated;
grant select on
  lcaverifier.profiles,
  lcaverifier.verifications,
  lcaverifier.findings,
  lcaverifier.calculation_checks,
  lcaverifier.badges,
  lcaverifier.payments
  to authenticated;
grant update (display_name, company_name) on lcaverifier.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Storage: private bucket for uploaded LCA PDFs (20 MB, PDF only). No object
-- policies: only the service role touches it. The bucket already exists in
-- alkatera-staging (copied from Alkatera2 on 1 August 2026); this is a no-op there.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lca-uploads', 'lca-uploads', false, 20971520, array['application/pdf'])
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Seed: the standards catalogue and encoded clauses, copied verbatim from Alkatera2.
-- ---------------------------------------------------------------------------

insert into lcaverifier.standards (code, name, category, description, is_active) values
  ('CDP', 'CDP Climate Disclosure', 'global', 'Disclosure framework; product footprints support corporate climate reporting.', true),
  ('EU_GREEN_CLAIMS', 'EU Green Claims Directive', 'global', 'Substantiation requirements for explicit environmental claims made to EU consumers.', true),
  ('GHG_PROTOCOL', 'GHG Protocol Product Standard', 'ghg', 'Product Life Cycle Accounting and Reporting Standard (WRI/WBCSD).', true),
  ('ISO_14040', 'ISO 14040:2006', 'iso', 'Environmental management — Life cycle assessment — Principles and framework.', true),
  ('ISO_14044', 'ISO 14044:2006', 'iso', 'Environmental management — Life cycle assessment — Requirements and guidelines.', true),
  ('ISO_14046', 'ISO 14046:2014', 'iso', 'Environmental management — Water footprint — Principles, requirements and guidelines.', true),
  ('ISO_14067', 'ISO 14067:2018', 'iso', 'Greenhouse gases — Carbon footprint of products — Requirements and guidelines for quantification.', true),
  ('PAS_2050', 'PAS 2050:2011', 'ghg', 'Specification for the assessment of the life cycle greenhouse gas emissions of goods and services.', true),
  ('SBTI', 'Science Based Targets initiative', 'global', 'Corporate target-setting framework; product LCAs feed scope 3 inventories and product-level targets.', true)
on conflict (code) do nothing;

insert into lcaverifier.standard_clauses (standard_id, clause_ref, title, check_description, severity)
select s.id, v.clause_ref, v.title, v.check_description, v.severity
from (values
  ('CDP', '6.5', 'Value chain emissions disclosure readiness', 'The methodology, emission factor sources and exclusions are documented to a standard compatible with CDP value-chain disclosure: boundaries stated, exclusions justified, and calculation approach reproducible.', 'minor'),
  ('EU_GREEN_CLAIMS', 'Art.3', 'Substantiation of explicit environmental claims', 'Any explicit environmental claim resting on this study must be substantiated by recognised scientific evidence: a life-cycle perspective, significant impacts covered (no cherry-picking), primary/secondary data reliance disclosed, and trade-offs between impacts not concealed.', 'major'),
  ('EU_GREEN_CLAIMS', 'Art.5', 'Communication of claims within substantiated scope', 'Claims must be communicated only for what was substantiated: the covered impacts, boundary and units stated alongside the claim, and the verification/review status of the underlying study disclosed rather than implied.', 'minor'),
  ('ISO_14044', '4.2', 'Goal and scope definition', 'The study explicitly states its goal (intended application, reasons, audience, whether comparative assertions are disclosed to the public) and scope, including the functional unit and system boundary with justified cut-off criteria.', 'major'),
  ('ISO_14044', '4.2.3.6', 'Data quality requirements', 'Data quality requirements are specified and addressed, covering time-related, geographical and technology coverage, precision, completeness, representativeness, consistency, reproducibility, data sources, and uncertainty of the information.', 'major'),
  ('ISO_14044', '4.3.4', 'Allocation', 'Allocation procedures are documented and justified. Wherever possible allocation is avoided through subdivision or system expansion; where unavoidable, the basis (physical relationship or other) is stated and applied consistently.', 'major'),
  ('ISO_14044', '4.4', 'Life cycle impact assessment', 'LCIA methodology, impact categories, category indicators and characterisation models are documented and consistent with the goal and scope; impact category coverage is sufficient for the stated goal.', 'major'),
  ('ISO_14044', '4.5', 'Life cycle interpretation', 'Interpretation identifies significant issues from the LCI and LCIA results and states conclusions, limitations and recommendations consistent with the goal and scope.', 'major'),
  ('ISO_14044', '4.5.3', 'Evaluation: completeness, sensitivity and uncertainty', 'The interpretation includes an evaluation with completeness, sensitivity and consistency checks, and addresses uncertainty in the results (formal uncertainty and sensitivity analysis where conclusions depend on it).', 'minor'),
  ('ISO_14067', '6.4.9.3', 'Biogenic carbon emissions and removals', 'Biogenic carbon emissions and removals are quantified and documented separately from fossil GHG emissions and removals in the carbon footprint result.', 'major'),
  ('SBTI', 'C15', 'Scope 3 boundary compatibility', 'The product footprint uses GHG Protocol-consistent lifecycle boundaries, recognised GWP characterisation factors, and documented data sources, such that it can credibly feed a corporate scope 3 inventory or product-level science-based target.', 'minor')
) as v(code, clause_ref, title, check_description, severity)
join lcaverifier.standards s on s.code = v.code
on conflict (standard_id, clause_ref) do nothing;

-- Tell the API to pick up the new schema (it must also be added to Exposed schemas).
notify pgrst, 'reload schema';
