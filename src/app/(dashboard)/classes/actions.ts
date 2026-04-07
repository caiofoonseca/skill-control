"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function getTextValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

export async function createClassAction(formData: FormData) {
  const name = getTextValue(formData, "name");
  const teacherId = getTextValue(formData, "teacher_id");

  if (!name) {
    redirect("/classes?error=Informe+o+nome+da+turma");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("course_classes").insert({ name, teacher_id: teacherId });

  if (error) {
    redirect("/classes?error=Não+foi+possível+salvar+a+turma");
  }

  revalidateSharedPaths();
  redirect("/classes?created=Turma+salva+com+sucesso");
}

export async function updateClassAction(classId: string, currentName: string, formData: FormData) {
  const name = getTextValue(formData, "name");
  const teacherId = getTextValue(formData, "teacher_id");

  if (!name) {
    redirect("/classes?error=Informe+o+nome+da+turma");
  }

  const supabase = await createSupabaseServerClient();
  const teacherName = teacherId
    ? (await supabase.from("teachers").select("name").eq("id", teacherId).maybeSingle()).data?.name ?? null
    : null;

  const { error: classError } = await supabase
    .from("course_classes")
    .update({ name, teacher_id: teacherId })
    .eq("id", classId);

  if (classError) {
    redirect("/classes?error=Não+foi+possível+atualizar+a+turma");
  }

  const studentsPayload: { class_name: string; teacher_name?: string | null } = { class_name: name };
  studentsPayload.teacher_name = teacherName;

  const { error: studentsError } = await supabase
    .from("students")
    .update(studentsPayload)
    .eq("class_name", currentName);

  if (studentsError) {
    redirect("/classes?error=Não+foi+possível+atualizar+os+alunos+vinculados");
  }

  revalidateSharedPaths();
  redirect("/classes?updated=Turma+atualizada+com+sucesso");
}

export async function deleteClassAction(classId: string, className: string) {
  const supabase = await createSupabaseServerClient();

  const { count } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("class_name", className);

  if ((count ?? 0) > 0) {
    redirect("/classes?error=Essa+turma+está+vinculada+a+alunos+e+não+pode+ser+excluída");
  }

  const { error } = await supabase.from("course_classes").delete().eq("id", classId);

  if (error) {
    redirect("/classes?error=Não+foi+possível+excluir+a+turma");
  }

  revalidateSharedPaths();
  redirect("/classes?deleted=Turma+excluída+com+sucesso");
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
