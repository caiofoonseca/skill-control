alter table public.course_classes
add column if not exists teacher_id uuid references public.teachers(id) on delete set null;

create index if not exists course_classes_teacher_id_idx on public.course_classes(teacher_id);
