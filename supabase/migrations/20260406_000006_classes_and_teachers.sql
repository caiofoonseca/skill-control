create table if not exists public.course_classes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  name text not null unique,
  active boolean not null default true
);

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  name text not null unique,
  active boolean not null default true
);

create index if not exists course_classes_name_idx on public.course_classes(name);
create index if not exists teachers_name_idx on public.teachers(name);

drop trigger if exists set_course_classes_updated_at on public.course_classes;
create trigger set_course_classes_updated_at
before update on public.course_classes
for each row
execute function public.set_updated_at();

drop trigger if exists set_teachers_updated_at on public.teachers;
create trigger set_teachers_updated_at
before update on public.teachers
for each row
execute function public.set_updated_at();

alter table public.course_classes enable row level security;
alter table public.teachers enable row level security;

create policy "authenticated users can read classes"
on public.course_classes
for select
to authenticated
using (true);

create policy "authenticated users can insert classes"
on public.course_classes
for insert
to authenticated
with check (true);

create policy "authenticated users can update classes"
on public.course_classes
for update
to authenticated
using (true)
with check (true);

create policy "authenticated users can delete classes"
on public.course_classes
for delete
to authenticated
using (true);

create policy "authenticated users can read teachers"
on public.teachers
for select
to authenticated
using (true);

create policy "authenticated users can insert teachers"
on public.teachers
for insert
to authenticated
with check (true);

create policy "authenticated users can update teachers"
on public.teachers
for update
to authenticated
using (true)
with check (true);

create policy "authenticated users can delete teachers"
on public.teachers
for delete
to authenticated
using (true);
