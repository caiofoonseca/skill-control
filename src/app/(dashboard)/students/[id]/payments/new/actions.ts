"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isCreditCardMethod } from "@/lib/payments/constants";
import { normalizeMoney } from "@/lib/payments/money";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

function getTextValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

export async function createPaymentPlanAction(studentId: string, formData: FormData) {
  const paymentType = getTextValue(formData, "payment_type");
  const totalAmount = normalizeMoney(getTextValue(formData, "total_amount"));
  const isInstallment = formData.get("is_installment") === "on";
  const installmentCount = Number(formData.get("installment_count") ?? 1);
  const defaultPaymentMethod = getTextValue(formData, "default_payment_method");
  const paymentBaseDate = getTextValue(formData, "payment_base_date");

  if (!paymentType || !totalAmount) {
    redirect(`/students/${studentId}/payments/new?error=Preencha+os+dados+do+pagamento`);
  }

  const effectiveCount = isInstallment ? Math.max(installmentCount, 1) : 1;
  const title =
    getTextValue(formData, "title") ??
    (paymentType === "enrollment_fee"
      ? "Taxa de matrícula"
      : paymentType === "re_enrollment_fee"
        ? "Taxa de rematrícula"
        : "Mensalidade");

  const supabase = await createSupabaseServerClient();

  const planPayload: Database["public"]["Tables"]["student_payment_plans"]["Insert"] = {
    student_id: studentId,
    payment_type: paymentType as Database["public"]["Tables"]["student_payment_plans"]["Row"]["payment_type"],
    title,
    total_amount: totalAmount,
    is_installment: isInstallment,
    installment_count: effectiveCount,
    default_payment_method: defaultPaymentMethod,
    notes: getTextValue(formData, "notes"),
  };

  const { data: paymentPlan, error: paymentPlanError } = await supabase
    .from("student_payment_plans")
    .insert(planPayload)
    .select("id")
    .single();

  if (paymentPlanError || !paymentPlan) {
    redirect(`/students/${studentId}/payments/new?error=Não+foi+possível+salvar+o+pagamento`);
  }

  const installments: Database["public"]["Tables"]["student_payment_installments"]["Insert"][] = [];

  for (let index = 1; index <= effectiveCount; index += 1) {
    const amount = normalizeMoney(getTextValue(formData, `installment_amount_${index}`));

    if (!amount) {
      await supabase.from("student_payment_plans").delete().eq("id", paymentPlan.id);
      redirect(`/students/${studentId}/payments/new?error=Preencha+o+valor+de+todas+as+parcelas`);
    }

    const installmentPaymentMethod =
      getTextValue(formData, `installment_payment_method_${index}`) ?? defaultPaymentMethod;
    const autoResolved = isCreditCardMethod(installmentPaymentMethod);
    const dueDate = getTextValue(formData, `installment_due_date_${index}`);
    const paidAt = autoResolved
      ? paymentBaseDate ?? dueDate ?? getTextValue(formData, `installment_paid_at_${index}`)
      : getTextValue(formData, `installment_paid_at_${index}`);

    installments.push({
      payment_plan_id: paymentPlan.id,
      student_id: studentId,
      installment_number: Number(formData.get(`installment_number_${index}`) ?? index),
      amount,
      payment_method: installmentPaymentMethod,
      due_date: dueDate,
      paid_at: paidAt,
      status: autoResolved
        ? "resolved"
        : ((getTextValue(formData, `installment_status_${index}`) as "pending" | "resolved" | null) ??
          "pending"),
      description: getTextValue(formData, `installment_description_${index}`),
    });
  }

  const { error: installmentsError } = await supabase
    .from("student_payment_installments")
    .insert(installments);

  if (installmentsError) {
    await supabase.from("student_payment_plans").delete().eq("id", paymentPlan.id);
    redirect(`/students/${studentId}/payments/new?error=Não+foi+possível+salvar+as+parcelas`);
  }

  revalidatePath(`/students/${studentId}`);
  redirect(`/students/${studentId}?updated=${encodeURIComponent("Pagamento registrado com sucesso")}`);
}
