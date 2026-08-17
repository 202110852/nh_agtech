create index if not exists deposit_transactions_matched_order_id_idx on public.deposit_transactions (matched_order_id);
create index if not exists farm_applications_reviewed_by_idx on public.farm_applications (reviewed_by);
create index if not exists farm_applications_farm_id_idx on public.farm_applications (farm_id);
create index if not exists orders_deposit_confirmed_by_idx on public.orders (deposit_confirmed_by);
create index if not exists notifications_farm_id_idx on public.notifications (farm_id);
create index if not exists notifications_order_id_idx on public.notifications (order_id);
create index if not exists order_items_product_id_idx on public.order_items (product_id);
