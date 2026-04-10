import Link from "next/link";
import { notFound } from "next/navigation";

import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { getStudentDetails } from "@/lib/students/queries";

import { deleteStudentAction } from "../edit/actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function DeleteStudentPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { error } = await searchParams;
  const { student } = await getStudentDetails(id);

  if (!student) {
    notFound();
  }

  const boundDeleteAction = deleteStudentAction.bind(null, student.id);

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-[rgba(153,27,27,0.18)] bg-white p-7 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[rgb(153,27,27)]">
          Confirmação de exclusão
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
          Excluir {student.full_name}?
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
          Esta ação remove o aluno, os responsáveis vinculados e o responsável financeiro.
          Não será possível desfazer depois.
        </p>
      </div>

      {error ? (
        <div className="rounded-[24px] border border-[rgba(180,83,9,0.18)] bg-[rgba(255,247,237,0.92)] px-5 py-4 text-sm font-medium text-[rgb(146,64,14)] shadow-sm">
          {error}
        </div>
      ) : null}

      <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">
          Aluno selecionado
        </p>
        <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
          {student.full_name}
        </p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Turma/Horário: {student.class_name ?? "-"} • Professor: {student.teacher_name ?? "-"}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/students/${student.id}`}
            className="rounded-xl border border-[var(--border)] bg-white px-5 py-3 text-center text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--panel)]"
          >
            Cancelar
          </Link>
          <form action={boundDeleteAction}>
            <ConfirmSubmitButton
              message="Deseja excluir o aluno?"
              className="w-full rounded-xl bg-[rgb(153,27,27)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
            >
              Confirmar exclusão
            </ConfirmSubmitButton>
          </form>
        </div>
      </div>
    </section>
  );
}
