alter table public.products
  add column if not exists parcel_weight_kg text not null default '5',
  add column if not exists parcel_volume_cm text not null default '80',
  add column if not exists parcel_content_code text not null default '농/수/축산물(일반)',
  add column if not exists parcel_delivery_type text not null default '';

alter table public.products drop constraint if exists products_parcel_weight_kg_check;
alter table public.products add constraint products_parcel_weight_kg_check
  check (parcel_weight_kg in ('5', '10', '20', '30'));

alter table public.products drop constraint if exists products_parcel_volume_cm_check;
alter table public.products add constraint products_parcel_volume_cm_check
  check (parcel_volume_cm in ('80', '100', '120', '160'));

alter table public.products drop constraint if exists products_parcel_delivery_type_check;
alter table public.products add constraint products_parcel_delivery_type_check
  check (parcel_delivery_type in ('', '대면', '비대면'));

drop policy if exists products_admin_write on public.products;
drop policy if exists products_write on public.products;
create policy products_write on public.products
  for all
  using (private.is_admin() or private.is_farm_member(farm_id))
  with check (private.is_admin() or private.is_farm_member(farm_id));
