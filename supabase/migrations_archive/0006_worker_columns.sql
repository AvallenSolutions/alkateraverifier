-- alkatera LCA Verifier — worker support columns (TASK-027/029/030)
-- failure_reason: plain-English retryable reason shown on the result page.
-- gates: FR-006 stage-1 gate results, persisted so a Not Certified result
-- can show exactly which gate failed without re-running the engine.

ALTER TABLE verifications ADD COLUMN failure_reason TEXT;
ALTER TABLE verifications ADD COLUMN gates JSONB;
