import { createClassAction, deleteClassAction, updateClassAction } from "./actions";
import { ActionIconButton, ActionIconLink } from "@/components/ui/action-icon";
import { getClassManagementData, getStudentOptions } from "@/lib/organization/queries";
import { moveStudentToClassAction } from "./actions";

type PageProps = {
  searchParams: Promise<{
    created?: string;
    deleted?: string;
    updated?: string;
    error?: string;
    editing?: string;
    viewing?: string;
  }>;
};

export default async function ClassesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [classes, { teacherOptions }] = await Promise.all([
    getClassManagementData(),
    getStudentOptions(),
  ]);
  const editingId = params.editing ?? null;
  const viewingId = params.viewing ?? null;

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Turmas
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
          Gerenciamento de turmas
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
          Cadastre e organize as turmas/horários da unidade, associando cada uma ao professor responsável.
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

      <div className="grid items-start gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Nova turma
          </p>
          <form action={createClassAction} className="mt-5 space-y-4">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Turma/Horário
              <input
                name="name"
                placeholder="Ex.: KIDS CLASS - 15H30 - 17H30"
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]"
              />
            </label>

            <label className="block text-sm font-medium text-[var(--foreground)]">
              Professor responsável
              <select
                name="teacher_id"
                defaultValue=""
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]"
              >
                <option value="">Selecione</option>
                {teacherOptions.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              className="rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Salvar turma
            </button>
          </form>
        </div>

        <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                Turmas cadastradas
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                Veja o professor de cada turma e ajuste a associação quando necessário.
              </p>
            </div>
            <div className="rounded-full bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]">
              {classes.length} {classes.length === 1 ? "turma/horário" : "turmas/horários"}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {classes.length > 0 ? (
              classes.map((item) => {
                const isEditing = editingId === item.id;
                const isViewingStudents = viewingId === item.id;

                return (
                  <div
                    key={item.id}
                    id={`class-${item.id}`}
                    className="rounded-[22px] border border-[var(--border)] bg-[var(--panel)] px-4 py-4 scroll-mt-6"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="max-w-[420px] space-y-1">
                        <p className="text-base font-semibold text-[var(--foreground)]">
                          {item.name}
                        </p>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          Professor: {item.teacherName || "Não definido"}
                        </p>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {item.studentCount} {item.studentCount === 1 ? "aluno vinculado" : "alunos vinculados"}
                        </p>
                      </div>

                      {isEditing ? (
                        <div className="flex flex-col gap-3">
                          <form
                            action={updateClassAction.bind(null, item.id, item.name)}
                            className="flex flex-col gap-3 sm:flex-row sm:flex-wrap"
                          >
                            <input
                              name="name"
                              defaultValue={item.name}
                              aria-label={`Editar turma ${item.name}`}
                              className="min-w-[260px] rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                            />
                            <select
                              name="teacher_id"
                              defaultValue={item.teacher_id ?? ""}
                              className="min-w-[220px] rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                            >
                              <option value="">Selecione</option>
                              {teacherOptions.map((teacher) => (
                                <option key={teacher.id} value={teacher.id}>
                                  {teacher.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="submit"
                              className="rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-white"
                            >
                              Salvar
                            </button>
                          </form>

                          <a
                            href="/classes"
                            className="rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-center text-sm font-semibold text-[var(--foreground)] transition hover:bg-white"
                          >
                            Cancelar
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <ActionIconLink
                            href={
                              isViewingStudents
                                ? `/classes#class-${item.id}`
                                : `/classes?viewing=${item.id}#class-${item.id}`
                            }
                            label={isViewingStudents ? "Ocultar alunos" : "Visualizar alunos"}
                            icon={isViewingStudents ? "hide" : "view"}
                            variant="accent"
                          />

                          <ActionIconLink
                            href={`/classes?editing=${item.id}#class-${item.id}`}
                            label="Editar turma"
                            icon="edit"
                            variant="primary"
                          />

                          <form action={deleteClassAction.bind(null, item.id, item.name)}>
                            <ActionIconButton
                              label="Excluir turma"
                              icon="delete"
                              variant="danger"
                            />
                          </form>
                        </div>
                      )}
                    </div>
                    {isViewingStudents ? (
                    <div className="mt-4 rounded-[18px] border border-[var(--border)] bg-white px-4 py-4">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          Alunos da turma
                        </p>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                          Visualizar e realocar
                        </p>
                      </div>

                      {item.students.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          {item.students.map((student) => (
                            <div
                              key={student.id}
                              className="grid gap-3 rounded-[14px] border border-[var(--border)] bg-[var(--panel)] px-3 py-3 lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.9fr)] lg:items-center"
                            >
                              <div>
                                <a
                                  href={`/students/${student.id}`}
                                  className="text-sm font-semibold text-[var(--foreground)]"
                                >
                                  {student.fullName}
                                </a>
                                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                                  Professor atual: {student.teacherName || "Não definido"}
                                </p>
                              </div>

                              <form
                                action={moveStudentToClassAction.bind(null, student.id)}
                                className="flex flex-col gap-2 sm:flex-row"
                              >
                                <select
                                  name="target_class_id"
                                  defaultValue={item.id}
                                  className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                                >
                                  {classes.map((classOption) => (
                                    <option key={classOption.id} value={classOption.id}>
                                      {classOption.name}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="submit"
                                  className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--background)]"
                                >
                                  Realocar
                                </button>
                              </form>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 rounded-[14px] border border-dashed border-[var(--border)] bg-[var(--panel)] px-4 py-4 text-sm text-[var(--muted-foreground)]">
                          Nenhum aluno vinculado a esta turma.
                        </p>
                      )}
                    </div>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--panel)] px-6 py-10 text-center">
                <p className="text-base font-semibold text-[var(--foreground)]">
                  Nenhuma turma/horário cadastrada ainda.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
