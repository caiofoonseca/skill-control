drop policy if exists "secretary and master can update contract emissions" on public.contract_emissions;
create policy "secretary and master can update contract emissions"
  on public.contract_emissions for update to authenticated
  using (public.can_write_records())
  with check (public.can_write_records());

drop policy if exists "master can delete contract emissions" on public.contract_emissions;
create policy "master can delete contract emissions"
  on public.contract_emissions for delete to authenticated
  using (public.can_delete_records());
