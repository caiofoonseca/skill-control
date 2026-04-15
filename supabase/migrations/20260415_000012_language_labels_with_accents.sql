alter table public.students
drop constraint if exists students_language_check;

update public.students
set language = case language
  when 'Ingles' then 'Inglês'
  when 'Alemao' then 'Alemão'
  when 'Frances' then 'Francês'
  when 'Portugues para estrangeiros' then 'Português para estrangeiros'
  else language
end
where language in ('Ingles', 'Alemao', 'Frances', 'Portugues para estrangeiros');

alter table public.students
add constraint students_language_check
check (
  language in (
    'Inglês',
    'Alemão',
    'Francês',
    'Espanhol',
    'Português para estrangeiros'
  )
);

alter table public.students
alter column language set default 'Inglês';
