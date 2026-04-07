import Link from "next/link";

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

  const shortcuts = [
    {
      href: "/students",
      eyebrow: "Alunos",
      title: "Gerenciar alunos",
      description: "Abra a listagem completa, aplique filtros e consulte os cadastros.",
    },
    {
      href: "/classes",
      eyebrow: "Turmas",
      title: "Gerenciar turmas",
      description: "Cadastre turmas e defina o professor responsável por cada uma.",
    },
    {
      href: "/teachers",
      eyebrow: "Professores",
      title: "Gerenciar professores",
      description: "Acompanhe os professores e as turmas associadas a cada um deles.",
    },
    {
      href: "/reports",
      eyebrow: "Relatórios",
      title: "Exportar dados",
      description: "Acesse as exportações disponíveis em CSV para planilhas.",
    },
  ];

  return (
    <section className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
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

        <div className="rounded-[28px] border border-[var(--border)] bg-[linear-gradient(160deg,rgba(16,35,61,0.98),rgba(27,50,85,0.96))] p-7 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[rgba(245,230,202,0.86)]">
            Ações rápidas
          </p>
          <div className="mt-5 space-y-3">
            {shortcuts.map((shortcut) => (
              <Link
                key={shortcut.href}
                href={shortcut.href}
                className="block rounded-2xl border border-white/10 bg-white/8 px-4 py-4 transition hover:border-white/20 hover:bg-white/12"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
                  {shortcut.eyebrow}
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {shortcut.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/78">
                  {shortcut.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.15fr]">
        <div className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            Cadastro de alunos
          </p>
          <h3 className="mt-3 text-xl font-semibold text-[var(--foreground)]">
            Registros centralizados
          </h3>
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
            Consulte, cadastre, edite e acompanhe os dados dos alunos em um único lugar.
          </p>
        </div>

        <div className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            Segurança
          </p>
          <h3 className="mt-3 text-xl font-semibold text-[var(--foreground)]">
            Acesso restrito
          </h3>
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
            Apenas usuários autorizados podem acessar a área administrativa.
          </p>
        </div>

        <div className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--muted-foreground)]">
                Aniversariantes do mês
              </p>
              <h3 className="mt-3 text-xl font-semibold text-[var(--foreground)]">
                {birthdays.length > 0 ? "Acompanhe os aniversários" : "Nenhum aniversário neste mês"}
              </h3>
            </div>
            <div className="rounded-full bg-[var(--panel)] px-3 py-1.5 text-sm font-semibold text-[var(--foreground)]">
              {birthdays.length}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {birthdays.length > 0 ? (
              birthdays.map((birthday) => (
                <div
                  key={birthday.id}
                  className="flex items-center justify-between rounded-2xl bg-[var(--panel)] px-4 py-3"
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
              <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                Assim que houver alunos com aniversário neste mês, eles aparecerão aqui com a data exata.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
