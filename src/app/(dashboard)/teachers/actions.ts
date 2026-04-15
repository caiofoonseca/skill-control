"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function getTextValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

function getTeacherPayload(formData: FormData) {
  return {
    name: getTextValue(formData, "name"),
    address: getTextValue(formData, "address"),
    cpf: getTextValue(formData, "cpf"),
    rg: getTextValue(formData, "rg"),
    email: getTextValue(formData, "email"),
    phone: getTextValue(formData, "phone"),
    family_phone: getTextValue(formData, "family_phone"),
  };
}

function isMissingTeacherColumn(error: { message?: string } | null) {
  return error?.message?.includes("address")
    || error?.message?.includes("cpf")
    || error?.message?.includes("rg")
    || error?.message?.includes("email")
    || error?.message?.includes("phone")
    || error?.message?.includes("family_phone")
    || false;
}

export async function createTeacherAction(formData: FormData) {
  const payload = getTeacherPayload(formData);
  const name = payload.name;

  if (!name) {
    redirect("/teachers?error=Informe+o+nome+do+professor");
  }

  const supabase = await createSupabaseServerClient();
  let createResult = await supabase.from("teachers").insert(payload);

  if (isMissingTeacherColumn(createResult.error)) {
    createResult = await supabase.from("teachers").insert({ name });
  }

  if (createResult.error) {
    redirect("/teachers?error=Nao+foi+possivel+salvar+o+professor");
  }

  revalidateSharedPaths();
  redirect("/teachers?created=Professor+salvo+com+sucesso");
}

export async function updateTeacherAction(teacherId: string, currentName: string, formData: FormData) {
  const payload = getTeacherPayload(formData);
  const name = payload.name;

  if (!name) {
    redirect("/teachers?error=Informe+o+nome+do+professor");
  }

  const supabase = await createSupabaseServerClient();

  let updateResult = await supabase
    .from("teachers")
    .update(payload)
    .eq("id", teacherId);

  if (isMissingTeacherColumn(updateResult.error)) {
    updateResult = await supabase
      .from("teachers")
      .update({ name })
      .eq("id", teacherId);
  }

  if (updateResult.error) {
    redirect("/teachers?error=Nao+foi+possivel+atualizar+o+professor");
  }

  if (name !== currentName) {
    const { error: studentsError } = await supabase
      .from("students")
      .update({ teacher_name: name })
      .eq("teacher_name", currentName);

    if (studentsError) {
      redirect("/teachers?error=Nao+foi+possivel+atualizar+os+alunos+vinculados");
    }
  }

  revalidateSharedPaths();
  redirect("/teachers?updated=Professor+atualizado+com+sucesso");
}

export async function deleteTeacherAction(teacherId: string, teacherName: string) {
  const supabase = await createSupabaseServerClient();

  const [{ count: studentCount }, { count: classCount }] = await Promise.all([
    supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("teacher_name", teacherName),
    supabase
      .from("course_classes")
      .select("*", { count: "exact", head: true })
      .eq("teacher_id", teacherId),
  ]);

  if ((studentCount ?? 0) > 0 || (classCount ?? 0) > 0) {
    redirect("/teachers?error=Esse+professor+esta+vinculado+a+turmas+ou+alunos+e+nao+pode+ser+excluido");
  }

  const { error } = await supabase.from("teachers").delete().eq("id", teacherId);

  if (error) {
    redirect("/teachers?error=Nao+foi+possivel+excluir+o+professor");
  }

  revalidateSharedPaths();
  redirect("/teachers?deleted=Professor+excluido+com+sucesso");
}

function revalidateSharedPaths() {
  revalidatePath("/classes");
  revalidatePath("/teachers");
  revalidatePath("/students");
  revalidatePath("/students/new");
  revalidatePath("/students/[id]");
  revalidatePath("/students/[id]/edit");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
}
