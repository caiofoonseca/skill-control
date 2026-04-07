"use client";

import Link from "next/link";
import { useState } from "react";

import { CREDIT_CARD_METHOD, PAYMENT_METHOD_OPTIONS } from "@/lib/payments/constants";
import {
  addMonthsToDate,
  formatAmountPerInstallment,
} from "@/lib/payments/schedule";

type InstallmentState = {
  amount: string;
  paymentMethod: string;
  dueDate: string;
  paidAt: string;
  status: "pending" | "resolved";
  description: string;
};

type PaymentPlanFormProps = {
  studentName: string;
  cancelHref: string;
  action: (formData: FormData) => void | Promise<void>;
  error?: string;
};

function buildInstallment(
  index: number,
  amount: string,
  paymentMethod = "",
  baseDate = "",
): InstallmentState {
  const autoResolved = paymentMethod === CREDIT_CARD_METHOD;
  const status: InstallmentState["status"] = autoResolved ? "resolved" : "pending";

  return {
    amount,
    paymentMethod,
    dueDate: addMonthsToDate(baseDate, index),
    paidAt: autoResolved ? baseDate : "",
    status,
    description: "",
  };
}

function rebuildInstallments(
  count: number,
  totalAmount: string,
  defaultPaymentMethod: string,
  baseDate: string,
): InstallmentState[] {
  const defaultAmount = formatAmountPerInstallment(totalAmount, count);
  const autoResolved = defaultPaymentMethod === CREDIT_CARD_METHOD;
  const status: InstallmentState["status"] = autoResolved ? "resolved" : "pending";

  return Array.from({ length: count }, (_, index) => ({
    amount: defaultAmount,
    paymentMethod: defaultPaymentMethod,
    dueDate: addMonthsToDate(baseDate, index),
    paidAt: autoResolved ? baseDate : "",
    status,
    description: "",
  }));
}

export function PaymentPlanForm({
  studentName,
  cancelHref,
  action,
  error,
}: PaymentPlanFormProps) {
  const [paymentType, setPaymentType] = useState("monthly_payment");
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentCount, setInstallmentCount] = useState(1);
  const [totalAmount, setTotalAmount] = useState("");
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState("");
  const [baseDate, setBaseDate] = useState("");
  const [installments, setInstallments] = useState<InstallmentState[]>([
    buildInstallment(0, ""),
  ]);

  function updateInstallment(
    index: number,
    key: keyof InstallmentState,
    value: string,
  ) {
    setInstallments((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  }

  function handlePaymentTypeChange(value: string) {
    const monthlyPayment = value === "monthly_payment";
    const nextCount = monthlyPayment && isInstallment ? installmentCount : 1;

    setPaymentType(value);
    setIsInstallment(monthlyPayment ? isInstallment : false);
    setInstallmentCount(nextCount);
    setInstallments(rebuildInstallments(nextCount, totalAmount, defaultPaymentMethod, baseDate));
  }

  function handleInstallmentToggle(checked: boolean) {
    const nextCount = checked ? installmentCount : 1;

    setIsInstallment(checked);
    setInstallmentCount(nextCount);
    setInstallments(rebuildInstallments(nextCount, totalAmount, defaultPaymentMethod, baseDate));
  }

  function handleInstallmentCountChange(value: number) {
    const nextCount = Math.max(value || 1, 1);

    setInstallmentCount(nextCount);
    setInstallments(rebuildInstallments(nextCount, totalAmount, defaultPaymentMethod, baseDate));
  }

  function handleTotalAmountChange(value: string) {
    const count = isInstallment ? installmentCount : 1;

    setTotalAmount(value);
    setInstallments(rebuildInstallments(count, value, defaultPaymentMethod, baseDate));
  }

  function handleDefaultPaymentMethodChange(value: string) {
    const count = isInstallment ? installmentCount : 1;

    setDefaultPaymentMethod(value);
    setInstallments(rebuildInstallments(count, totalAmount, value, baseDate));
  }

  function handleBaseDateChange(value: string) {
    const count = isInstallment ? installmentCount : 1;

    setBaseDate(value);
    setInstallments(rebuildInstallments(count, totalAmount, defaultPaymentMethod, value));
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Financeiro
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
            Novo pagamento
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Registre uma taxa ou mensalidade para {studentName} e organize as parcelas do pagamento.
          </p>
        </div>

        <Link
          href={cancelHref}
          className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-white"
        >
          Voltar
        </Link>
      </div>

      {error ? (
        <div className="rounded-[24px] border border-[rgba(180,83,9,0.18)] bg-[rgba(255,247,237,0.92)] px-5 py-4 text-sm font-medium text-[rgb(146,64,14)] shadow-sm">
          {error}
        </div>
      ) : null}

      <form action={action} className="space-y-6">
        <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Tipo de pagamento
              <select
                name="payment_type"
                value={paymentType}
                onChange={(event) => handlePaymentTypeChange(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]"
              >
                <option value="enrollment_fee">Taxa de matrícula</option>
                <option value="re_enrollment_fee">Taxa de rematrícula</option>
                <option value="monthly_payment">Mensalidade</option>
              </select>
            </label>

            <label className="block text-sm font-medium text-[var(--foreground)]">
              Título
              <input
                name="title"
                placeholder="Ex.: Mensalidade abril"
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]"
              />
            </label>

            <label className="block text-sm font-medium text-[var(--foreground)]">
              Valor total
              <input
                name="total_amount"
                value={totalAmount}
                onChange={(event) => handleTotalAmountChange(event.target.value)}
                placeholder="0,00"
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]"
                required
              />
            </label>

            <label className="block text-sm font-medium text-[var(--foreground)]">
              Forma de pagamento padrão
              <select
                name="default_payment_method"
                value={defaultPaymentMethod}
                onChange={(event) => handleDefaultPaymentMethodChange(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]"
              >
                <option value="">Selecione</option>
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-[var(--foreground)]">
              Data-base do pagamento
              <input
                name="payment_base_date"
                type="date"
                value={baseDate}
                onChange={(event) => handleBaseDateChange(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]"
              />
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm font-medium text-[var(--foreground)]">
              <input
                type="checkbox"
                name="is_installment"
                checked={isInstallment}
                onChange={(event) => handleInstallmentToggle(event.target.checked)}
                disabled={paymentType !== "monthly_payment"}
              />
              Parcelado
            </label>

            <label className="block text-sm font-medium text-[var(--foreground)]">
              Número de parcelas
              <input
                name="installment_count"
                type="number"
                min={1}
                value={isInstallment ? installmentCount : 1}
                onChange={(event) => handleInstallmentCountChange(Number(event.target.value) || 1)}
                disabled={!isInstallment}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition disabled:opacity-60 focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]"
              />
            </label>
          </div>

          <label className="mt-4 block text-sm font-medium text-[var(--foreground)]">
            Observações
            <textarea
              name="notes"
              rows={4}
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]"
              placeholder="Observações gerais sobre esse pagamento."
            />
          </label>

          {defaultPaymentMethod === CREDIT_CARD_METHOD ? (
            <div className="mt-4 rounded-2xl border border-[rgba(22,101,52,0.16)] bg-[rgba(240,253,244,0.92)] px-4 py-3 text-sm leading-6 text-[rgb(21,128,61)]">
              Pagamentos em cartão de crédito já ficam como resolvidos no momento do cadastro.
            </div>
          ) : null}

          {baseDate ? (
            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm leading-6 text-[var(--muted-foreground)]">
              A primeira parcela ficará em <strong>{new Date(`${baseDate}T12:00:00`).toLocaleDateString("pt-BR")}</strong>{" "}
              e as próximas seguirão no mesmo dia dos meses subsequentes.
            </div>
          ) : null}
        </div>

        <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                Parcelas
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                Ajuste os dados de cada parcela. As datas já são sugeridas a partir da data-base informada.
              </p>
            </div>
            <div className="rounded-full bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]">
              {installments.length} {installments.length === 1 ? "parcela" : "parcelas"}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {installments.map((installment, index) => (
              <div
                key={index}
                className="rounded-[24px] border border-[var(--border)] bg-[var(--panel)] p-5"
              >
                <input
                  type="hidden"
                  name={`installment_number_${index + 1}`}
                  value={index + 1}
                />

                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Parcela {index + 1}
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    Valor da parcela
                    <input
                      name={`installment_amount_${index + 1}`}
                      value={installment.amount}
                      onChange={(event) => updateInstallment(index, "amount", event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]"
                      required
                    />
                  </label>

                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    Método de pagamento
                    <select
                      name={`installment_payment_method_${index + 1}`}
                      value={installment.paymentMethod}
                      onChange={(event) => updateInstallment(index, "paymentMethod", event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]"
                    >
                      <option value="">Selecione</option>
                      {PAYMENT_METHOD_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    Estado do pagamento
                    <select
                      name={`installment_status_${index + 1}`}
                      value={installment.status}
                      onChange={(event) => updateInstallment(index, "status", event.target.value as "pending" | "resolved")}
                      className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]"
                    >
                      <option value="pending">Pendente</option>
                      <option value="resolved">Resolvido</option>
                    </select>
                  </label>

                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    Data prevista
                    <input
                      name={`installment_due_date_${index + 1}`}
                      type="date"
                      value={installment.dueDate}
                      onChange={(event) => updateInstallment(index, "dueDate", event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]"
                    />
                  </label>

                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    Data do pagamento
                    <input
                      name={`installment_paid_at_${index + 1}`}
                      type="date"
                      value={installment.paidAt}
                      onChange={(event) => updateInstallment(index, "paidAt", event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]"
                    />
                  </label>

                  <label className="block text-sm font-medium text-[var(--foreground)] md:col-span-2 xl:col-span-1">
                    Descrição
                    <input
                      name={`installment_description_${index + 1}`}
                      value={installment.description}
                      onChange={(event) => updateInstallment(index, "description", event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link
            href={cancelHref}
            className="rounded-xl border border-[var(--border)] bg-white px-5 py-3 text-center text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--panel)]"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
          >
            Salvar pagamento
          </button>
        </div>
      </form>
    </section>
  );
}
