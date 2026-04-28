"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function getTextValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

function normalizeBookName(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleUpperCase("pt-BR");
}

export async function createBookAction(formData: FormData) {
  const rawName = getTextValue(formData, "name");

  if (!rawName) {
    redirect("/books?error=Informe+o+nome+do+livro");
  }

  const name = normalizeBookName(rawName);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("books").insert({ name });

  if (error) {
    redirect("/books?error=Não+foi+possível+salvar+o+livro");
  }

  revalidateSharedPaths();
  redirect("/books?created=Livro+salvo+com+sucesso");
}

export async function updateBookAction(bookId: string, currentName: string, formData: FormData) {
  const rawName = getTextValue(formData, "name");

  if (!rawName) {
    redirect("/books?error=Informe+o+nome+do+livro");
  }

  const name = normalizeBookName(rawName);
  const supabase = await createSupabaseServerClient();

  const { error: bookError } = await supabase
    .from("books")
    .update({ name })
    .eq("id", bookId);

  if (bookError) {
    redirect("/books?error=Não+foi+possível+atualizar+o+livro");
  }

  const { error: studentsError } = await supabase
    .from("students")
    .update({ current_book: name })
    .eq("current_book", currentName);

  if (studentsError) {
    redirect("/books?error=Não+foi+possível+atualizar+os+alunos+vinculados");
  }

  revalidateSharedPaths();
  redirect("/books?updated=Livro+atualizado+com+sucesso");
}

export async function deleteBookAction(bookId: string, bookName: string) {
  const supabase = await createSupabaseServerClient();

  const { count } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("current_book", bookName);

  if ((count ?? 0) > 0) {
    redirect("/books?error=Esse+livro+está+vinculado+a+alunos+e+não+pode+ser+excluído");
  }

  const { error } = await supabase.from("books").delete().eq("id", bookId);

  if (error) {
    redirect("/books?error=Não+foi+possível+excluir+o+livro");
  }

  revalidateSharedPaths();
  redirect("/books?deleted=Livro+excluído+com+sucesso");
}

function revalidateSharedPaths() {
  revalidatePath("/books");
  revalidatePath("/students");
  revalidatePath("/students/new");
  revalidatePath("/students/[id]/edit");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
}
