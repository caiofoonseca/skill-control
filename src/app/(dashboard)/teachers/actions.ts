"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function getTextValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

export async function createTeacherAction(formData: FormData) {
  const name = getTextValue(formData, "name");

  if (!name) {
    redirect("/teachers?error=Informe+o+nome+do+professor");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("teachers").insert({ name });

  if (error) {
    redirect("/teachers?error=Não+foi+possível+salvar+o+professor");
  }

  revalidateSharedPaths();
  redirect("/teachers?created=Professor+salvo+com+sucesso");
}

export async function updateTeacherAction(teacherId: string, currentName: string, formData: FormData) {
  const name = getTextValue(formData, "name");

  if (!name) {
    redirect("/teachers?error=Informe+o+nome+do+professor");
  }

  const supabase = await createSupabaseServerClient();

  const { error: teacherError } = await supabase
    .from("teachers")
    .update({ name })
    .eq("id", teacherId);

  if (teacherError) {
    redirect("/teachers?error=Não+foi+possível+atualizar+o+professor");
  }

  if (name !== currentName) {
    const { error: studentsError } = await supabase
      .from("students")
      .update({ teacher_name: name })
      .eq("teacher_name", currentName);

    if (studentsError) {
      redirect("/teachers?error=Não+foi+possível+atualizar+os+alunos+vinculados");
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
    redirect("/teachers?error=Esse+professor+está+vinculado+a+turmas+ou+alunos+e+não+pode+ser+excluído");
  }

  const { error } = await supabase.from("teachers").delete().eq("id", teacherId);

  if (error) {
    redirect("/teachers?error=Não+foi+possível+excluir+o+professor");
  }

  revalidateSharedPaths();
  redirect("/teachers?deleted=Professor+excluído+com+sucesso");
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
