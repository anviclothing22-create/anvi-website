-- ANVI migration 00007: lock down public.set_user_role() privilege escalation.
-- Problem: set_user_role() was created SECURITY DEFINER with no REVOKE/GRANT, so
--   Postgres left EXECUTE open to PUBLIC (anon + authenticated). Any logged-in user
--   could call:  select public.set_user_role(auth.uid(),'admin');
--   The function writes auth.users.raw_app_meta_data.app_role, which the 00006
--   profiles trigger does NOT guard, and is_admin() trusts the JWT app_metadata,
--   granting full admin RLS on the next token refresh.
-- Fix: restrict EXECUTE to service_role and add a defence-in-depth internal guard so
--   even a mis-granted caller must already be an admin or the service role.

create or replace function public.set_user_role(target_user uuid, new_role text)
returns void language plpgsql security definer set search_path = public as $$
begin
  -- Defence in depth: only the service role or an existing admin may change roles.
  if coalesce(auth.role(),'') <> 'service_role' and not public.is_admin() then
    raise exception 'forbidden: admin or service_role only';
  end if;
  if new_role not in ('customer','support','admin') then raise exception 'bad role'; end if;
  update public.profiles set app_role=new_role, updated_at=now() where id=target_user;
  update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb) || jsonb_build_object('app_role', new_role) where id=target_user;
end $$;

revoke all on function public.set_user_role(uuid, text) from public, anon, authenticated;
grant execute on function public.set_user_role(uuid, text) to service_role;
