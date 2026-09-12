-- ANVI migration 00006: close privilege-escalation via self-service role change.
-- Problem: policy "own profile update" lets any authenticated user update any column
--   on their own row, including app_role. Because is_admin() trusts profiles.app_role,
--   a customer could run:  update profiles set app_role='admin' where id = auth.uid();
--   and instantly gain full admin RLS access.
-- Fix: a BEFORE UPDATE trigger that preserves app_role unless the actor is a real admin
--   or the service role. Legitimate role changes still go through public.set_user_role()
--   (admin/service only). Self-updates of name/phone/avatar are unaffected.

create or replace function public.protect_profile_role()
returns trigger language plpgsql as $$
begin
  -- Only guard end-user (authenticated) writes; service_role provisioning and
  -- existing admins (is_admin()) may still change roles directly.
  if new.app_role is distinct from old.app_role
     and coalesce(auth.role(), '') = 'authenticated'
     and not public.is_admin() then
    -- Silently preserve the stored role; the rest of the update still applies.
    new.app_role := old.app_role;
  end if;
  return new;
end $$;

drop trigger if exists trg_protect_profile_role on public.profiles;
create trigger trg_protect_profile_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();
