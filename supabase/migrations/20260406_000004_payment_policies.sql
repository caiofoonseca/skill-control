create policy "authenticated users can read payment plans"
on public.student_payment_plans
for select
to authenticated
using (true);

create policy "authenticated users can insert payment plans"
on public.student_payment_plans
for insert
to authenticated
with check (true);

create policy "authenticated users can update payment plans"
on public.student_payment_plans
for update
to authenticated
using (true)
with check (true);

create policy "authenticated users can delete payment plans"
on public.student_payment_plans
for delete
to authenticated
using (true);

create policy "authenticated users can read installments"
on public.student_payment_installments
for select
to authenticated
using (true);

create policy "authenticated users can insert installments"
on public.student_payment_installments
for insert
to authenticated
with check (true);

create policy "authenticated users can update installments"
on public.student_payment_installments
for update
to authenticated
using (true)
with check (true);

create policy "authenticated users can delete installments"
on public.student_payment_installments
for delete
to authenticated
using (true);
