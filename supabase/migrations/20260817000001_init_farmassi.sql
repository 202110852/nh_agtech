-- Farmassi core schema, RLS, and auth helpers.
-- security definer functions live in the private schema.

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to postgres, service_role, authenticated, anon;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.random_code(len integer)
returns text
language plpgsql
set search_path = public
as $$
declare
  chars constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
begin
  for i in 1..len loop
    result := result || substr(chars, 1 + (floor(random() * length(chars)))::int, 1);
  end loop;
  return result;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  display_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.farm_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  farm_name text not null,
  owner_name text not null,
  location text,
  product_summary text,
  description text,
  bank_name text not null,
  account_number text not null,
  account_holder text not null,
  phone text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_note text,
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  farm_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.farms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  owner_user_id uuid not null references public.profiles (id),
  location text,
  product_summary text,
  description text,
  bank_name text not null,
  account_number text not null,
  account_holder text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.farm_applications
  add constraint farm_applications_farm_id_fkey
  foreign key (farm_id) references public.farms (id) on delete set null;

create table public.farm_members (
  farm_id uuid not null references public.farms (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  member_role text not null default 'owner' check (member_role in ('owner', 'staff')),
  created_at timestamptz not null default now(),
  primary key (farm_id, user_id)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms (id) on delete cascade,
  name text not null,
  price integer not null check (price >= 0),
  unit text,
  description text,
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.saved_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  recipient_name text not null,
  phone text not null,
  zonecode text,
  address text not null,
  address_detail text,
  is_default boolean not null default false,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique,
  farm_id uuid not null references public.farms (id),
  customer_id uuid not null references public.profiles (id),
  status text not null default 'pending_deposit'
    check (status in ('pending_deposit', 'paid', 'packing', 'shipping', 'completed', 'cancelled')),
  recipient_name text not null,
  recipient_phone text not null,
  zonecode text,
  address text not null,
  address_detail text,
  request_memo text,
  total_amount integer not null check (total_amount >= 0),
  deposit_due_amount integer not null check (deposit_due_amount >= 0),
  deposit_code text not null unique,
  deposit_confirmed_at timestamptz,
  deposit_confirmed_by uuid references public.profiles (id),
  deposit_provider text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  unit text,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_amount integer not null check (line_amount >= 0)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  farm_id uuid references public.farms (id) on delete set null,
  order_id uuid references public.orders (id) on delete set null,
  type text not null check (type in ('order_created', 'deposit_confirmed', 'shipment_requested')),
  title text not null,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  provider text not null default 'kpost',
  status text not null default 'draft'
    check (status in ('draft', 'requested', 'printed', 'cancelled')),
  tracking_number text,
  request_payload jsonb,
  response_payload jsonb,
  requested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.deposit_transactions (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid references public.farms (id) on delete set null,
  provider text not null check (provider in ('manual', 'gnd', 'hecto', 'banksalad', 'codef')),
  occurred_at timestamptz not null default now(),
  amount integer not null,
  depositor_name text,
  raw_payload jsonb,
  matched_order_id uuid references public.orders (id) on delete set null,
  match_status text not null default 'unmatched'
    check (match_status in ('unmatched', 'matched', 'ignored')),
  created_at timestamptz not null default now()
);

create index farm_applications_user_id_idx on public.farm_applications (user_id);
create index farm_applications_status_idx on public.farm_applications (status);
create index farms_owner_user_id_idx on public.farms (owner_user_id);
create index products_farm_id_idx on public.products (farm_id);
create index saved_addresses_user_id_idx on public.saved_addresses (user_id);
create index orders_farm_id_idx on public.orders (farm_id);
create index orders_customer_id_idx on public.orders (customer_id);
create index orders_status_idx on public.orders (status);
create index order_items_order_id_idx on public.order_items (order_id);
create index notifications_user_id_idx on public.notifications (user_id, created_at desc);
create index push_subscriptions_user_id_idx on public.push_subscriptions (user_id);
create index shipments_order_id_idx on public.shipments (order_id);
create index deposit_transactions_farm_id_idx on public.deposit_transactions (farm_id);
create index farm_members_user_id_idx on public.farm_members (user_id);

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

create trigger profiles_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();
create trigger farm_applications_updated_at before update on public.farm_applications
  for each row execute function private.set_updated_at();
create trigger farms_updated_at before update on public.farms
  for each row execute function private.set_updated_at();
create trigger products_updated_at before update on public.products
  for each row execute function private.set_updated_at();
create trigger saved_addresses_updated_at before update on public.saved_addresses
  for each row execute function private.set_updated_at();
create trigger orders_updated_at before update on public.orders
  for each row execute function private.set_updated_at();
create trigger shipments_updated_at before update on public.shipments
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auth profile + field guards
-- ---------------------------------------------------------------------------

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url, role)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'nickname',
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url',
    case
      when coalesce(new.raw_app_meta_data->>'role', '') = 'admin' then 'admin'
      else 'customer'
    end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create or replace function private.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    new.role := old.role;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function private.protect_profile_role();

create or replace function private.protect_farm_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce((select role from public.profiles where id = auth.uid()), '') <> 'admin'
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    new.owner_user_id := old.owner_user_id;
    new.slug := old.slug;
    new.is_active := old.is_active;
  end if;
  return new;
end;
$$;

create trigger farms_protect_fields
  before update on public.farms
  for each row execute function private.protect_farm_fields();

create or replace function private.saved_addresses_one_default()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_default then
    update public.saved_addresses
       set is_default = false
     where user_id = new.user_id
       and id is distinct from new.id
       and is_default = true;
  end if;
  return new;
end;
$$;

create trigger saved_addresses_default
  before insert or update on public.saved_addresses
  for each row execute function private.saved_addresses_one_default();

-- ---------------------------------------------------------------------------
-- Role helpers (security definer, private schema)
-- ---------------------------------------------------------------------------

create or replace function private.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

create or replace function private.is_farm_member(_farm_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.farm_members
    where farm_id = _farm_id and user_id = auth.uid()
  );
$$;

create or replace function private.owned_farm_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select farm_id from public.farm_members where user_id = auth.uid();
$$;

revoke all on function private.handle_new_user() from public;
revoke all on function private.protect_profile_role() from public;
revoke all on function private.protect_farm_fields() from public;
revoke all on function private.saved_addresses_one_default() from public;
revoke all on function private.set_updated_at() from public;
revoke all on function private.random_code(integer) from public;

grant execute on function private.current_user_role() to authenticated, anon, service_role;
grant execute on function private.is_admin() to authenticated, anon, service_role;
grant execute on function private.is_farm_member(uuid) to authenticated, anon, service_role;
grant execute on function private.owned_farm_ids() to authenticated, anon, service_role;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.farm_applications enable row level security;
alter table public.farms enable row level security;
alter table public.farm_members enable row level security;
alter table public.products enable row level security;
alter table public.saved_addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.notifications enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.shipments enable row level security;
alter table public.deposit_transactions enable row level security;

-- profiles
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or private.is_admin());
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_all on public.profiles
  for all using (private.is_admin()) with check (private.is_admin());

-- farm applications
create policy farm_applications_select on public.farm_applications
  for select using (user_id = auth.uid() or private.is_admin());
create policy farm_applications_insert on public.farm_applications
  for insert with check (user_id = auth.uid());
create policy farm_applications_update_admin on public.farm_applications
  for update using (private.is_admin()) with check (private.is_admin());

-- farms
create policy farms_select on public.farms
  for select using (
    is_active = true
    or private.is_admin()
    or private.is_farm_member(id)
  );
create policy farms_insert_admin on public.farms
  for insert with check (private.is_admin());
create policy farms_update on public.farms
  for update using (private.is_admin() or private.is_farm_member(id))
  with check (private.is_admin() or private.is_farm_member(id));
create policy farms_delete_admin on public.farms
  for delete using (private.is_admin());

-- farm members
create policy farm_members_select on public.farm_members
  for select using (user_id = auth.uid() or private.is_admin() or private.is_farm_member(farm_id));
create policy farm_members_admin_write on public.farm_members
  for all using (private.is_admin()) with check (private.is_admin());

-- products
create policy products_select on public.products
  for select using (
    (is_active = true and exists (select 1 from public.farms f where f.id = farm_id and f.is_active = true))
    or private.is_admin()
    or private.is_farm_member(farm_id)
  );
create policy products_admin_write on public.products
  for all using (private.is_admin()) with check (private.is_admin());

-- saved addresses
create policy saved_addresses_own on public.saved_addresses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- orders (writes go through edge functions / service role except status updates)
create policy orders_select on public.orders
  for select using (
    customer_id = auth.uid()
    or private.is_admin()
    or private.is_farm_member(farm_id)
  );
create policy orders_update_ops on public.orders
  for update using (private.is_admin() or private.is_farm_member(farm_id))
  with check (private.is_admin() or private.is_farm_member(farm_id));

create policy order_items_select on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (
          o.customer_id = auth.uid()
          or private.is_admin()
          or private.is_farm_member(o.farm_id)
        )
    )
  );

-- notifications
create policy notifications_select_own on public.notifications
  for select using (user_id = auth.uid() or private.is_admin());
create policy notifications_update_own on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- push
create policy push_subscriptions_own on public.push_subscriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- shipments
create policy shipments_select on public.shipments
  for select using (
    private.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_id and private.is_farm_member(o.farm_id)
    )
  );
create policy shipments_admin_write on public.shipments
  for all using (private.is_admin()) with check (private.is_admin());

-- deposit ledger
create policy deposit_transactions_select on public.deposit_transactions
  for select using (
    private.is_admin()
    or (farm_id is not null and private.is_farm_member(farm_id))
  );

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------

alter table public.notifications replica identity full;
alter publication supabase_realtime add table public.notifications;
