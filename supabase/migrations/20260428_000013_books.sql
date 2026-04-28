create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  name text not null unique,
  active boolean not null default true
);

create index if not exists books_name_idx on public.books(name);

drop trigger if exists set_books_updated_at on public.books;
create trigger set_books_updated_at
before update on public.books
for each row
execute function public.set_updated_at();

alter table public.books enable row level security;

create policy "authenticated users can read books"
on public.books
for select
to authenticated
using (true);

create policy "authenticated users can insert books"
on public.books
for insert
to authenticated
with check (true);

create policy "authenticated users can update books"
on public.books
for update
to authenticated
using (true)
with check (true);

create policy "authenticated users can delete books"
on public.books
for delete
to authenticated
using (true);
