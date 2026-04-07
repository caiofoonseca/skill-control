"use client";

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

function rebuildInstallments(
  count: number,
  totalAmount: string,
  defaultPaymentMethod: string,
  baseDate: string,
) {
  const defaultAmount = formatAmountPerInstallment(totalAmount, count);
  const autoResolved = defaultPaymentMethod === CREDIT_CARD_METHOD;

  return Array.from({ length: count }, (_, index) => ({
    amount: defaultAmount,
    paymentMethod: defaultPaymentMethod,
    dueDate: addMonthsToDate(baseDate, index),
    paidAt: autoResolved ? baseDate : "",
    status: autoResolved ? "resolved" : "pending",
    description: "",
  }));
}

export function InlinePaymentFields() {
  const [enabled, setEnabled] = useState(false);
  const [paymentType, setPaymentType] = useState("monthly_payment");
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentCount, setInstallmentCount] = useState(1);
  const [totalAmount, setTotalAmount] = useState("");
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState("");
  const [baseDate, setBaseDate] = useState("");
  const [installments, setInstallments] = useState<InstallmentState[]>([
    {
      amount: "",
      paymentMethod: "",
      dueDate: "",
      paidAt: "",
      status: "pending",
      description: "",
    },
  ]);

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

  return (
    <div className="mt-6 rounded-[24px] border border-[var(--border)] bg-[var(--panel)] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            Pagamentos
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Se quiser, já deixe a taxa ou a primeira mensalidade cadastrada ao criar o aluno.
          </p>
        </div>

        <label className="inline-flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--foreground)]">
          <input
            type="checkbox"
            name="create_initial_payment"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
          />
          Adicionar primeiro pagamento
        </label>
      </div>

      {enabled ? (
        <div className="mt-6 space-y-5">
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
                name="payment_title"
                placeholder="Ex.: Mensalidade abril"
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]"
              />
            </label>

            <label className="block text-sm font-medium text-[var(--foreground)]">
              Valor total
              <input
                name="payment_total_amount"
                value={totalAmount}
                onChange={(event) => handleTotalAmountChange(event.target.value)}
                placeholder="0,00"
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]"
              />
            </label>

            <label className="block text-sm font-medium text-[var(--foreground)]">
              Forma de pagamento padrão
              <select
                name="payment_default_method"
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

            <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium text-[var(--foreground)]">
              <input
                type="checkbox"
                name="payment_is_installment"
                checked={isInstallment}
                onChange={(event) => handleInstallmentToggle(event.target.checked)}
                disabled={paymentType !== "monthly_payment"}
              />
              Parcelado
            </label>

            <label className="block text-sm font-medium text-[var(--foreground)]">
              Número de parcelas
              <input
                name="payment_installment_count"
                type="number"
                min={1}
                value={isInstallment ? installmentCount : 1}
                onChange={(event) => handleInstallmentCountChange(Number(event.target.value) || 1)}
                disabled={!isInstallment}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition disabled:opacity-60 focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]"
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-[var(--foreground)]">
            Observações do pagamento
            <textarea
              name="payment_notes"
              rows={4}
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]"
              placeholder="Observações sobre essa cobrança."
            />
          </label>

          {defaultPaymentMethod === CREDIT_CARD_METHOD ? (
            <div className="rounded-2xl border border-[rgba(22,101,52,0.16)] bg-[rgba(240,253,244,0.92)] px-4 py-3 text-sm leading-6 text-[rgb(21,128,61)]">
              Pagamentos em cartão de crédito já ficam como resolvidos no momento do cadastro.
            </div>
          ) : null}

          {baseDate ? (
            <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm leading-6 text-[var(--muted-foreground)]">
              A primeira parcela ficará em <strong>{new Date(`${baseDate}T12:00:00`).toLocaleDateString("pt-BR")}</strong>{" "}
              e as próximas seguirão no mesmo dia dos meses subsequentes.
            </div>
          ) : null}

          <div className="space-y-4">
            {installments.map((installment, index) => (
              <div
                key={index}
                className="rounded-[22px] border border-[var(--border)] bg-white p-4"
              >
                <input
                  type="hidden"
                  name={`payment_installment_number_${index + 1}`}
                  value={index + 1}
                />

                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Parcela {index + 1}
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    Valor
                    <input
                      name={`payment_installment_amount_${index + 1}`}
                      value={installment.amount}
                      onChange={(event) => updateInstallment(index, "amount", event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]"
                    />
                  </label>

                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    Método
                    <select
                      name={`payment_installment_method_${index + 1}`}
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
                    Estado
                    <select
                      name={`payment_installment_status_${index + 1}`}
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
                      type="date"
                      name={`payment_installment_due_date_${index + 1}`}
                      value={installment.dueDate}
                      onChange={(event) => updateInstallment(index, "dueDate", event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]"
                    />
                  </label>

                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    Data do pagamento
                    <input
                      type="date"
                      name={`payment_installment_paid_at_${index + 1}`}
                      value={installment.paidAt}
                      onChange={(event) => updateInstallment(index, "paidAt", event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]"
                    />
                  </label>

                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    Descrição
                    <input
                      name={`payment_installment_description_${index + 1}`}
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
      ) : null}
    </div>
  );
}
