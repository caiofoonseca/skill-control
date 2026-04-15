alter table public.students
  add column if not exists is_scholarship boolean not null default false;

alter table public.student_financial_contacts
  add column if not exists source_guardian_type text
    check (source_guardian_type in ('primary', 'secondary'));

alter table public.teachers
  add column if not exists address text,
  add column if not exists cpf text,
  add column if not exists rg text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists family_phone text;

create index if not exists students_is_scholarship_idx on public.students(is_scholarship);
