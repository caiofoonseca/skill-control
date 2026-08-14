"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { assertCanDelete, assertCanWrite } from "@/lib/users/action-guards";

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
  await assertCanWrite(supabase, "/classes");
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
  await assertCanWrite(supabase, "/classes");
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
  await assertCanDelete(supabase, "/classes");

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

export async function moveStudentToClassAction(studentId: string, formData: FormData) {
  const classId = getTextValue(formData, "target_class_id");

  if (!classId) {
    redirect("/classes?error=Selecione+a+turma+de+destino");
  }

  const supabase = await createSupabaseServerClient();
  await assertCanWrite(supabase, "/classes");
  const { data: targetClass, error: classError } = await supabase
    .from("course_classes")
    .select("name, teacher_id")
    .eq("id", classId)
    .maybeSingle();

  if (classError || !targetClass) {
    redirect("/classes?error=Turma+de+destino+nao+encontrada");
  }

  const teacherName = targetClass.teacher_id
    ? (await supabase
        .from("teachers")
        .select("name")
        .eq("id", targetClass.teacher_id)
        .maybeSingle()).data?.name ?? null
    : null;

  const { error } = await supabase
    .from("students")
    .update({
      class_name: targetClass.name,
      teacher_name: teacherName,
    })
    .eq("id", studentId);

  if (error) {
    redirect("/classes?error=Nao+foi+possivel+realocar+o+aluno");
  }

  revalidateSharedPaths();
  redirect("/classes?updated=Aluno+realocado+com+sucesso");
}

export async function addStudentToClassAction(classId: string, formData: FormData) {
  const studentId = getTextValue(formData, "student_id");

  if (!studentId) {
    redirect(`/classes?editing=${classId}&error=${encodeURIComponent("Selecione um aluno para incluir")}#class-${classId}`);
  }

  const supabase = await createSupabaseServerClient();
  await assertCanWrite(supabase, "/classes");
  const { data: targetClass, error: classError } = await supabase
    .from("course_classes")
    .select("name, teacher_id")
    .eq("id", classId)
    .maybeSingle();

  if (classError || !targetClass) {
    redirect("/classes?error=Turma+nao+encontrada");
  }

  const teacherName = targetClass.teacher_id
    ? (await supabase
        .from("teachers")
        .select("name")
        .eq("id", targetClass.teacher_id)
        .maybeSingle()).data?.name ?? null
    : null;

  const { error } = await supabase
    .from("students")
    .update({
      class_name: targetClass.name,
      teacher_name: teacherName,
    })
    .eq("id", studentId);

  if (error) {
    redirect(`/classes?editing=${classId}&error=${encodeURIComponent("Nao foi possivel incluir o aluno")}#class-${classId}`);
  }

  revalidateSharedPaths();
  redirect(`/classes?editing=${classId}&updated=${encodeURIComponent("Aluno incluido na turma com sucesso")}#class-${classId}`);
}

export async function removeStudentFromClassAction(studentId: string, classId: string) {
  const supabase = await createSupabaseServerClient();
  await assertCanWrite(supabase, "/classes");

  const { error } = await supabase
    .from("students")
    .update({
      class_name: null,
      teacher_name: null,
    })
    .eq("id", studentId);

  if (error) {
    redirect(`/classes?editing=${classId}&error=${encodeURIComponent("Nao foi possivel remover o aluno da turma")}#class-${classId}`);
  }

  revalidateSharedPaths();
  redirect(`/classes?editing=${classId}&updated=${encodeURIComponent("Aluno removido da turma com sucesso")}#class-${classId}`);
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
