"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { normalizeMoney } from "@/lib/payments/money";
import { getDefaultPaymentTitle, isCreditCardMethod, PAYMENT_TYPE_OPTIONS } from "@/lib/payments/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { assertCanWrite } from "@/lib/users/action-guards";
import type { Database } from "@/types/supabase";
import {
  buildFinancialContactPayload,
  buildGuardianPayload,
  buildStudentPayload,
  getRequiredTextValue,
  getTextValue,
  validateStudentForm,
  type GuardianInsert,
} from "@/lib/students/form-helpers";

function isMissingNewStudentColumn(error: { message?: string } | null) {
  return error?.message?.includes("is_active")
    || error?.message?.includes("language")
    || error?.message?.includes("is_scholarship")
    || error?.message?.includes("scholarship_discount_percent")
    || false;
}

function isMissingFinancialContactColumn(error: { message?: string } | null) {
  return error?.message?.includes("source_guardian_type") || false;
}

function isValidPaymentType(value: string | null) {
  return Boolean(value && PAYMENT_TYPE_OPTIONS.some((option) => option.value === value));
}

export async function createStudentAction(formData: FormData) {
  const validationError = validateStudentForm(formData);

  if (validationError) {
    redirect(`/students/new?error=${encodeURIComponent(validationError)}`);
  }

  const supabase = await createSupabaseServerClient();
  await assertCanWrite(supabase, "/students/new");

  const studentPayload = buildStudentPayload(
    formData,
  ) as Database["public"]["Tables"]["students"]["Insert"];

  let createResult = await supabase
    .from("students")
    .insert(studentPayload)
    .select("id")
    .single();

  if (isMissingNewStudentColumn(createResult.error)) {
    const compatibleStudentPayload = { ...studentPayload };
    delete compatibleStudentPayload.is_active;
    delete compatibleStudentPayload.language;
    delete compatibleStudentPayload.is_scholarship;
    delete compatibleStudentPayload.scholarship_discount_percent;

    createResult = await supabase
      .from("students")
      .insert(compatibleStudentPayload)
      .select("id")
      .single();
  }

  const { data: student, error: studentError } = createResult;

  if (studentError || !student) {
    redirect("/students/new?error=Não+foi+possível+salvar+o+aluno");
  }

  const guardianPayloads = [
    buildGuardianPayload(formData, student.id, "primary"),
    buildGuardianPayload(formData, student.id, "secondary"),
  ].filter((value): value is GuardianInsert => value !== null);

  const financialPayload = buildFinancialContactPayload(formData, student.id);

  if (guardianPayloads.length > 0) {
    const { error } = await supabase.from("student_guardians").insert(guardianPayloads);

    if (error) {
      await supabase.from("students").delete().eq("id", student.id);
      redirect("/students/new?error=Erro+ao+salvar+os+responsáveis");
    }
  }

  if (financialPayload) {
    let financialResult = await supabase
      .from("student_financial_contacts")
      .insert(financialPayload);

    if (isMissingFinancialContactColumn(financialResult.error)) {
      const compatibleFinancialPayload = { ...financialPayload };
      delete compatibleFinancialPayload.source_guardian_type;

      financialResult = await supabase
        .from("student_financial_contacts")
        .insert(compatibleFinancialPayload);
    }

    const { error } = financialResult;

    if (error) {
      await supabase.from("students").delete().eq("id", student.id);
      redirect("/students/new?error=Erro+ao+salvar+o+responsável+financeiro");
    }
  }

  if (formData.get("create_initial_payment") === "on") {
    const paymentType = getTextValue(formData, "payment_type");
    const totalAmount = normalizeMoney(getTextValue(formData, "payment_total_amount"));
    const isInstallment = formData.get("payment_is_installment") === "on";
    const installmentCount = Number(formData.get("payment_installment_count") ?? 1);
    const defaultPaymentMethod = getTextValue(formData, "payment_default_method");
    const paymentBaseDate = getTextValue(formData, "payment_base_date");

    if (!isValidPaymentType(paymentType) || !totalAmount) {
      await supabase.from("students").delete().eq("id", student.id);
      redirect("/students/new?error=Preencha+os+dados+do+primeiro+pagamento");
    }

    const effectiveCount = isInstallment ? Math.max(installmentCount, 1) : 1;
    const effectivePaymentType = paymentType ?? "installments";
    const title =
      getTextValue(formData, "payment_title") ?? getDefaultPaymentTitle(effectivePaymentType);

    const paymentPlanPayload: Database["public"]["Tables"]["student_payment_plans"]["Insert"] = {
      student_id: student.id,
      payment_type: effectivePaymentType as Database["public"]["Tables"]["student_payment_plans"]["Row"]["payment_type"],
      title,
      total_amount: totalAmount,
      is_installment: isInstallment,
      installment_count: effectiveCount,
      default_payment_method: defaultPaymentMethod,
      notes: getTextValue(formData, "payment_notes"),
    };

    const { data: paymentPlan, error: paymentPlanError } = await supabase
      .from("student_payment_plans")
      .insert(paymentPlanPayload)
      .select("id")
      .single();

    if (paymentPlanError || !paymentPlan) {
      await supabase.from("students").delete().eq("id", student.id);
      redirect("/students/new?error=Não+foi+possível+salvar+o+primeiro+pagamento");
    }

    const installments: Database["public"]["Tables"]["student_payment_installments"]["Insert"][] = [];

    for (let index = 1; index <= effectiveCount; index += 1) {
      const amount = normalizeMoney(
        getTextValue(formData, `payment_installment_amount_${index}`),
      );

      if (!amount) {
        await supabase.from("student_payment_plans").delete().eq("id", paymentPlan.id);
        await supabase.from("students").delete().eq("id", student.id);
        redirect("/students/new?error=Preencha+o+valor+de+todas+as+parcelas");
      }

      const installmentPaymentMethod =
        getTextValue(formData, `payment_installment_method_${index}`) ??
        defaultPaymentMethod;
      const autoResolved = isCreditCardMethod(installmentPaymentMethod);
      const dueDate = getTextValue(formData, `payment_installment_due_date_${index}`);
      const paidAt = autoResolved
        ? paymentBaseDate ??
          dueDate ??
          getTextValue(formData, `payment_installment_paid_at_${index}`)
        : getTextValue(formData, `payment_installment_paid_at_${index}`);

      installments.push({
        payment_plan_id: paymentPlan.id,
        student_id: student.id,
        installment_number: Number(
          formData.get(`payment_installment_number_${index}`) ?? index,
        ),
        amount,
        payment_method: installmentPaymentMethod,
        due_date: dueDate,
        paid_at: paidAt,
        status: autoResolved
          ? "resolved"
          : ((getTextValue(formData, `payment_installment_status_${index}`) as
              | "pending"
              | "resolved"
              | null) ?? "pending"),
        description: getTextValue(
          formData,
          `payment_installment_description_${index}`,
        ),
      });
    }

    const { error: installmentsError } = await supabase
      .from("student_payment_installments")
      .insert(installments);

    if (installmentsError) {
      await supabase.from("student_payment_plans").delete().eq("id", paymentPlan.id);
      await supabase.from("students").delete().eq("id", student.id);
      redirect("/students/new?error=Não+foi+possível+salvar+as+parcelas");
    }
  }

  revalidatePath("/students");
  revalidatePath("/dashboard");
  redirect(`/students?created=${encodeURIComponent(getRequiredTextValue(formData, "full_name", "Aluno"))}`);
}




