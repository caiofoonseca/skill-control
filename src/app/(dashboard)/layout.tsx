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
      <div className="mx-auto grid min-h-screen w-full max-w-[86rem] gap-5 px-4 py-4 lg:grid-cols-[276px_minmax(0,1fr)] lg:px-6">
        <aside className="flex max-h-[calc(100vh-2rem)] flex-col rounded-[25px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(231,240,252,0.55))] p-3.5 shadow-sm lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-[21px] bg-[linear-gradient(180deg,rgba(236,28,36,1),rgba(200,22,29,1))] px-3.5 py-3 text-white shadow-lg shadow-[rgba(236,28,36,0.24)]">
            <div className="rounded-[15px] bg-white/95 px-3 py-2">
              <Image
                src="/brand/skill-logo.png"
                alt="Logo da Skill Idiomas"
                width={160}
                height={68}
                className="h-10 w-auto object-contain"
                priority
              />
            </div>
            <p className="mt-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-white/75">
              Skill Idiomas
            </p>
            <h1 className="mt-0.5 text-lg font-semibold leading-tight">
              Gestão Escolar
            </h1>
            <p className="mt-1.5 text-[13px] leading-5 text-white/85">
              Painel administrativo da unidade Graças, Recife.
            </p>
          </div>

          <div className="mt-3">
            <p className="hidden">
              Navegação
            </p>
            <SidebarNavV2 />
          </div>

          <div className="mt-3 rounded-[17px] border border-[var(--border)] bg-white px-3.5 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
              Usuário conectado
            </p>
            <p className="mt-1 truncate text-[13px] font-semibold leading-5 text-[var(--foreground)]">
              {user.email}
            </p>
          </div>
          <form action={logoutAction} className="mt-2">
            <button
              type="submit"
              className="w-full rounded-xl border border-[rgba(153,27,27,0.22)] bg-[rgb(153,27,27)] px-3 py-2 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Sair do aplicativo
            </button>
          </form>
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

            </div>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
