# Archived migrations

These seven files built the verifier in its first, standalone Supabase project
(`goriowvxkvmizwtenpju`, now deleted). They target the `public` schema.

**Never run them.** `0004_profile_trigger.sql` replaces `public.handle_new_user()`,
which in the shared alkatera project is the platform's own sign-up trigger.

The live schema is `supabase/migrations/20260911160000_lcaverifier_baseline.sql`.
