-- ANVI migration 00005: leads idempotency + prod hardening
-- - Unique email (partial, case-insensitive via citext) so submitLead duplicate handling (23505) works.
-- - Canonical lead source is 'website_popup'. Legacy 'Website Newsletter' rows remain valid (see CHECK in 00001)
--   but new writes must use 'website_popup'.

-- Dedupe existing duplicate emails (keep earliest) before adding constraint.
with ranked as (
  select id, email,
    row_number() over (partition by email order by created_at asc) as rn
  from public.leads
  where email is not null
)
delete from public.leads l
using ranked r
where l.id = r.id and r.rn > 1;

drop index if exists public.idx_leads_email;
create unique index if not exists uq_leads_email on public.leads(email) where email is not null;
create index if not exists idx_leads_source on public.leads(source);
