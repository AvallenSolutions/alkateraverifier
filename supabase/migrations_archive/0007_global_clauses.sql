-- alkatera LCA Verifier — representative clauses for the global frameworks
-- (TASK-044, FR-011): SBTi, CDP, EU Green Claims Directive.

INSERT INTO standard_clauses (standard_id, clause_ref, title, check_description, severity)
SELECT id, 'C15', 'Scope 3 boundary compatibility',
  'The product footprint uses GHG Protocol-consistent lifecycle boundaries, recognised GWP characterisation factors, and documented data sources, such that it can credibly feed a corporate scope 3 inventory or product-level science-based target.',
  'minor'
FROM standards WHERE code = 'SBTI';

INSERT INTO standard_clauses (standard_id, clause_ref, title, check_description, severity)
SELECT id, '6.5', 'Value chain emissions disclosure readiness',
  'The methodology, emission factor sources and exclusions are documented to a standard compatible with CDP value-chain disclosure: boundaries stated, exclusions justified, and calculation approach reproducible.',
  'minor'
FROM standards WHERE code = 'CDP';

INSERT INTO standard_clauses (standard_id, clause_ref, title, check_description, severity)
SELECT id, 'Art.3', 'Substantiation of explicit environmental claims',
  'Any explicit environmental claim resting on this study must be substantiated by recognised scientific evidence: a life-cycle perspective, significant impacts covered (no cherry-picking), primary/secondary data reliance disclosed, and trade-offs between impacts not concealed.',
  'major'
FROM standards WHERE code = 'EU_GREEN_CLAIMS';

INSERT INTO standard_clauses (standard_id, clause_ref, title, check_description, severity)
SELECT id, 'Art.5', 'Communication of claims within substantiated scope',
  'Claims must be communicated only for what was substantiated: the covered impacts, boundary and units stated alongside the claim, and the verification/review status of the underlying study disclosed rather than implied.',
  'minor'
FROM standards WHERE code = 'EU_GREEN_CLAIMS';
