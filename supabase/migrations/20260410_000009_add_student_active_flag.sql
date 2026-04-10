alter table public.students
add column if not exists is_active boolean not null default true;

create index if not exists students_is_active_idx on public.students(is_active);

alter table public.students
add column if not exists language text not null default 'Ingles';

alter table public.students
drop constraint if exists students_language_check;

alter table public.students
add constraint students_language_check
check (
  language in (
    'Ingles',
    'Alemao',
    'Frances',
    'Espanhol',
    'Portugues para estrangeiros'
  )
);
