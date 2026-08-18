alter table public.farms
  add column if not exists landing_blocks jsonb not null default '[]'::jsonb;

alter table public.farms
  drop constraint if exists farms_landing_blocks_is_array;

alter table public.farms
  add constraint farms_landing_blocks_is_array
  check (jsonb_typeof(landing_blocks) = 'array');
