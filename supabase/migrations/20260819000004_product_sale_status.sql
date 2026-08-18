alter table public.products
  add column if not exists sale_status text;

update public.products
set sale_status = case when is_active then 'on_sale' else 'hidden' end
where sale_status is null;

alter table public.products
  alter column sale_status set default 'on_sale';

alter table public.products
  alter column sale_status set not null;

alter table public.products drop constraint if exists products_sale_status_check;
alter table public.products add constraint products_sale_status_check
  check (sale_status in ('on_sale', 'coming_soon', 'sold_out', 'hidden'));

create or replace function private.sync_product_sale_status()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.sale_status is null then
      new.sale_status := case when coalesce(new.is_active, true) then 'on_sale' else 'hidden' end;
    end if;
    new.is_active := new.sale_status <> 'hidden';
    return new;
  end if;

  if new.sale_status is distinct from old.sale_status then
    new.is_active := new.sale_status <> 'hidden';
  elsif new.is_active is distinct from old.is_active then
    if not new.is_active then
      new.sale_status := 'hidden';
    elsif old.sale_status = 'hidden' then
      new.sale_status := 'on_sale';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists products_sync_sale_status on public.products;
create trigger products_sync_sale_status
  before insert or update on public.products
  for each row execute function private.sync_product_sale_status();
