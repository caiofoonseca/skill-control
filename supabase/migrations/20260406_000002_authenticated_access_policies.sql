create policy "authenticated users can read students"
on public.students
for select
to authenticated
using (true);

create policy "authenticated users can insert students"
on public.students
for insert
to authenticated
with check (true);

create policy "authenticated users can update students"
on public.students
for update
to authenticated
using (true)
with check (true);

create policy "authenticated users can delete students"
on public.students
for delete
to authenticated
using (true);

create policy "authenticated users can read guardians"
on public.student_guardians
for select
to authenticated
using (true);

create policy "authenticated users can insert guardians"
on public.student_guardians
for insert
to authenticated
with check (true);

create policy "authenticated users can update guardians"
on public.student_guardians
for update
to authenticated
using (true)
with check (true);

create policy "authenticated users can delete guardians"
on public.student_guardians
for delete
to authenticated
using (true);

create policy "authenticated users can read financial contacts"
on public.student_financial_contacts
for select
to authenticated
using (true);

create policy "authenticated users can insert financial contacts"
on public.student_financial_contacts
for insert
to authenticated
with check (true);

create policy "authenticated users can update financial contacts"
on public.student_financial_contacts
for update
to authenticated
using (true)
with check (true);

create policy "authenticated users can delete financial contacts"
on public.student_financial_contacts
for delete
to authenticated
using (true);
