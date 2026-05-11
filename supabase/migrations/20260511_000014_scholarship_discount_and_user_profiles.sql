alter table public.students
  add column if not exists scholarship_discount_percent numeric(5,2)
    check (
      scholarship_discount_percent is null
      or (scholarship_discount_percent >= 0 and scholarship_discount_percent <= 100)
    );

create index if not exists students_scholarship_discount_percent_idx
  on public.students(scholarship_discount_percent);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'secretary'
    check (role in ('master', 'secretary', 'viewer')),
  can_delete_records boolean not null default false,
  can_access_financial boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

alter table public.user_profiles
  drop constraint if exists user_profiles_role_check;

alter table public.user_profiles
  add constraint user_profiles_role_check
  check (role in ('master', 'secretary', 'viewer'));

create or replace function public.is_master_user()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in (
    'gfaquino@gmail.com',
    'passimachado@hotmail.com'
  );
$$;

create or replace function public.current_user_app_role()
returns text
language sql
stable
as $$
  select case
    when public.is_master_user() then 'master'
    else coalesce(
      (
        select role
        from public.user_profiles
        where id = auth.uid()
          and active = true
        limit 1
      ),
      'viewer'
    )
  end;
$$;

create or replace function public.can_write_records()
returns boolean
language sql
stable
as $$
  select public.current_user_app_role() in ('master', 'secretary');
$$;

create or replace function public.can_delete_records()
returns boolean
language sql
stable
as $$
  select public.current_user_app_role() = 'master';
$$;

drop policy if exists "authenticated users can read user profiles" on public.user_profiles;
drop policy if exists "users can insert their own profile" on public.user_profiles;
drop policy if exists "users can update their own profile" on public.user_profiles;

create policy "authenticated users can read user profiles"
  on public.user_profiles
  for select
  to authenticated
  using (true);

create policy "users can insert their own profile"
  on public.user_profiles
  for insert
  to authenticated
  with check (auth.uid() = id or public.is_master_user());

create policy "users can update their own profile"
  on public.user_profiles
  for update
  to authenticated
  using (auth.uid() = id or public.is_master_user())
  with check (auth.uid() = id or public.is_master_user());

drop policy if exists "authenticated users can insert students" on public.students;
drop policy if exists "authenticated users can update students" on public.students;
drop policy if exists "authenticated users can delete students" on public.students;
drop policy if exists "secretary and master can insert students" on public.students;
drop policy if exists "secretary and master can update students" on public.students;
drop policy if exists "master can delete students" on public.students;
create policy "secretary and master can insert students"
  on public.students for insert to authenticated
  with check (public.can_write_records());
create policy "secretary and master can update students"
  on public.students for update to authenticated
  using (public.can_write_records())
  with check (public.can_write_records());
create policy "master can delete students"
  on public.students for delete to authenticated
  using (public.can_delete_records());

drop policy if exists "authenticated users can insert guardians" on public.student_guardians;
drop policy if exists "authenticated users can update guardians" on public.student_guardians;
drop policy if exists "authenticated users can delete guardians" on public.student_guardians;
drop policy if exists "secretary and master can insert guardians" on public.student_guardians;
drop policy if exists "secretary and master can update guardians" on public.student_guardians;
drop policy if exists "master can delete guardians" on public.student_guardians;
create policy "secretary and master can insert guardians"
  on public.student_guardians for insert to authenticated
  with check (public.can_write_records());
create policy "secretary and master can update guardians"
  on public.student_guardians for update to authenticated
  using (public.can_write_records())
  with check (public.can_write_records());
create policy "master can delete guardians"
  on public.student_guardians for delete to authenticated
  using (public.can_delete_records());

drop policy if exists "authenticated users can insert financial contacts" on public.student_financial_contacts;
drop policy if exists "authenticated users can update financial contacts" on public.student_financial_contacts;
drop policy if exists "authenticated users can delete financial contacts" on public.student_financial_contacts;
drop policy if exists "secretary and master can insert financial contacts" on public.student_financial_contacts;
drop policy if exists "secretary and master can update financial contacts" on public.student_financial_contacts;
drop policy if exists "master can delete financial contacts" on public.student_financial_contacts;
create policy "secretary and master can insert financial contacts"
  on public.student_financial_contacts for insert to authenticated
  with check (public.can_write_records());
create policy "secretary and master can update financial contacts"
  on public.student_financial_contacts for update to authenticated
  using (public.can_write_records())
  with check (public.can_write_records());
create policy "master can delete financial contacts"
  on public.student_financial_contacts for delete to authenticated
  using (public.can_delete_records());

drop policy if exists "authenticated users can insert payment plans" on public.student_payment_plans;
drop policy if exists "authenticated users can update payment plans" on public.student_payment_plans;
drop policy if exists "authenticated users can delete payment plans" on public.student_payment_plans;
drop policy if exists "secretary and master can insert payment plans" on public.student_payment_plans;
drop policy if exists "secretary and master can update payment plans" on public.student_payment_plans;
drop policy if exists "master can delete payment plans" on public.student_payment_plans;
create policy "secretary and master can insert payment plans"
  on public.student_payment_plans for insert to authenticated
  with check (public.can_write_records());
create policy "secretary and master can update payment plans"
  on public.student_payment_plans for update to authenticated
  using (public.can_write_records())
  with check (public.can_write_records());
create policy "master can delete payment plans"
  on public.student_payment_plans for delete to authenticated
  using (public.can_delete_records());

drop policy if exists "authenticated users can insert installments" on public.student_payment_installments;
drop policy if exists "authenticated users can update installments" on public.student_payment_installments;
drop policy if exists "authenticated users can delete installments" on public.student_payment_installments;
drop policy if exists "secretary and master can insert installments" on public.student_payment_installments;
drop policy if exists "secretary and master can update installments" on public.student_payment_installments;
drop policy if exists "master can delete installments" on public.student_payment_installments;
create policy "secretary and master can insert installments"
  on public.student_payment_installments for insert to authenticated
  with check (public.can_write_records());
create policy "secretary and master can update installments"
  on public.student_payment_installments for update to authenticated
  using (public.can_write_records())
  with check (public.can_write_records());
create policy "master can delete installments"
  on public.student_payment_installments for delete to authenticated
  using (public.can_delete_records());

drop policy if exists "authenticated users can insert classes" on public.course_classes;
drop policy if exists "authenticated users can update classes" on public.course_classes;
drop policy if exists "authenticated users can delete classes" on public.course_classes;
drop policy if exists "secretary and master can insert classes" on public.course_classes;
drop policy if exists "secretary and master can update classes" on public.course_classes;
drop policy if exists "master can delete classes" on public.course_classes;
create policy "secretary and master can insert classes"
  on public.course_classes for insert to authenticated
  with check (public.can_write_records());
create policy "secretary and master can update classes"
  on public.course_classes for update to authenticated
  using (public.can_write_records())
  with check (public.can_write_records());
create policy "master can delete classes"
  on public.course_classes for delete to authenticated
  using (public.can_delete_records());

drop policy if exists "authenticated users can insert teachers" on public.teachers;
drop policy if exists "authenticated users can update teachers" on public.teachers;
drop policy if exists "authenticated users can delete teachers" on public.teachers;
drop policy if exists "secretary and master can insert teachers" on public.teachers;
drop policy if exists "secretary and master can update teachers" on public.teachers;
drop policy if exists "master can delete teachers" on public.teachers;
create policy "secretary and master can insert teachers"
  on public.teachers for insert to authenticated
  with check (public.can_write_records());
create policy "secretary and master can update teachers"
  on public.teachers for update to authenticated
  using (public.can_write_records())
  with check (public.can_write_records());
create policy "master can delete teachers"
  on public.teachers for delete to authenticated
  using (public.can_delete_records());

drop policy if exists "authenticated users can insert books" on public.books;
drop policy if exists "authenticated users can update books" on public.books;
drop policy if exists "authenticated users can delete books" on public.books;
drop policy if exists "secretary and master can insert books" on public.books;
drop policy if exists "secretary and master can update books" on public.books;
drop policy if exists "master can delete books" on public.books;
create policy "secretary and master can insert books"
  on public.books for insert to authenticated
  with check (public.can_write_records());
create policy "secretary and master can update books"
  on public.books for update to authenticated
  using (public.can_write_records())
  with check (public.can_write_records());
create policy "master can delete books"
  on public.books for delete to authenticated
  using (public.can_delete_records());
