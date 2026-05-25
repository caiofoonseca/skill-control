import Link from "next/link";

import { getMonthlyBirthdays, getStudentOptions } from "@/lib/organization/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function formatBirthday(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function ExportOptionsPanel({
  eyebrow,
  title,
  description,
  options,
  queryParam,
  emptyMessage,
}: {
  eyebrow: string;
  title: string;
  description: string;
  options: Array<{ id: string; name: string }>;
  queryParam: "class" | "teacher";
  emptyMessage: string;
}) {
  return (
    <details className="group rounded-[28px] border border-[var(--border)] bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none flex-col gap-5 p-7 marker:hidden lg:flex-row lg:items-center lg:justify-between [&::-webkit-details-marker]:hidden">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            {eyebrow}
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
            {title}
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            {description}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]">
            {options.length} opções
          </span>
          <span className="rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition group-open:hidden">
            Ver opções
          </span>
          <span className="hidden rounded-xl border border-[var(--border)] bg-[var(--panel)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] group-open:inline">
            Recolher
          </span>
        </div>
      </summary>

      <div className="border-t border-[var(--border)] px-7 pb-7 pt-5">
        {options.length > 0 ? (
          <div className="max-h-72 overflow-y-auto pr-2">
            <div className="grid gap-3 md:grid-cols-2">
              {options.map((option) => (
                <Link
                  key={option.id}
                  href={`/api/students/export?${queryParam}=${encodeURIComponent(option.name)}`}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-white"
                >
                  {option.name}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--panel)] px-6 py-8 text-center">
            <p className="text-sm text-[var(--muted-foreground)]">
              {emptyMessage}
            </p>
          </div>
        )}
      </div>
    </details>
  );
}

export default async function ReportsPage() {
  const supabase = await createSupabaseServerClient();

  const [{ count: totalStudents }, { classOptions, teacherOptions }, birthdays] = await Promise.all([
    supabase.from("students").select("*", { count: "exact", head: true }),
    getStudentOptions(),
    getMonthlyBirthdays(),
  ]);

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Relatórios
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
          Exportação de dados
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
          Gere planilhas prontas para acompanhamento administrativo com base no cadastro atual de alunos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            Alunos cadastrados
          </p>
          <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
            {totalStudents ?? 0}
          </p>
        </div>

        <div className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            Turmas com cadastro
          </p>
          <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
            {classOptions.length}
          </p>
        </div>

        <div className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            Professores vinculados
          </p>
          <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
            {teacherOptions.length}
          </p>
        </div>

        <div className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            Aniversariantes do mês
          </p>
          <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
            {birthdays.length}
          </p>
        </div>
      </div>

      <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Exportação geral
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
              Base completa de alunos
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
              Baixe uma planilha com todos os alunos cadastrados, incluindo turma, professor e dados básicos de contato.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto lg:ml-auto lg:items-end">
            <Link
              href="/api/students/export"
              className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 text-center text-sm font-semibold text-white transition hover:opacity-95 sm:w-64"
            >
              Exportar para Excel
            </Link>
            <Link
              href="/reports/print"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-5 py-3 text-center text-sm font-semibold text-[var(--foreground)] transition hover:bg-white sm:w-64"
            >
              Abrir versão para impressão
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-5">
        <ExportOptionsPanel
          eyebrow="Por turma"
          title="Exportações por turma"
          description="Gere arquivos separados para cada turma cadastrada no sistema."
          options={classOptions}
          queryParam="class"
          emptyMessage="Nenhuma turma cadastrada até o momento."
        />

        <ExportOptionsPanel
          eyebrow="Por professor"
          title="Exportações por professor"
          description="Exporte apenas os alunos vinculados a cada professor cadastrado."
          options={teacherOptions}
          queryParam="teacher"
          emptyMessage="Nenhum professor cadastrado até o momento."
        />
      </div>

      <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Aniversariantes
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
          Alunos que fazem aniversário neste mês
        </h3>
        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
          Consulte rapidamente o nome do aluno e o dia exato do aniversário.
        </p>

        <div className="mt-6 space-y-3">
          {birthdays.length > 0 ? (
            birthdays.map((birthday) => (
              <div
                key={birthday.id}
                className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3"
              >
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {birthday.fullName}
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {formatBirthday(birthday.birthDate)}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--panel)] px-6 py-8 text-center">
              <p className="text-sm text-[var(--muted-foreground)]">
                Nenhum aniversariante encontrado para este mês.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
