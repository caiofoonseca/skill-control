alter table public.course_classes
  add column if not exists contract_start_date date,
  add column if not exists contract_end_date date,
  add column if not exists lessons_start_date date,
  add column if not exists lessons_end_date date,
  add column if not exists vacation_period text;

alter table public.students
  add column if not exists contracted_stages text,
  add column if not exists leave_without_guardian_authorization text
    check (
      leave_without_guardian_authorization is null
      or leave_without_guardian_authorization in ('authorized', 'not_authorized')
    );
