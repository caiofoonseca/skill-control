update public.student_payment_installments as installments
set amount = to_char(
  round(
    (plans.total_amount::numeric / greatest(plans.installment_count, 1)),
    2
  ),
  'FM9999999990.00'
)
from public.student_payment_plans as plans
where installments.payment_plan_id = plans.id
  and round(installments.amount::numeric, 2) = round(
    (
      plans.total_amount::numeric / greatest(plans.installment_count, 1)
    ) * 100,
    2
  );
