import Image from "next/image";
import { redirect } from "next/navigation";

import { TabSessionGuard } from "@/components/auth/tab-session-guard";
import { SidebarNavV2 } from "@/components/layout/sidebar-nav-v2";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { logoutAction } from "./actions";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <TabSessionGuard />
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6">
        <aside className="rounded-[32px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(231,240,252,0.55))] p-5 shadow-sm">
          <div className="rounded-[24px] bg-[linear-gradient(180deg,rgba(236,28,36,1),rgba(200,22,29,1))] px-5 py-5 text-white shadow-lg shadow-[rgba(236,28,36,0.24)]">
            <div className="rounded-[18px] bg-white/95 px-3 py-3">
              <Image
                src="/brand/skill-logo.png"
                alt="Logo da Skill Idiomas"
                width={160}
                height={68}
                className="h-14 w-auto object-contain"
                priority
              />
            </div>
            <p className="mt-4 text-sm font-medium text-white/80">Skill Idiomas</p>
            <h1 className="mt-1 text-2xl font-semibold">Gestão Escolar</h1>
            <p className="mt-3 text-sm leading-6 text-white/85">
              Painel administrativo da unidade de Graças, Recife.
            </p>
          </div>

          <div className="mt-6">
            <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
              Navegação
            </p>
            <SidebarNavV2 />
          </div>

          <div className="mt-6 rounded-[24px] border border-[var(--border)] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
              Usuário conectado
            </p>
            <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
              {user.email}
            </p>
          </div>
        </aside>

        <div className="flex min-h-full flex-col gap-6">
          <header className="rounded-[28px] border border-[var(--border)] bg-white/92 px-5 py-4 shadow-sm backdrop-blur sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--accent)]">
                  Gestão Escolar - Skill Idiomas
                </p>
                <div className="mt-1 flex items-center gap-3">
                  <h2 className="text-2xl font-semibold text-[var(--foreground)]">
                    Painel administrativo
                  </h2>
                  <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                    Privado
                  </span>
                </div>
              </div>

              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)]"
                >
                  Sair
                </button>
              </form>
            </div>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
