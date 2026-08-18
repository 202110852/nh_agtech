alter table public.farms
  add column if not exists address_zonecode text,
  add column if not exists address_detail text;
