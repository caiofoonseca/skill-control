create table if not exists public.contract_emissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  signer_key text not null check (signer_key in ('student', 'primary', 'secondary')),
  signer_name text not null,
  emitted_by_email text
);

create index if not exists contract_emissions_student_id_idx
  on public.contract_emissions(student_id);

alter table public.contract_emissions enable row level security;

drop policy if exists "authenticated users can read contract emissions" on public.contract_emissions;
create policy "authenticated users can read contract emissions"
  on public.contract_emissions for select to authenticated
  using (true);

drop policy if exists "secretary and master can insert contract emissions" on public.contract_emissions;
create policy "secretary and master can insert contract emissions"
  on public.contract_emissions for insert to authenticated
  with check (public.can_write_records());
