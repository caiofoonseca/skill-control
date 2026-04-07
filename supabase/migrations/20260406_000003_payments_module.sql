alter table public.students
add column if not exists current_book text;

create table if not exists public.student_payment_plans (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  payment_type text not null check (
    payment_type in ('enrollment_fee', 're_enrollment_fee', 'monthly_payment')
  ),
  title text not null,
  total_amount numeric(10, 2) not null check (total_amount >= 0),
  is_installment boolean not null default false,
  installment_count integer not null default 1 check (installment_count >= 1),
  default_payment_method text,
  notes text
);

create table if not exists public.student_payment_installments (
  id uuid primary key default gen_random_uuid(),
  payment_plan_id uuid not null references public.student_payment_plans(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  installment_number integer not null check (installment_number >= 1),
  amount numeric(10, 2) not null check (amount >= 0),
  payment_method text,
  due_date date,
  paid_at date,
  status text not null default 'pending' check (status in ('pending', 'resolved')),
  description text,
  constraint student_payment_installments_unique_number unique (payment_plan_id, installment_number)
);

create index if not exists student_payment_plans_student_id_idx
  on public.student_payment_plans(student_id);

create index if not exists student_payment_plans_payment_type_idx
  on public.student_payment_plans(payment_type);

create index if not exists student_payment_installments_student_id_idx
  on public.student_payment_installments(student_id);

create index if not exists student_payment_installments_status_idx
  on public.student_payment_installments(status);

create index if not exists student_payment_installments_due_date_idx
  on public.student_payment_installments(due_date);

drop trigger if exists set_student_payment_plans_updated_at on public.student_payment_plans;
create trigger set_student_payment_plans_updated_at
before update on public.student_payment_plans
for each row
execute function public.set_updated_at();

drop trigger if exists set_student_payment_installments_updated_at on public.student_payment_installments;
create trigger set_student_payment_installments_updated_at
before update on public.student_payment_installments
for each row
execute function public.set_updated_at();

alter table public.student_payment_plans enable row level security;
alter table public.student_payment_installments enable row level security;
