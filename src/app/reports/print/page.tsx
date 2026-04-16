import Link from "next/link";
import { redirect } from "next/navigation";

import { PrintButton } from "@/components/ui/print-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function isMissingStudentColumn(error: { message?: string } | null) {
  return error?.message?.includes("is_scholarship") || false;
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

export default async function PrintReportsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const studentsResult = await supabase
    .from("students")
    .select("id, full_name, class_name, teacher_name, phone, email, city, state, birth_date, is_active, is_scholarship")
    .order("full_name", { ascending: true });

  let students = studentsResult.data;

  if (isMissingStudentColumn(studentsResult.error)) {
    const fallbackResult = await supabase
      .from("students")
      .select("id, full_name, class_name, teacher_name, phone, email, city, state, birth_date, is_active")
      .order("full_name", { ascending: true });

    students =
      fallbackResult.data?.map((student) => ({
        ...student,
        is_scholarship: false,
      })) ?? null;
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-6 sm:px-6 print:bg-white print:px-0 print:py-0">
      <section className="mx-auto max-w-7xl space-y-6 print:max-w-none print:space-y-0">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm print:hidden">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Impressão
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
              Relatório de alunos
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/reports"
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-white"
            >
              Voltar
            </Link>
            <PrintButton
              className="rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
            />
          </div>
        </div>

        <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm print:rounded-none print:border-none print:p-0 print:shadow-none">
          <div className="border-b border-[var(--border)] pb-5 print:mb-3 print:pb-3">
            <h1 className="text-3xl font-semibold text-[var(--foreground)] print:text-2xl">
              Skill Control
            </h1>
            <p className="mt-2 text-sm text-[var(--muted-foreground)] print:mt-1 print:text-xs">
              Relatório organizado para impressão da base de alunos.
            </p>
          </div>

          <div className="mt-6 overflow-x-auto print:mt-3 print:overflow-visible">
            <table className="min-w-full table-fixed border-collapse text-sm print:w-full print:text-[9px]">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)] print:text-[8px] print:tracking-[0.04em]">
                  <th className="w-[17%] px-3 py-3 print:px-1.5 print:py-1.5">Aluno</th>
                  <th className="w-[19%] px-3 py-3 print:px-1.5 print:py-1.5">Turma</th>
                  <th className="w-[13%] px-3 py-3 print:px-1.5 print:py-1.5">Professor</th>
                  <th className="w-[22%] px-3 py-3 print:px-1.5 print:py-1.5">Contato</th>
                  <th className="w-[11%] px-3 py-3 print:px-1.5 print:py-1.5">Cidade/UF</th>
                  <th className="w-[10%] px-3 py-3 print:px-1.5 print:py-1.5">Nascimento</th>
                  <th className="w-[8%] px-3 py-3 print:px-1.5 print:py-1.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {(students ?? []).map((student) => (
                  <tr key={student.id} className="border-b border-[rgba(148,163,184,0.22)] align-top">
                    <td className="px-3 py-3 font-medium text-[var(--foreground)] print:px-1.5 print:py-1.5">
                      <div className="break-words">{student.full_name}</div>
                      {student.is_scholarship ? (
                        <div className="mt-1 text-xs font-semibold text-[rgb(133,77,14)] print:text-[9px]">
                          Bolsista
                        </div>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-[var(--foreground)] print:px-1.5 print:py-1.5">
                      <div className="break-words">{student.class_name || "-"}</div>
                    </td>
                    <td className="px-3 py-3 text-[var(--foreground)] print:px-1.5 print:py-1.5">
                      <div className="break-words">{student.teacher_name || "-"}</div>
                    </td>
                    <td className="px-3 py-3 text-[var(--foreground)] print:px-1.5 print:py-1.5">
                      <div className="break-words">{student.phone || "-"}</div>
                      <div className="mt-1 break-all text-[var(--muted-foreground)] print:mt-0.5">
                        {student.email || "-"}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[var(--foreground)] print:px-1.5 print:py-1.5">
                      <div className="break-words">
                        {[student.city, student.state].filter(Boolean).join(" / ") || "-"}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[var(--foreground)] print:px-1.5 print:py-1.5">
                      {formatDate(student.birth_date)}
                    </td>
                    <td className="px-3 py-3 text-[var(--foreground)] print:px-1.5 print:py-1.5">
                      {student.is_active ? "Ativo" : "Inativo"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
