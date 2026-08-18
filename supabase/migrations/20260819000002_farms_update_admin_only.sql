drop policy if exists farms_update on public.farms;

create policy farms_update_admin on public.farms
  for update using (private.is_admin())
  with check (private.is_admin());
