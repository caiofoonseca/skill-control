import Link from "next/link";
import { notFound } from "next/navigation";

import {
  deleteInstallmentAction,
  deletePaymentPlanAction,
  updatePaymentInstallmentAction,
} from "@/app/(dashboard)/students/[id]/actions";
import { HashScroll } from "@/components/layout/hash-scroll";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/payments/constants";
import { getStudentDetails } from "@/lib/students/queries";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    updated?: string;
  }>;
};

function DetailGrid({
  items,
  className = "grid gap-4 md:grid-cols-2 xl:grid-cols-3",
}: {
  items: Array<{ label: string; value: string | null | undefined; className?: string }>;
  className?: string;
}) {
  return (
    <div className={className}>
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-[22px] border border-[var(--border)] bg-[var(--panel)] p-4 ${item.className ?? ""}`}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            {item.label}
          </p>
          <p className="mt-3 text-sm font-medium text-[var(--foreground)]">
            {item.value || "-"}
          </p>
        </div>
      ))}
    </div>
  );
}

function formatCurrency(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

function PaymentPlanSection({
  title,
  description,
  plans,
  installments,
  studentId,
}: {
  title: string;
  description: string;
  studentId: string;
  plans: Array<{
    id: string;
    title: string;
    total_amount: string;
    installment_count: number;
    default_payment_method: string | null;
    notes: string | null;
  }>;
  installments: Array<{
    id: string;
    payment_plan_id: string;
    installment_number: number;
    amount: string;
    payment_method: string | null;
    due_date: string | null;
    paid_at: string | null;
    status: "pending" | "resolved";
    description: string | null;
  }>;
}) {
  if (plans.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--panel)] px-6 py-8">
        <p className="text-base font-semibold text-[var(--foreground)]">{title}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {description}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-lg font-semibold text-[var(--foreground)]">{title}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {description}
        </p>
      </div>

      {plans.map((plan) => {
        const planInstallments = installments.filter(
          (installment) => installment.payment_plan_id === plan.id,
        );

        return (
          <div
            key={plan.id}
            className="rounded-[24px] border border-[var(--border)] bg-[var(--panel)] p-5"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-lg font-semibold text-[var(--foreground)]">
                  {plan.title}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Total: {formatCurrency(plan.total_amount)} • {plan.installment_count}{" "}
                  {plan.installment_count === 1 ? "parcela" : "parcelas"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm text-[var(--muted-foreground)]">
                  {plan.default_payment_method || "Forma de pagamento não informada"}
                </div>
                <form action={deletePaymentPlanAction.bind(null, studentId, plan.id)}>
                  <ConfirmSubmitButton
                    message="Deseja excluir o pagamento?"
                    className="rounded-xl border border-[rgba(153,27,27,0.2)] bg-white px-3 py-2 text-sm font-semibold text-[rgb(153,27,27)] transition hover:bg-[rgb(254,242,242)]"
                  >
                    Excluir cobrança
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    <th className="px-3 py-2">Parcela</th>
                    <th className="px-3 py-2">Valor</th>
                    <th className="px-3 py-2">Previsão</th>
                    <th className="px-3 py-2">Atualização</th>
                  </tr>
                </thead>
                <tbody>
                  {planInstallments.map((installment) => (
                    <tr key={installment.id} className="bg-white align-top">
                      <td className="rounded-l-2xl px-3 py-3 text-sm font-medium text-[var(--foreground)]">
                        {installment.installment_number}
                      </td>
                      <td className="px-3 py-3 text-sm text-[var(--foreground)]">
                        {formatCurrency(installment.amount)}
                      </td>
                      <td className="px-3 py-3 text-sm text-[var(--foreground)]">
                        {formatDate(installment.due_date)}
                      </td>
                      <td className="rounded-r-2xl px-3 py-3">
                        <form
                          action={updatePaymentInstallmentAction.bind(
                            null,
                            studentId,
                            installment.id,
                          )}
                          className="space-y-3"
                        >
                          <div className="grid gap-3 md:grid-cols-3">
                            <select
                              name="payment_method"
                              defaultValue={installment.payment_method ?? ""}
                              className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                            >
                              <option value="">Selecione</option>
                              {PAYMENT_METHOD_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                            <input
                              name="paid_at"
                              type="date"
                              defaultValue={installment.paid_at ?? ""}
                              className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                            />
                            <select
                              name="status"
                              defaultValue={installment.status}
                              className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                            >
                              <option value="pending">Pendente</option>
                              <option value="resolved">Resolvido</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-3 md:flex-row">
                            <input
                              name="description"
                              defaultValue={installment.description ?? ""}
                              placeholder="Descrição"
                              className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                            />
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95"
                              >
                                Salvar
                              </button>
                              <ConfirmSubmitButton
                                message="Deseja excluir o pagamento?"
                                formAction={deleteInstallmentAction.bind(
                                  null,
                                  studentId,
                                  plan.id,
                                  installment.id,
                                )}
                                className="rounded-xl border border-[rgba(153,27,27,0.2)] bg-white px-4 py-2 text-sm font-semibold text-[rgb(153,27,27)] transition hover:bg-[rgb(254,242,242)]"
                              >
                                Excluir parcela
                              </ConfirmSubmitButton>
                            </div>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {plan.notes ? (
              <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                {plan.notes}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default async function StudentDetailsPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { updated } = await searchParams;
  const { student, guardians, financialContact, paymentPlans, installments } =
    await getStudentDetails(id);

  if (!student) {
    notFound();
  }

  const primaryGuardian =
    guardians.find((guardian) => guardian.guardian_type === "primary") ?? null;
  const secondaryGuardian =
    guardians.find((guardian) => guardian.guardian_type === "secondary") ?? null;
  const enrollmentPlans = paymentPlans.filter(
    (plan) =>
      plan.payment_type === "enrollment_fee" ||
      plan.payment_type === "re_enrollment_fee" ||
      plan.payment_type === "enrollment" ||
      plan.payment_type === "enrollment_first_installment",
  );
  const monthlyPlans = paymentPlans.filter(
    (plan) => plan.payment_type === "monthly_payment" || plan.payment_type === "installments",
  );
  const otherPlans = paymentPlans.filter(
    (plan) =>
      plan.payment_type === "full_course" ||
      plan.payment_type === "course_material" ||
      plan.payment_type === "down_payment",
  );

  return (
    <section className="space-y-6">
      <HashScroll targetId="pagamentos-do-aluno" />

      <div className="flex flex-col gap-4 rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Detalhes do aluno
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
            {student.full_name}
          </h2>
          {student.is_scholarship ? (
            <p className="mt-3 inline-flex rounded-full bg-[rgba(254,249,195,0.9)] px-3 py-1 text-sm font-semibold text-[rgb(133,77,14)]">
              Aluno bolsista{student.scholarship_discount_percent ? ` - ${student.scholarship_discount_percent}%` : ""}
            </p>
          ) : null}
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Visualização completa do cadastro do aluno, com responsáveis e dados financeiros.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/students/${student.id}/payments/new`}
            className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-white"
          >
            Novo pagamento
          </Link>
          <Link
            href={`/students/${student.id}/edit`}
            className="rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
          >
            Editar
          </Link>
          <Link
            href={`/students/${student.id}/delete`}
            className="rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
          >
            Excluir
          </Link>
        </div>
      </div>

      {updated ? (
        <div className="rounded-[24px] border border-[rgba(22,101,52,0.16)] bg-[rgba(240,253,244,0.92)] px-5 py-4 text-sm font-medium text-[rgb(21,128,61)] shadow-sm">
          Cadastro atualizado com sucesso: {updated}
        </div>
      ) : null}

      <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Aluno
        </p>
        <div className="mt-5 space-y-6">
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Dados pessoais
            </p>
            <div className="mt-3">
              <DetailGrid
                className="grid gap-4 md:grid-cols-2 xl:grid-cols-12"
                items={[
                  { label: "Nome", value: student.full_name, className: "xl:col-span-4" },
                  { label: "Nascimento", value: formatDate(student.birth_date), className: "xl:col-span-3" },
                  { label: "RG", value: student.rg, className: "xl:col-span-2" },
                  { label: "CPF", value: student.cpf, className: "xl:col-span-3" },
                  { label: "Celular", value: student.phone, className: "xl:col-span-3" },
                  { label: "E-mail", value: student.email, className: "md:col-span-2 xl:col-span-4" },
                  { label: "Profissão", value: student.profession, className: "xl:col-span-3" },
                  { label: "Instagram", value: student.instagram, className: "xl:col-span-2" },
                ]}
              />
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Endereço
            </p>
            <div className="mt-3">
              <DetailGrid
                className="grid gap-4 md:grid-cols-2 xl:grid-cols-12"
                items={[
                  { label: "CEP", value: student.zip_code, className: "xl:col-span-2" },
                  { label: "Endereço", value: student.address, className: "md:col-span-2 xl:col-span-8" },
                  { label: "Número", value: student.address_number, className: "xl:col-span-2" },
                  { label: "Complemento", value: student.apartment, className: "xl:col-span-3" },
                  { label: "Bairro", value: student.neighborhood, className: "xl:col-span-3" },
                  { label: "Cidade", value: student.city, className: "xl:col-span-4" },
                  { label: "UF", value: student.state, className: "xl:col-span-2" },
                ]}
              />
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Curso
            </p>
            <div className="mt-3">
              <DetailGrid
                items={[
                  { label: "Status", value: student.is_active ? "Ativo" : "Inativo" },
                  { label: "Bolsista", value: student.is_scholarship ? "Sim" : "Não" },
                  {
                    label: "Desconto bolsista",
                    value: student.scholarship_discount_percent
                      ? `${student.scholarship_discount_percent}%`
                      : null,
                  },
                  { label: "Idioma", value: student.language ?? "Inglês" },
                  { label: "Turma/Horário", value: student.class_name },
                  { label: "Professor", value: student.teacher_name },
                  { label: "Livro atual", value: student.current_book },
                  { label: "Origem", value: student.source },
                ]}
              />
            </div>
          </section>
        </div>
        <div className="mt-6 rounded-[24px] border border-[var(--border)] bg-[var(--panel)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Observações gerais
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--foreground)]">
            {student.payment_notes || "-"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Responsável 1
          </p>
          <div className="mt-5">
            <DetailGrid
              items={[
                { label: "Nome", value: primaryGuardian?.full_name },
                { label: "CPF", value: primaryGuardian?.cpf },
                { label: "Profissão", value: primaryGuardian?.profession },
                { label: "Empresa", value: primaryGuardian?.company },
                { label: "Celular", value: primaryGuardian?.phone },
                { label: "Telefone comercial", value: primaryGuardian?.work_phone },
                { label: "E-mail", value: primaryGuardian?.email },
                { label: "Instagram", value: primaryGuardian?.instagram },
              ]}
            />
          </div>
        </div>

        <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Responsável 2
          </p>
          <div className="mt-5">
            <DetailGrid
              items={[
                { label: "Nome", value: secondaryGuardian?.full_name },
                { label: "CPF", value: secondaryGuardian?.cpf },
                { label: "Profissão", value: secondaryGuardian?.profession },
                { label: "Empresa", value: secondaryGuardian?.company },
                { label: "Celular", value: secondaryGuardian?.phone },
                { label: "Telefone comercial", value: secondaryGuardian?.work_phone },
                { label: "E-mail", value: secondaryGuardian?.email },
                { label: "Instagram", value: secondaryGuardian?.instagram },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Responsável financeiro
        </p>
        <div className="mt-5">
          <DetailGrid
            items={[
              { label: "Nome", value: financialContact?.full_name },
              { label: "CPF", value: financialContact?.cpf },
              { label: "Endereço", value: financialContact?.address },
              { label: "Profissão", value: financialContact?.profession },
              { label: "Empresa", value: financialContact?.company },
              { label: "Celular", value: financialContact?.phone },
              { label: "Telefone comercial", value: financialContact?.work_phone },
              { label: "E-mail", value: financialContact?.email },
              {
                label: "Origem",
                value: financialContact?.source_guardian_type === "primary"
                  ? "Mesmo que o responsável 1"
                  : financialContact?.source_guardian_type === "secondary"
                    ? "Mesmo que o responsável 2"
                    : "Cadastro próprio",
              },
            ]}
          />
        </div>
      </div>

      <div
        id="pagamentos-do-aluno"
        className="scroll-mt-6 rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Financeiro
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
              Pagamentos do aluno
            </h3>
          </div>

          <Link
            href={`/students/${student.id}/payments/new`}
            className="rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
          >
            Cadastrar pagamento
          </Link>
        </div>

        {paymentPlans.length > 0 ? (
          <div className="mt-6 space-y-8">
            <PaymentPlanSection
              title="Matrícula"
              description="Cobranças de matrícula e matrícula com primeira parcela."
              studentId={student.id}
              plans={enrollmentPlans}
              installments={installments}
            />

            <PaymentPlanSection
              title="Parcelas"
              description="Parcelas do curso, com previsão e status de cada pagamento."
              studentId={student.id}
              plans={monthlyPlans}
              installments={installments}
            />

            <PaymentPlanSection
              title="Outros pagamentos"
              description="Curso à vista, material didático, entrada e registros anteriores."
              studentId={student.id}
              plans={otherPlans}
              installments={installments}
            />
          </div>
        ) : (
          <div className="mt-6 rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--panel)] px-6 py-10 text-center">
            <p className="text-lg font-semibold text-[var(--foreground)]">
              Nenhum pagamento cadastrado ainda.
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
              Registre a taxa de matrícula, rematrícula ou mensalidade deste aluno.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
