import { getMonthlyBirthdays } from "@/lib/organization/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function formatBirthday(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const [
    { count: totalStudents },
    { count: classCount },
    { count: teacherCount },
    birthdays,
  ] = await Promise.all([
    supabase.from("students").select("*", { count: "exact", head: true }),
    supabase.from("course_classes").select("*", { count: "exact", head: true }),
    supabase.from("teachers").select("*", { count: "exact", head: true }),
    getMonthlyBirthdays(),
  ]);

  const indicators = [
    { label: "Alunos cadastrados", value: totalStudents ?? 0 },
    { label: "Turmas ativas", value: classCount ?? 0 },
    { label: "Professores", value: teacherCount ?? 0 },
  ];

  return (
    <section className="space-y-8">
      <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Visão geral
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
          Bem-vindo ao painel administrativo da Skill Idiomas.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
          Gerencie alunos, acompanhe os registros cadastrados e exporte os dados da unidade em um ambiente privado e organizado.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {indicators.map((indicator) => (
            <div
              key={indicator.label}
              className="rounded-[22px] border border-[var(--border)] bg-[linear-gradient(180deg,#ffffff,rgba(248,250,252,0.95))] px-5 py-5 shadow-sm"
            >
              <p className="text-sm font-medium leading-6 text-[var(--muted-foreground)]">
                {indicator.label}
              </p>
              <div className="mt-4 inline-flex min-h-14 min-w-14 items-center justify-center rounded-2xl border border-[rgba(14,44,84,0.12)] bg-[var(--panel)] px-4 py-2 text-3xl font-semibold text-[var(--foreground)] shadow-sm">
                {indicator.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Aniversariantes
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
              Alunos que fazem aniversário neste mês
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
              Consulte rapidamente o nome do aluno e o dia exato do aniversário.
            </p>
          </div>
          <div className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]">
            {birthdays.length}
          </div>
        </div>

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
