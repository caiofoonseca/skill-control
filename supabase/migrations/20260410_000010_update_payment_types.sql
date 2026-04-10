alter table public.student_payment_plans
drop constraint if exists student_payment_plans_payment_type_check;

update public.student_payment_plans
set payment_type = case payment_type
  when 'enrollment_fee' then 'enrollment'
  when 're_enrollment_fee' then 'enrollment'
  when 'monthly_payment' then 'installments'
  else payment_type
end
where payment_type in ('enrollment_fee', 're_enrollment_fee', 'monthly_payment');

alter table public.student_payment_plans
add constraint student_payment_plans_payment_type_check
check (
  payment_type in (
    'enrollment',
    'enrollment_first_installment',
    'installments',
    'full_course',
    'course_material',
    'down_payment'
  )
);
