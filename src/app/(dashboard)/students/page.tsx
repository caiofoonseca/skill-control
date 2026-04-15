import Link from "next/link";

import { getStudentOptions } from "@/lib/organization/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams: Promise<{
    created?: string;
    deleted?: string;
    updated?: string;
    q?: string;
    class?: string;
    teacher?: string;
  }>;
};

function isMissingNewStudentColumn(error: { message?: string } | null) {
  return error?.message?.includes("is_active")
    || error?.message?.includes("language")
    || error?.message?.includes("is_scholarship")
    || false;
}

export default async function StudentsPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const params = await searchParams;
  const searchQuery = params.q?.trim() ?? "";
  const classFilter = params.class?.trim() ?? "";
  const teacherFilter = params.teacher?.trim() ?? "";

  let studentsQuery = supabase
    .from("students")
    .select("id, full_name, class_name, teacher_name, phone, email, created_at, is_active, is_scholarship, language")
    .order("created_at", { ascending: false });

  if (searchQuery) {
    studentsQuery = studentsQuery.or(
      `full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`,
    );
  }

  if (classFilter) {
    studentsQuery = studentsQuery.eq("class_name", classFilter);
  }

  if (teacherFilter) {
    studentsQuery = studentsQuery.eq("teacher_name", teacherFilter);
  }

  const studentsResult = await studentsQuery;
  let students = studentsResult.data;
  let error = studentsResult.error;

  if (isMissingNewStudentColumn(error)) {
    let fallbackQuery = supabase
      .from("students")
      .select("id, full_name, class_name, teacher_name, phone, email, created_at")
      .order("created_at", { ascending: false });

    if (searchQuery) {
      fallbackQuery = fallbackQuery.or(
        `full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`,
      );
    }

    if (classFilter) {
      fallbackQuery = fallbackQuery.eq("class_name", classFilter);
    }

    if (teacherFilter) {
      fallbackQuery = fallbackQuery.eq("teacher_name", teacherFilter);
    }

    const fallbackResult = await fallbackQuery;
    students =
      fallbackResult.data?.map((student) => ({
        ...student,
        is_active: true,
        is_scholarship: false,
        language: "Inglês",
      })) ?? null;
    error = fallbackResult.error;
  }

  const { classOptions, teacherOptions } = await getStudentOptions();

  const exportParams = new URLSearchParams();
  if (searchQuery) exportParams.set("q", searchQuery);
  if (classFilter) exportParams.set("class", classFilter);
  if (teacherFilter) exportParams.set("teacher", teacherFilter);

  const exportHref = `/api/students/export${
    exportParams.toString() ? `?${exportParams.toString()}` : ""
  }`;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Alunos
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
            Cadastro e consulta de alunos
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Consulte os registros da unidade, aplique filtros e exporte a listagem quando necessário.
          </p>
        </div>

        <Link
          href="/students/new"
          className="rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
        >
          Novo aluno
        </Link>
      </div>

      <div className="rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-sm">
        <form className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto_auto]">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Buscar
            <input
              name="q"
              defaultValue={searchQuery}
              placeholder="Nome, e-mail ou celular"
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]"
            />
          </label>

          <label className="block text-sm font-medium text-[var(--foreground)]">
            Turma/Horário
            <select
              name="class"
              defaultValue={classFilter}
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]"
            >
              <option value="">Todas</option>
              {classOptions.map((option) => (
                <option key={option.id} value={option.name}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-[var(--foreground)]">
            Professor
            <select
              name="teacher"
              defaultValue={teacherFilter}
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]"
            >
              <option value="">Todos</option>
              {teacherOptions.map((option) => (
                <option key={option.id} value={option.name}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="self-end rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
          >
            Filtrar
          </button>

          <Link
            href={exportHref}
            className="self-end rounded-xl border border-[var(--border)] bg-[var(--panel)] px-5 py-3 text-center text-sm font-semibold text-[var(--foreground)] transition hover:bg-white"
          >
            Exportar para Excel
          </Link>
        </form>

        {(searchQuery || classFilter || teacherFilter) && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-sm font-medium text-[var(--muted-foreground)]">
              Filtros ativos
            </p>
            {searchQuery ? (
              <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                Busca: {searchQuery}
              </span>
            ) : null}
            {classFilter ? (
              <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                Turma/Horário: {classFilter}
              </span>
            ) : null}
            {teacherFilter ? (
              <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                Professor: {teacherFilter}
              </span>
            ) : null}
            <Link
              href="/students"
              className="text-sm font-semibold text-[var(--foreground)]"
            >
              Limpar filtros
            </Link>
          </div>
        )}
      </div>

      {params.created ? (
        <div className="rounded-[24px] border border-[rgba(22,101,52,0.16)] bg-[rgba(240,253,244,0.92)] px-5 py-4 text-sm font-medium text-[rgb(21,128,61)] shadow-sm">
          Aluno salvo com sucesso: {params.created}
        </div>
      ) : null}

      {params.deleted ? (
        <div className="rounded-[24px] border border-[rgba(22,101,52,0.16)] bg-[rgba(240,253,244,0.92)] px-5 py-4 text-sm font-medium text-[rgb(21,128,61)] shadow-sm">
          {params.deleted}
        </div>
      ) : null}

      {params.updated ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.44)] px-4 py-6">
          <div className="w-full max-w-md rounded-lg border border-[rgba(22,101,52,0.16)] bg-white p-6 shadow-2xl shadow-[rgba(15,23,42,0.22)]">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              Cadastro atualizado com sucesso
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
              Aluno: {params.updated}
            </p>
            <div className="mt-6 flex justify-end">
              <Link
                href="/students"
                className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
              >
                OK
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            Total de alunos
          </p>
          <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
            {students?.length ?? 0}
          </p>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Considerando os filtros aplicados
          </p>
        </div>

        <div className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            Filtros ativos
          </p>
          <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
            {[searchQuery, classFilter, teacherFilter].filter(Boolean).length}
          </p>
        </div>

        <div className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            Exportação
          </p>
          <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
            CSV
          </p>
        </div>
      </div>

      <div className="rounded-[28px] border border-[var(--border)] bg-white p-4 shadow-sm sm:p-5">
        {error ? (
          <div className="rounded-[20px] border border-[rgba(180,83,9,0.18)] bg-[rgba(255,247,237,0.92)] px-5 py-4 text-sm font-medium text-[rgb(146,64,14)]">
            Não foi possível carregar a listagem neste momento.
          </div>
        ) : students && students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  <th className="px-4 py-2">Aluno</th>
                  <th className="px-4 py-2">Turma/Horário</th>
                  <th className="px-4 py-2">Professor</th>
                  <th className="px-4 py-2">Contato</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="rounded-2xl bg-[var(--panel)]">
                    <td className="rounded-l-2xl px-4 py-4">
                      <div className="font-semibold text-[var(--foreground)]">
                        {student.full_name}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
                        <span>
                          Cadastrado em{" "}
                          {new Date(student.created_at).toLocaleDateString("pt-BR")}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            student.is_active
                              ? "bg-[rgba(240,253,244,0.92)] text-[rgb(21,128,61)]"
                              : "bg-[rgba(241,245,249,0.96)] text-[var(--muted-foreground)]"
                          }`}
                        >
                          {student.is_active ? "Ativo" : "Inativo"}
                        </span>
                        {student.is_scholarship ? (
                          <span className="rounded-full bg-[rgba(254,249,195,0.9)] px-2 py-0.5 text-xs font-semibold text-[rgb(133,77,14)]">
                            Bolsista
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--foreground)]">
                      {student.class_name ?? "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--foreground)]">
                      {student.teacher_name ?? "-"}
                    </td>
                    <td className="rounded-r-2xl px-4 py-4 text-sm text-[var(--foreground)]">
                      <div>{student.phone ?? "-"}</div>
                      <div className="mt-1 text-[var(--muted-foreground)]">
                        {student.email ?? "-"}
                      </div>
                      <div className="mt-3 flex gap-3">
                        <Link
                          href={`/students/${student.id}`}
                          className="text-sm font-semibold text-[var(--accent)]"
                        >
                          Ver detalhes
                        </Link>
                        <Link
                          href={`/students/${student.id}#pagamentos-do-aluno`}
                          className="text-sm font-semibold text-[var(--foreground)]"
                        >
                          Visualizar pagamentos
                        </Link>
                        <Link
                          href={`/students/${student.id}/edit`}
                          className="text-sm font-semibold text-[var(--foreground)]"
                        >
                          Editar
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--panel)] px-6 py-12 text-center">
            <p className="text-lg font-semibold text-[var(--foreground)]">
              Nenhum aluno cadastrado ainda.
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
              Cadastre o primeiro aluno ou revise os filtros aplicados.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/students/new"
                className="inline-flex rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Cadastrar primeiro aluno
              </Link>
              {(searchQuery || classFilter || teacherFilter) && (
                <Link
                  href="/students"
                  className="inline-flex rounded-xl border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--panel)]"
                >
                  Limpar filtros
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
