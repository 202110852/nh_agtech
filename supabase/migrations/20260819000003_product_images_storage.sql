insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function private.can_write_product_image(_name text)
returns boolean
language sql
stable
security definer
set search_path = public, storage
as $$
  select
    private.is_admin()
    or (
      (storage.foldername(_name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      and private.is_farm_member(((storage.foldername(_name))[1])::uuid)
    );
$$;

revoke all on function private.can_write_product_image(text) from public;
grant execute on function private.can_write_product_image(text) to authenticated, service_role;

drop policy if exists product_images_insert on storage.objects;
drop policy if exists product_images_update on storage.objects;
drop policy if exists product_images_delete on storage.objects;

create policy product_images_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and private.can_write_product_image(name)
);

create policy product_images_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-images'
  and private.can_write_product_image(name)
)
with check (
  bucket_id = 'product-images'
  and private.can_write_product_image(name)
);

create policy product_images_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-images'
  and private.can_write_product_image(name)
);
