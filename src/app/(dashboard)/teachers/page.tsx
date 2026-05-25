import { createTeacherAction, deleteTeacherAction, updateTeacherAction } from "./actions";
import { ActionIconButton, ActionIconLink } from "@/components/ui/action-icon";
import { getTeacherManagementData } from "@/lib/organization/queries";

type PageProps = {
  searchParams: Promise<{
    created?: string;
    deleted?: string;
    updated?: string;
    error?: string;
    editing?: string;
  }>;
};

type TeacherField = {
  name: "name" | "address" | "cpf" | "rg" | "email" | "phone" | "family_phone";
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: "text" | "email";
};

const teacherFields: TeacherField[] = [
  { name: "name", label: "Nome do professor", required: true, placeholder: "Ex.: Passi", type: "text" },
  { name: "address", label: "Endereço", type: "text" },
  { name: "cpf", label: "CPF", type: "text" },
  { name: "rg", label: "RG", type: "text" },
  { name: "email", label: "E-mail", type: "email" },
  { name: "phone", label: "Celular 01", type: "text" },
  { name: "family_phone", label: "Celular de familiar", type: "text" },
];

export default async function TeachersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const teachers = await getTeacherManagementData();
  const editingId = params.editing ?? null;

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Professores
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
          Gerenciamento de professores
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
          Cadastre os professores da unidade e acompanhe as turmas ligadas a cada um deles.
        </p>
      </div>

      {params.error ? (
        <div className="rounded-[24px] border border-[rgba(180,83,9,0.18)] bg-[rgba(255,247,237,0.92)] px-5 py-4 text-sm font-medium text-[rgb(146,64,14)] shadow-sm">
          {params.error}
        </div>
      ) : null}

      {params.created ? (
        <div className="rounded-[24px] border border-[rgba(22,101,52,0.16)] bg-[rgba(240,253,244,0.92)] px-5 py-4 text-sm font-medium text-[rgb(21,128,61)] shadow-sm">
          {params.created}
        </div>
      ) : null}

      {params.updated ? (
        <div className="rounded-[24px] border border-[rgba(22,101,52,0.16)] bg-[rgba(240,253,244,0.92)] px-5 py-4 text-sm font-medium text-[rgb(21,128,61)] shadow-sm">
          {params.updated}
        </div>
      ) : null}

      {params.deleted ? (
        <div className="rounded-[24px] border border-[rgba(22,101,52,0.16)] bg-[rgba(240,253,244,0.92)] px-5 py-4 text-sm font-medium text-[rgb(21,128,61)] shadow-sm">
          {params.deleted}
        </div>
      ) : null}

      <div className="grid items-start gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Novo professor
          </p>
          <form action={createTeacherAction} className="mt-5 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {teacherFields.map((field) => (
                <label key={field.name} className="block text-sm font-medium text-[var(--foreground)]">
                  {field.label}
                  <input
                    name={field.name}
                    type={field.type ?? "text"}
                    required={field.required}
                    placeholder={field.placeholder}
                    className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]"
                  />
                </label>
              ))}
            </div>
            <button
              type="submit"
              className="rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Salvar professor
            </button>
          </form>
        </div>

        <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                Professores cadastrados
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                Consulte quantas turmas cada professor atende e quais são elas.
              </p>
            </div>
            <div className="rounded-full bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]">
              {teachers.length} {teachers.length === 1 ? "professor" : "professores"}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {teachers.length > 0 ? (
              teachers.map((item) => {
                const isEditing = editingId === item.id;

                return (
                  <div
                    key={item.id}
                    className="rounded-[22px] border border-[var(--border)] bg-[var(--panel)] px-4 py-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="max-w-[520px] space-y-2">
                        <p className="text-base font-semibold text-[var(--foreground)]">
                          {item.name}
                        </p>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {item.phone || item.email || "Contato não informado"}
                        </p>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {item.studentCount} {item.studentCount === 1 ? "aluno vinculado" : "alunos vinculados"}
                        </p>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {item.classCount} {item.classCount === 1 ? "turma associada" : "turmas associadas"}
                        </p>
                        <div className="grid gap-1 pt-1 text-sm text-[var(--muted-foreground)]">
                          <p>CPF: {item.cpf || "-"}</p>
                          <p>RG: {item.rg || "-"}</p>
                          <p>Endereço: {item.address || "-"}</p>
                          <p>Celular de familiar: {item.family_phone || "-"}</p>
                        </div>
                        <div className="space-y-1 pt-1">
                          {item.classNames.length > 0 ? (
                            item.classNames.map((className: string) => (
                              <p
                                key={className}
                                className="text-sm text-[var(--muted-foreground)]"
                              >
                                • {className}
                              </p>
                            ))
                          ) : (
                            <p className="text-sm text-[var(--muted-foreground)]">
                              Nenhuma turma associada
                            </p>
                          )}
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="flex flex-col gap-3">
                          <form
                            action={updateTeacherAction.bind(null, item.id, item.name)}
                            className="grid gap-3 md:grid-cols-2"
                          >
                            {teacherFields.map((field) => (
                              <label key={field.name} className="block text-sm font-medium text-[var(--foreground)]">
                                {field.label}
                                <input
                                  name={field.name}
                                  type={field.type ?? "text"}
                                  required={field.required}
                                  defaultValue={(item[field.name as keyof typeof item] as string | null | undefined) ?? ""}
                                  aria-label={`${field.label} do professor ${item.name}`}
                                  className="mt-2 min-w-[260px] rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                                />
                              </label>
                            ))}
                            <button
                              type="submit"
                              className="rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-white md:col-span-2"
                            >
                              Salvar
                            </button>
                          </form>

                          <a
                            href="/teachers"
                            className="rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-center text-sm font-semibold text-[var(--foreground)] transition hover:bg-white"
                          >
                            Cancelar
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <ActionIconLink
                            href={`/teachers?editing=${item.id}`}
                            label={`Editar professor ${item.name}`}
                            icon="edit"
                            variant="primary"
                          />

                          <form action={deleteTeacherAction.bind(null, item.id, item.name)}>
                            <ActionIconButton
                              label={`Excluir professor ${item.name}`}
                              icon="delete"
                              variant="danger"
                            />
                          </form>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--panel)] px-6 py-10 text-center">
                <p className="text-base font-semibold text-[var(--foreground)]">
                  Nenhum professor cadastrado ainda.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
