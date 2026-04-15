"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  buildFinancialContactPayload,
  buildGuardianPayload,
  buildStudentPayload,
  getRequiredTextValue,
  validateStudentForm,
} from "@/lib/students/form-helpers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type GuardianInsert = Database["public"]["Tables"]["student_guardians"]["Insert"];

function isMissingStudentColumn(error: { message?: string } | null) {
  return error?.message?.includes("is_active")
    || error?.message?.includes("language")
    || error?.message?.includes("is_scholarship")
    || false;
}

function isMissingFinancialContactColumn(error: { message?: string } | null) {
  return error?.message?.includes("source_guardian_type") || false;
}

export async function updateStudentAction(studentId: string, formData: FormData) {
  const validationError = validateStudentForm(formData);

  if (validationError) {
    redirect(`/students/${studentId}/edit?error=${encodeURIComponent(validationError)}`);
  }

  const supabase = await createSupabaseServerClient();

  const studentPayload = buildStudentPayload(
    formData,
  ) as Database["public"]["Tables"]["students"]["Update"];

  let updateResult = await supabase
    .from("students")
    .update(studentPayload)
    .eq("id", studentId);

  if (isMissingStudentColumn(updateResult.error)) {
    const compatibleStudentPayload = { ...studentPayload };
    delete compatibleStudentPayload.is_active;
    delete compatibleStudentPayload.language;
    delete compatibleStudentPayload.is_scholarship;

    updateResult = await supabase
      .from("students")
      .update(compatibleStudentPayload)
      .eq("id", studentId);
  }

  const { error: studentError } = updateResult;

  if (studentError) {
    redirect(`/students/${studentId}/edit?error=Nao+foi+possivel+atualizar+o+aluno`);
  }

  const { error: deleteGuardiansError } = await supabase
    .from("student_guardians")
    .delete()
    .eq("student_id", studentId);

  if (deleteGuardiansError) {
    redirect(`/students/${studentId}/edit?error=Erro+ao+atualizar+responsaveis`);
  }

  const { error: deleteFinancialError } = await supabase
    .from("student_financial_contacts")
    .delete()
    .eq("student_id", studentId);

  if (deleteFinancialError) {
    redirect(`/students/${studentId}/edit?error=Erro+ao+atualizar+responsavel+financeiro`);
  }

  const guardianPayloads = [
    buildGuardianPayload(formData, studentId, "primary"),
    buildGuardianPayload(formData, studentId, "secondary"),
  ].filter((value): value is GuardianInsert => value !== null);

  if (guardianPayloads.length > 0) {
    const { error } = await supabase.from("student_guardians").insert(guardianPayloads);

    if (error) {
      redirect(`/students/${studentId}/edit?error=Erro+ao+salvar+responsaveis`);
    }
  }

  const financialPayload = buildFinancialContactPayload(formData, studentId);

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

    if (financialResult.error) {
      redirect(`/students/${studentId}/edit?error=Erro+ao+salvar+responsavel+financeiro`);
    }
  }

  revalidatePath("/students");
  revalidatePath(`/students/${studentId}`);
  redirect(`/students?updated=${encodeURIComponent(getRequiredTextValue(formData, "full_name", "Aluno"))}`);
}

export async function deleteStudentAction(studentId: string) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("students").delete().eq("id", studentId);

  if (error) {
    redirect(`/students/${studentId}/delete?error=Nao+foi+possivel+excluir+o+aluno`);
  }

  revalidatePath("/students");
  redirect("/students?deleted=Aluno+excluido+com+sucesso");
}
