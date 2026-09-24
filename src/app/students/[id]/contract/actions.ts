"use server";

import { revalidatePath } from "next/cache";

import { getDefaultPaymentTitle, isCreditCardMethod } from "@/lib/payments/constants";
import { normalizeMoney, parseMoneyInput } from "@/lib/payments/money";
import { addMonthsToDate } from "@/lib/payments/schedule";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { assertCanWrite } from "@/lib/users/action-guards";
import type { Database } from "@/types/supabase";

export async function logContractEmissionAction(
  studentId: string,
  signerKey: "student" | "primary" | "secondary",
  signerName: string,
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  await supabase.from("contract_emissions").insert({
    student_id: studentId,
    signer_key: signerKey,
    signer_name: signerName,
    emitted_by_email: user.email ?? null,
  });

  revalidatePath(`/students/${studentId}`);
}

type SavePaymentResult = { ok: true } | { ok: false; error: string };

function computeInstallmentAmount(totalAmount: string, count: number) {
  const parsed = parseMoneyInput(totalAmount);
  if (parsed === null || count <= 0) {
    return null;
  }

  return (parsed / count).toFixed(2);
}

export async function saveCoursePaymentFromContractAction(input: {
  studentId: string;
  totalAmount: string;
  installmentCount: string;
  firstDueDate: string;
  paymentMethod: string;
}): Promise<SavePaymentResult> {
  const totalAmount = normalizeMoney(input.totalAmount);
  const installmentCount = Number.parseInt(input.installmentCount, 10);

  if (!totalAmount || Number(totalAmount) <= 0) {
    return { ok: false, error: "Informe um valor total válido." };
  }

  if (!Number.isInteger(installmentCount) || installmentCount < 1) {
    return { ok: false, error: "Informe um número de parcelas válido." };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.firstDueDate)) {
    return { ok: false, error: "Data da 1ª parcela inválida." };
  }

  if (!input.paymentMethod) {
    return { ok: false, error: "Selecione a forma de pagamento." };
  }

  const supabase = await createSupabaseServerClient();
  await assertCanWrite(supabase, `/students/${input.studentId}/contract`);

  const paymentType = installmentCount > 1 ? "installments" : "full_course";

  const planPayload: Database["public"]["Tables"]["student_payment_plans"]["Insert"] = {
    student_id: input.studentId,
    payment_type: paymentType,
    title: getDefaultPaymentTitle(paymentType),
    total_amount: totalAmount,
    is_installment: installmentCount > 1,
    installment_count: installmentCount,
    default_payment_method: input.paymentMethod,
    notes: "Cadastrado a partir da emissão de contrato",
  };

  const { data: plan, error: planError } = await supabase
    .from("student_payment_plans")
    .insert(planPayload)
    .select("id")
    .single();

  if (planError || !plan) {
    return { ok: false, error: "Não foi possível salvar o pagamento do curso." };
  }

  const installmentAmount = computeInstallmentAmount(totalAmount, installmentCount);

  if (!installmentAmount) {
    await supabase.from("student_payment_plans").delete().eq("id", plan.id);
    return { ok: false, error: "Não foi possível calcular o valor das parcelas." };
  }

  const autoResolved = isCreditCardMethod(input.paymentMethod);

  const installments: Database["public"]["Tables"]["student_payment_installments"]["Insert"][] =
    Array.from({ length: installmentCount }, (_, index) => ({
      payment_plan_id: plan.id,
      student_id: input.studentId,
      installment_number: index + 1,
      amount: installmentAmount,
      payment_method: input.paymentMethod,
      due_date: addMonthsToDate(input.firstDueDate, index),
      paid_at: autoResolved ? input.firstDueDate : null,
      status: autoResolved ? "resolved" : "pending",
      description: null,
    }));

  const { error: installmentsError } = await supabase
    .from("student_payment_installments")
    .insert(installments);

  if (installmentsError) {
    await supabase.from("student_payment_plans").delete().eq("id", plan.id);
    return { ok: false, error: "Não foi possível salvar as parcelas." };
  }

  revalidatePath("/students");
  revalidatePath(`/students/${input.studentId}`);
  revalidatePath(`/students/${input.studentId}/contract`);

  return { ok: true };
}

export async function saveEnrollmentPaymentFromContractAction(input: {
  studentId: string;
  amount: string;
  dueDate: string;
  paymentMethod: string;
}): Promise<SavePaymentResult> {
  const amount = normalizeMoney(input.amount);

  if (!amount || Number(amount) <= 0) {
    return { ok: false, error: "Informe um valor válido para a taxa de matrícula." };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.dueDate)) {
    return { ok: false, error: "Data da matrícula inválida." };
  }

  if (!input.paymentMethod) {
    return { ok: false, error: "Selecione a forma de pagamento." };
  }

  const supabase = await createSupabaseServerClient();
  await assertCanWrite(supabase, `/students/${input.studentId}/contract`);

  const planPayload: Database["public"]["Tables"]["student_payment_plans"]["Insert"] = {
    student_id: input.studentId,
    payment_type: "enrollment",
    title: getDefaultPaymentTitle("enrollment"),
    total_amount: amount,
    is_installment: false,
    installment_count: 1,
    default_payment_method: input.paymentMethod,
    notes: "Cadastrado a partir da emissão de contrato",
  };

  const { data: plan, error: planError } = await supabase
    .from("student_payment_plans")
    .insert(planPayload)
    .select("id")
    .single();

  if (planError || !plan) {
    return { ok: false, error: "Não foi possível salvar a taxa de matrícula." };
  }

  const autoResolved = isCreditCardMethod(input.paymentMethod);

  const { error: installmentError } = await supabase.from("student_payment_installments").insert({
    payment_plan_id: plan.id,
    student_id: input.studentId,
    installment_number: 1,
    amount,
    payment_method: input.paymentMethod,
    due_date: input.dueDate,
    paid_at: autoResolved ? input.dueDate : null,
    status: autoResolved ? "resolved" : "pending",
    description: null,
  });

  if (installmentError) {
    await supabase.from("student_payment_plans").delete().eq("id", plan.id);
    return { ok: false, error: "Não foi possível salvar a taxa de matrícula." };
  }

  revalidatePath("/students");
  revalidatePath(`/students/${input.studentId}`);
  revalidatePath(`/students/${input.studentId}/contract`);

  return { ok: true };
}
