# @cyberlisans/db — Legacy (Prisma)

**Status:** Deprecated for runtime. Production uses **Supabase PostgREST** via
`apps/api` repositories (`infrastructure/repositories/*`).

This package remains for:

- Historical Prisma schema reference
- Occasional offline tooling

Do **not** add new product features against Prisma here. Prefer Supabase
migrations under `supabase/migrations/` (or project SQL migrations).

M9 Phase 4 note (2026-07-11): full removal deferred until no CI/scripts depend
on `prisma generate` postinstall.
