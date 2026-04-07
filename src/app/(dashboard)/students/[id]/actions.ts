"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function getTextValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

export async function updatePaymentInstallmentAction(
  studentId: string,
  installmentId: string,
  formData: FormData,
) {
  const status = getTextValue(formData, "status");
  const paymentMethod = getTextValue(formData, "payment_method");
  const paidAt = getTextValue(formData, "paid_at");
  const description = getTextValue(formData, "description");

  if (status !== "pending" && status !== "resolved") {
    redirect(`/students/${studentId}?updated=${encodeURIComponent("Status inválido")}`);
  }

  const supabase = await createSupabaseServerClient();

  const payload = {
    status,
    payment_method: paymentMethod,
    paid_at: status === "pending" ? null : paidAt,
    description,
  };

  const { error } = await supabase
    .from("student_payment_installments")
    .update(payload)
    .eq("id", installmentId)
    .eq("student_id", studentId);

  if (error) {
    redirect(
      `/students/${studentId}?updated=${encodeURIComponent("Não foi possível atualizar a parcela")}`,
    );
  }

  revalidatePath(`/students/${studentId}`);
  redirect(
    `/students/${studentId}?updated=${encodeURIComponent("Parcela atualizada com sucesso")}#pagamentos-do-aluno`,
  );
}

export async function deletePaymentPlanAction(
  studentId: string,
  paymentPlanId: string,
) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("student_payment_plans")
    .delete()
    .eq("id", paymentPlanId)
    .eq("student_id", studentId);

  if (error) {
    redirect(
      `/students/${studentId}?updated=${encodeURIComponent("Não foi possível excluir a cobrança")}#pagamentos-do-aluno`,
    );
  }

  revalidatePath(`/students/${studentId}`);
  redirect(
    `/students/${studentId}?updated=${encodeURIComponent("Cobrança excluída com sucesso")}#pagamentos-do-aluno`,
  );
}

export async function deleteInstallmentAction(
  studentId: string,
  paymentPlanId: string,
  installmentId: string,
) {
  const supabase = await createSupabaseServerClient();

  const { data: plan } = await supabase
    .from("student_payment_plans")
    .select("id, installment_count")
    .eq("id", paymentPlanId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (!plan) {
    redirect(
      `/students/${studentId}?updated=${encodeURIComponent("Cobrança não encontrada")}#pagamentos-do-aluno`,
    );
  }

  if (plan.installment_count <= 1) {
    await deletePaymentPlanAction(studentId, paymentPlanId);
  }

  const { error: deleteError } = await supabase
    .from("student_payment_installments")
    .delete()
    .eq("id", installmentId)
    .eq("student_id", studentId);

  if (deleteError) {
    redirect(
      `/students/${studentId}?updated=${encodeURIComponent("Não foi possível excluir a parcela")}#pagamentos-do-aluno`,
    );
  }

  const { data: remainingInstallments } = await supabase
    .from("student_payment_installments")
    .select("id, amount")
    .eq("payment_plan_id", paymentPlanId)
    .eq("student_id", studentId)
    .order("installment_number", { ascending: true });

  const installments = remainingInstallments ?? [];

  for (const [index, installment] of installments.entries()) {
    await supabase
      .from("student_payment_installments")
      .update({ installment_number: index + 1 })
      .eq("id", installment.id)
      .eq("student_id", studentId);
  }

  const nextTotal = installments
    .reduce((sum, installment) => sum + Number(installment.amount), 0)
    .toFixed(2);

  await supabase
    .from("student_payment_plans")
    .update({
      installment_count: installments.length,
      total_amount: nextTotal,
    })
    .eq("id", paymentPlanId)
    .eq("student_id", studentId);

  revalidatePath(`/students/${studentId}`);
  redirect(
    `/students/${studentId}?updated=${encodeURIComponent("Parcela excluída com sucesso")}#pagamentos-do-aluno`,
  );
}
