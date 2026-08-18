alter table public.products drop constraint if exists products_parcel_weight_kg_check;
alter table public.products add constraint products_parcel_weight_kg_check
  check (parcel_weight_kg in ('3', '5', '10', '20', '30'));
