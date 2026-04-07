create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  full_name text not null,
  address text,
  address_number text,
  apartment text,
  neighborhood text,
  city text,
  state text,
  zip_code text,
  instagram text,
  email text,
  birth_date date,
  cpf text,
  rg text,
  phone text,
  profession text,
  class_name text,
  schedule text,
  teacher_name text,
  payment_notes text
);

create table if not exists public.student_guardians (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  guardian_type text not null check (guardian_type in ('primary', 'secondary')),
  full_name text not null,
  cpf text,
  profession text,
  company text,
  phone text,
  work_phone text,
  email text,
  instagram text,
  constraint student_guardians_unique_role unique (student_id, guardian_type)
);

create table if not exists public.student_financial_contacts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null unique references public.students(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  full_name text not null,
  cpf text,
  address text,
  profession text,
  company text,
  phone text,
  work_phone text,
  email text
);

create index if not exists students_full_name_idx on public.students(full_name);
create index if not exists students_class_name_idx on public.students(class_name);
create index if not exists students_teacher_name_idx on public.students(teacher_name);
create index if not exists student_guardians_student_id_idx on public.student_guardians(student_id);

drop trigger if exists set_students_updated_at on public.students;
create trigger set_students_updated_at
before update on public.students
for each row
execute function public.set_updated_at();

drop trigger if exists set_student_guardians_updated_at on public.student_guardians;
create trigger set_student_guardians_updated_at
before update on public.student_guardians
for each row
execute function public.set_updated_at();

drop trigger if exists set_student_financial_contacts_updated_at on public.student_financial_contacts;
create trigger set_student_financial_contacts_updated_at
before update on public.student_financial_contacts
for each row
execute function public.set_updated_at();

alter table public.students enable row level security;
alter table public.student_guardians enable row level security;
alter table public.student_financial_contacts enable row level security;
