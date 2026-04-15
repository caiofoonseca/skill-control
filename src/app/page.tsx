import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/dashboard" : "/login");

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[var(--background)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(197,162,95,0.18),_transparent_32%),linear-gradient(135deg,_rgba(11,31,58,0.05),_rgba(11,31,58,0))]" />

      <section className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-16 sm:px-10 lg:px-12">
        <div className="mb-8 inline-flex w-fit items-center rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-medium text-[var(--primary)] shadow-sm backdrop-blur">
          Skill Idiomas • Graças, Recife
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
              Painel administrativo privado
            </p>

            <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
              Skill Control
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted-foreground)]">
              Acesse o painel administrativo da unidade e gerencie alunos com
              segurança e praticidade.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <div className="rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(11,31,58,0.18)]">
                Painel administrativo
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-white/80 px-5 py-3 text-sm text-[var(--foreground)] backdrop-blur">
                Acesso privado
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/82 p-6 shadow-2xl shadow-[rgba(15,23,42,0.08)] backdrop-blur">
            <div className="rounded-[24px] bg-[var(--panel)] p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--muted-foreground)]">
                    Estrutura preparada
                  </p>
                  <h2 className="text-2xl font-semibold text-[var(--foreground)]">
                    Skill Control
                  </h2>
                </div>
                <div className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                  v0.1
                </div>
              </div>

              <div className="space-y-3">
                {[
                  "Next.js com App Router",
                  "TypeScript configurado",
                  "Tailwind CSS ativo",
                  "Estrutura src/ organizada",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3"
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
