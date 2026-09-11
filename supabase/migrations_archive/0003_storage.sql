-- alkatera LCA Verifier — private storage bucket for LCA uploads
--
-- Private bucket, signed-URL access only. No storage.objects policies are
-- created: uploads and signed-URL generation happen exclusively in trusted
-- server code via the service role (which bypasses RLS), so anon and
-- authenticated clients have no direct object access at all.
-- PDF-only and a 20MB cap as defence in depth (also enforced in the
-- upload route, TASK-018/021).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lca-uploads',
  'lca-uploads',
  FALSE,
  20971520,                      -- 20MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;
