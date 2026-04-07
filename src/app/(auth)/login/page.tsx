import Image from "next/image";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import { loginAction } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createSupabaseServerClient();
  const [{ data }, params] = await Promise.all([
    supabase.auth.getUser(),
    searchParams,
  ]);

  if (data.user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[var(--background)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(236,28,36,0.14),_transparent_26%),radial-gradient(circle_at_right,_rgba(31,93,168,0.12),_transparent_24%),linear-gradient(160deg,_rgba(20,48,95,0.04),_rgba(20,48,95,0))]" />
      <section className="relative mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-6 py-16 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-12">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex rounded-[28px] border border-white/70 bg-white/90 px-4 py-3 shadow-sm">
            <Image
              src="/brand/skill-logo.png"
              alt="Logo da Skill Idiomas"
              width={140}
              height={60}
              className="h-12 w-auto object-contain"
              priority
            />
          </div>

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">
            Acesso interno
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
            Painel privado da Skill Idiomas
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted-foreground)]">
            Acesso exclusivo para a equipe administrativa da escola
          </p>
        </div>

        <div className="rounded-[32px] border border-white/80 bg-white/92 p-6 shadow-2xl shadow-[rgba(20,48,95,0.10)] backdrop-blur">
          <div className="rounded-[24px] bg-[var(--surface)] p-6 sm:p-8">
            <div className="mb-8">
              <p className="text-sm font-medium text-[var(--accent)]">
                Skill Control
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
                Entrar
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                Informe seu e-mail e sua senha para acessar o sistema.
              </p>
            </div>

            <form action={loginAction} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-[var(--foreground)]"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="voce@skilledidiomas.com"
                  className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(236,28,36,0.16)]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-[var(--foreground)]"
                >
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Digite sua senha"
                  className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(236,28,36,0.16)]"
                  required
                />
              </div>

              {params.error ? (
                <div className="rounded-2xl border border-[rgba(180,83,9,0.18)] bg-[rgba(255,247,237,0.92)] px-4 py-3 text-sm text-[rgb(146,64,14)]">
                  {params.error}
                </div>
              ) : null}

              <button
                type="submit"
                className="w-full rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(236,28,36,0.24)] transition hover:bg-[var(--primary-strong)]"
              >
                Entrar no painel
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
