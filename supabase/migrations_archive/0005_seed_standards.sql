-- alkatera LCA Verifier — seed the standards catalogue (TASK-010)

INSERT INTO standards (code, name, category, description) VALUES
  ('ISO_14040', 'ISO 14040:2006', 'iso',
   'Environmental management — Life cycle assessment — Principles and framework.'),
  ('ISO_14044', 'ISO 14044:2006', 'iso',
   'Environmental management — Life cycle assessment — Requirements and guidelines.'),
  ('ISO_14067', 'ISO 14067:2018', 'iso',
   'Greenhouse gases — Carbon footprint of products — Requirements and guidelines for quantification.'),
  ('ISO_14046', 'ISO 14046:2014', 'iso',
   'Environmental management — Water footprint — Principles, requirements and guidelines.'),
  ('GHG_PROTOCOL', 'GHG Protocol Product Standard', 'ghg',
   'Product Life Cycle Accounting and Reporting Standard (WRI/WBCSD).'),
  ('PAS_2050', 'PAS 2050:2011', 'ghg',
   'Specification for the assessment of the life cycle greenhouse gas emissions of goods and services.'),
  ('SBTI', 'Science Based Targets initiative', 'global',
   'Corporate target-setting framework; product LCAs feed scope 3 inventories and product-level targets.'),
  ('CDP', 'CDP Climate Disclosure', 'global',
   'Disclosure framework; product footprints support corporate climate reporting.'),
  ('EU_GREEN_CLAIMS', 'EU Green Claims Directive', 'global',
   'Substantiation requirements for explicit environmental claims made to EU consumers.');

-- First pass of encoded clauses: ISO 14044 core requirements.
INSERT INTO standard_clauses (standard_id, clause_ref, title, check_description, severity)
SELECT id, '4.2', 'Goal and scope definition',
  'The study explicitly states its goal (intended application, reasons, audience, whether comparative assertions are disclosed to the public) and scope, including the functional unit and system boundary with justified cut-off criteria.',
  'major'
FROM standards WHERE code = 'ISO_14044';

INSERT INTO standard_clauses (standard_id, clause_ref, title, check_description, severity)
SELECT id, '4.2.3.6', 'Data quality requirements',
  'Data quality requirements are specified and addressed, covering time-related, geographical and technology coverage, precision, completeness, representativeness, consistency, reproducibility, data sources, and uncertainty of the information.',
  'major'
FROM standards WHERE code = 'ISO_14044';

INSERT INTO standard_clauses (standard_id, clause_ref, title, check_description, severity)
SELECT id, '4.3.4', 'Allocation',
  'Allocation procedures are documented and justified. Wherever possible allocation is avoided through subdivision or system expansion; where unavoidable, the basis (physical relationship or other) is stated and applied consistently.',
  'major'
FROM standards WHERE code = 'ISO_14044';

INSERT INTO standard_clauses (standard_id, clause_ref, title, check_description, severity)
SELECT id, '4.4', 'Life cycle impact assessment',
  'LCIA methodology, impact categories, category indicators and characterisation models are documented and consistent with the goal and scope; impact category coverage is sufficient for the stated goal.',
  'major'
FROM standards WHERE code = 'ISO_14044';

INSERT INTO standard_clauses (standard_id, clause_ref, title, check_description, severity)
SELECT id, '4.5', 'Life cycle interpretation',
  'Interpretation identifies significant issues from the LCI and LCIA results and states conclusions, limitations and recommendations consistent with the goal and scope.',
  'major'
FROM standards WHERE code = 'ISO_14044';

INSERT INTO standard_clauses (standard_id, clause_ref, title, check_description, severity)
SELECT id, '4.5.3', 'Evaluation: completeness, sensitivity and uncertainty',
  'The interpretation includes an evaluation with completeness, sensitivity and consistency checks, and addresses uncertainty in the results (formal uncertainty and sensitivity analysis where conclusions depend on it).',
  'minor'
FROM standards WHERE code = 'ISO_14044';

-- ISO 14067: biogenic carbon.
INSERT INTO standard_clauses (standard_id, clause_ref, title, check_description, severity)
SELECT id, '6.4.9.3', 'Biogenic carbon emissions and removals',
  'Biogenic carbon emissions and removals are quantified and documented separately from fossil GHG emissions and removals in the carbon footprint result.',
  'major'
FROM standards WHERE code = 'ISO_14067';
