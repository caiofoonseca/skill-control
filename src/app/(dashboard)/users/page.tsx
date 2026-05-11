import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isMasterUser } from "@/lib/users/permissions";

import {
  createUserAction,
  saveCurrentUserProfileAction,
  updateUserProfileAction,
} from "./actions";

type PageProps = {
  searchParams: Promise<{
    error?: string;
    updated?: string;
  }>;
};

function roleLabel(role: string) {
  if (role === "master") return "MASTER";
  if (role === "viewer") return "Visualizador";
  return "Secretaria";
}

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isMaster = isMasterUser(user?.email);

  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("*")
    .order("email", { ascending: true });

  const currentProfile = profiles?.find((profile) => profile.id === user?.id);

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Usuarios
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
          Cadastro de usuarios
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
          Usuarios MASTER podem criar acessos para Secretaria ou Visualizador.
        </p>
      </div>

      {params.error ? (
        <div className="rounded-[24px] border border-[rgba(180,83,9,0.18)] bg-[rgba(255,247,237,0.92)] px-5 py-4 text-sm font-medium text-[rgb(146,64,14)] shadow-sm">
          {params.error}
        </div>
      ) : null}

      {params.updated ? (
        <div className="rounded-[24px] border border-[rgba(22,101,52,0.16)] bg-[rgba(240,253,244,0.92)] px-5 py-4 text-sm font-medium text-[rgb(21,128,61)] shadow-sm">
          {params.updated}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Perfil atual
            </p>
            <form action={saveCurrentUserProfileAction} className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                E-mail
                <input
                  value={user?.email ?? ""}
                  readOnly
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--foreground)] outline-none"
                />
              </label>

              <label className="block text-sm font-medium text-[var(--foreground)]">
                Nome
                <input
                  name="full_name"
                  defaultValue={currentProfile?.full_name ?? ""}
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                />
              </label>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                  Nivel de acesso
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">
                  {isMaster ? "MASTER" : roleLabel(currentProfile?.role ?? "secretary")}
                </p>
              </div>

              <button
                type="submit"
                className="rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Salvar meu perfil
              </button>
            </form>
          </div>

          {isMaster ? (
            <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                Novo usuario
              </p>
              <form action={createUserAction} className="mt-5 space-y-4">
                <label className="block text-sm font-medium text-[var(--foreground)]">
                  E-mail
                  <input
                    name="email"
                    type="email"
                    required
                    className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                  />
                </label>

                <label className="block text-sm font-medium text-[var(--foreground)]">
                  Senha inicial
                  <input
                    name="password"
                    type="password"
                    minLength={6}
                    required
                    className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                  />
                </label>

                <label className="block text-sm font-medium text-[var(--foreground)]">
                  Nome
                  <input
                    name="full_name"
                    className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                  />
                </label>

                <label className="block text-sm font-medium text-[var(--foreground)]">
                  Perfil
                  <select
                    name="role"
                    defaultValue="secretary"
                    className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                  >
                    <option value="secretary">Secretaria</option>
                    <option value="viewer">Visualizador</option>
                  </select>
                </label>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm leading-6 text-[var(--muted-foreground)]">
                  Secretaria pode cadastrar e editar, mas não excluir. Visualizador apenas consulta as telas.
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
                >
                  Criar usuario
                </button>
              </form>
            </div>
          ) : null}
        </div>

        <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Usuarios cadastrados
          </p>
          <div className="mt-5 space-y-3">
            {(profiles ?? []).length > 0 ? (
              profiles?.map((profile) => {
                const profileIsMaster = isMasterUser(profile.email);
                const canEditProfile =
                  isMaster && (!profileIsMaster || profile.id === user?.id);

                return (
                  <div
                    key={profile.id}
                    className="rounded-[20px] border border-[var(--border)] bg-[var(--panel)] px-4 py-4"
                  >
                    <div className="flex flex-col gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {profile.full_name || profile.email}
                        </p>
                        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                          {profile.email}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--foreground)]">
                            {profileIsMaster ? "MASTER" : roleLabel(profile.role)}
                          </span>
                          {profile.can_access_financial && !profileIsMaster ? (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                              Financeiro
                            </span>
                          ) : null}
                          {!profile.active ? (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
                              Inativo
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {canEditProfile ? (
                        <form
                          action={updateUserProfileAction.bind(null, profile.id)}
                          className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_auto]"
                        >
                          <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                            Nome
                            <input
                              name="full_name"
                              defaultValue={profile.full_name ?? ""}
                              className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm normal-case tracking-normal text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                            />
                          </label>

                          {profileIsMaster ? (
                            <div className="block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                              Perfil
                              <div className="mt-1.5 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm normal-case tracking-normal text-[var(--foreground)]">
                                MASTER
                              </div>
                            </div>
                          ) : (
                            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                              Perfil
                              <select
                                name="role"
                                defaultValue={profile.role === "viewer" ? "viewer" : "secretary"}
                                className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm normal-case tracking-normal text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                              >
                                <option value="secretary">Secretaria</option>
                                <option value="viewer">Visualizador</option>
                              </select>
                            </label>
                          )}

                          <div className="flex items-end gap-3">
                            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                              <input
                                name="active"
                                type="checkbox"
                                defaultChecked={profile.active}
                                disabled={profileIsMaster}
                                className="h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)] disabled:opacity-60"
                              />
                              Ativo
                            </label>
                            <button
                              type="submit"
                              className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95"
                            >
                              Salvar
                            </button>
                          </div>
                        </form>
                      ) : profileIsMaster ? (
                        <p className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--muted-foreground)]">
                          Outro usuario MASTER nao pode ser editado por esta tela.
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="rounded-[20px] border border-dashed border-[var(--border)] bg-[var(--panel)] px-5 py-8 text-center text-sm text-[var(--muted-foreground)]">
                Nenhum perfil cadastrado ainda.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
