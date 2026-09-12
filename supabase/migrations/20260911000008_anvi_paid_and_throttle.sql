-- ANVI migration 00008: server-authoritative "paid" state + lead spam throttle.
--
-- 1) payment_confirmations: written ONLY by the verify-razorpay-payment Edge Function
--    using service_role. The table has NO anon/authenticated policies, so clients can
--    neither read nor forge a confirmation. attach_verified_payment() consumes a fresh
--    confirmation exactly once and flips the owner's order to payment_status='paid',
--    so "paid" is set server-side from a verified signature — never by hand or by client.
-- 2) throttle_leads(): BEFORE INSERT trigger capping repeat lead submissions per
--    email/phone within a rolling hour (anon form spam control).

create table if not exists public.payment_confirmations (
  razorpay_order_id text primary key,
  razorpay_payment_id text not null,
  signature text not null,
  profile_id uuid,
  consumed boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.payment_confirmations enable row level security;
-- Intentionally NO policies for anon/authenticated: only service_role (RLS-bypassing)
-- and the security-definer RPC below may read/write this table.

create or replace function public.attach_verified_payment(
  p_order_id uuid,
  p_razorpay_order_id text,
  p_razorpay_payment_id text
) returns boolean language plpgsql security definer set search_path = public as $$
declare v_owner uuid; v_rows int;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select profile_id into v_owner from public.orders where id = p_order_id for update;
  if not found or v_owner <> auth.uid() then raise exception 'Order not found'; end if;

  -- Consume a fresh, unused confirmation written by the verify Edge Function.
  update public.payment_confirmations
     set consumed = true
   where razorpay_order_id = p_razorpay_order_id
     and razorpay_payment_id = p_razorpay_payment_id
     and consumed = false
     and created_at > now() - interval '30 minutes';
  get diagnostics v_rows = row_count;
  if v_rows = 0 then return false; end if;

  update public.orders
     set payment_status = 'paid', updated_at = now()
   where id = p_order_id and payment_status <> 'paid';

  insert into public.order_timeline (order_id, title, description, to_status, is_completed, event_at)
  values (p_order_id, 'Payment confirmed',
          'Razorpay signature verified server-side · '||p_razorpay_payment_id,
          'in_studio_preparation', true, now());
  return true;
end $$;
revoke all on function public.attach_verified_payment(uuid, text, text) from public, anon;
grant execute on function public.attach_verified_payment(uuid, text, text) to authenticated, service_role;

-- ---------- lead spam throttle ----------
create or replace function public.throttle_leads()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.leads
       where created_at > now() - interval '1 hour'
         and ( (new.email is not null and email = new.email)
            or phone = new.phone ) ) >= 5 then
    raise exception 'Too many submissions. Please try again later.';
  end if;
  return new;
end $$;
drop trigger if exists trg_throttle_leads on public.leads;
create trigger trg_throttle_leads
  before insert on public.leads
  for each row execute function public.throttle_leads();
