alter table public.farms
  add column if not exists phone text,
  add column if not exists mobile_phone text,
  add column if not exists address text,
  add column if not exists map_url text;
