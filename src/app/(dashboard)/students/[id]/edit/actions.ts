"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  buildFinancialContactPayload,
  buildGuardianPayload,
  buildStudentPayload,
  getRequiredTextValue,
  getTextValue,
} from "@/lib/students/form-helpers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type GuardianInsert = Database["public"]["Tables"]["student_guardians"]["Insert"];

export async function updateStudentAction(studentId: string, formData: FormData) {
  const fullName = getTextValue(formData, "full_name");

  if (!fullName) {
    redirect(`/students/${studentId}/edit?error=Preencha+o+nome+do+aluno`);
  }

  const supabase = await createSupabaseServerClient();

  const studentPayload = buildStudentPayload(
    formData,
  ) as Database["public"]["Tables"]["students"]["Update"];

  const { error: studentError } = await supabase
    .from("students")
    .update(studentPayload)
    .eq("id", studentId);

  if (studentError) {
    redirect(`/students/${studentId}/edit?error=Não+foi+possível+atualizar+o+aluno`);
  }

  const { error: deleteGuardiansError } = await supabase
    .from("student_guardians")
    .delete()
    .eq("student_id", studentId);

  if (deleteGuardiansError) {
    redirect(`/students/${studentId}/edit?error=Erro+ao+atualizar+responsáveis`);
  }

  const { error: deleteFinancialError } = await supabase
    .from("student_financial_contacts")
    .delete()
    .eq("student_id", studentId);

  if (deleteFinancialError) {
    redirect(`/students/${studentId}/edit?error=Erro+ao+atualizar+responsável+financeiro`);
  }

  const guardianPayloads = [
    buildGuardianPayload(formData, studentId, "primary"),
    buildGuardianPayload(formData, studentId, "secondary"),
  ].filter((value): value is GuardianInsert => value !== null);

  if (guardianPayloads.length > 0) {
    const { error } = await supabase.from("student_guardians").insert(guardianPayloads);

    if (error) {
      redirect(`/students/${studentId}/edit?error=Erro+ao+salvar+responsáveis`);
    }
  }

  const financialPayload = buildFinancialContactPayload(formData, studentId);

  if (financialPayload) {
    const { error } = await supabase
      .from("student_financial_contacts")
      .insert(financialPayload);

    if (error) {
      redirect(`/students/${studentId}/edit?error=Erro+ao+salvar+responsável+financeiro`);
    }
  }

  revalidatePath("/students");
  revalidatePath(`/students/${studentId}`);
  redirect(
    `/students/${studentId}?updated=${encodeURIComponent(
      getRequiredTextValue(formData, "full_name", "Aluno"),
    )}`,
  );
}

export async function deleteStudentAction(studentId: string) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("students").delete().eq("id", studentId);

  if (error) {
    redirect(`/students/${studentId}/delete?error=Não+foi+possível+excluir+o+aluno`);
  }

  revalidatePath("/students");
  redirect("/students?deleted=Aluno+excluído+com+sucesso");
}
