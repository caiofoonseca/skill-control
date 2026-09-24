"use client";

import { useState } from "react";

import {
  saveCoursePaymentFromContractAction,
  saveEnrollmentPaymentFromContractAction,
} from "@/app/students/[id]/contract/actions";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/payments/constants";
import { formatCurrencyInput } from "@/lib/payments/money";

type CompletePaymentModalProps = {
  studentId: string;
  onClose: () => void;
  onSaved: (values: Record<string, string>) => void;
};

function isoDateToBr(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

export function CompletePaymentModal({ studentId, onClose, onSaved }: CompletePaymentModalProps) {
  const [totalAmount, setTotalAmount] = useState("");
  const [installmentCount, setInstallmentCount] = useState("1");
  const [firstDueDate, setFirstDueDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const [includeEnrollment, setIncludeEnrollment] = useState(false);
  const [enrollmentAmount, setEnrollmentAmount] = useState("");
  const [enrollmentPaymentMethod, setEnrollmentPaymentMethod] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!totalAmount || !installmentCount || !firstDueDate || !paymentMethod) {
      setError("Preencha valor, parcelas, data da 1ª parcela e forma de pagamento da mensalidade.");
      return;
    }

    if (includeEnrollment && (!enrollmentAmount || !enrollmentPaymentMethod)) {
      setError("Preencha o valor e a forma de pagamento da taxa de matrícula, ou desmarque essa opção.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const courseResult = await saveCoursePaymentFromContractAction({
      studentId,
      totalAmount,
      installmentCount,
      firstDueDate,
      paymentMethod,
    });

    if (!courseResult.ok) {
      setIsSaving(false);
      setError(courseResult.error);
      return;
    }

    if (includeEnrollment) {
      const enrollmentResult = await saveEnrollmentPaymentFromContractAction({
        studentId,
        amount: enrollmentAmount,
        dueDate: firstDueDate,
        paymentMethod: enrollmentPaymentMethod,
      });

      if (!enrollmentResult.ok) {
        setIsSaving(false);
        setError(`O pagamento do curso foi salvo, mas a taxa de matrícula não: ${enrollmentResult.error}`);
        return;
      }
    }

    setIsSaving(false);

    onSaved({
      main_total_amount: totalAmount,
      main_installment_count: installmentCount,
      main_first_due_date: isoDateToBr(firstDueDate),
      ...(includeEnrollment ? { enrollment_fee: enrollmentAmount } : {}),
    });
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(15,23,42,0.44)]">
      <div className="flex min-h-full items-center justify-center px-4 py-6">
        <div className="w-full max-w-lg rounded-lg border border-[var(--border)] bg-white p-6 shadow-2xl shadow-[rgba(15,23,42,0.22)]">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Cadastrar pagamento</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Preencha os dados do pagamento — ao salvar, isso vira um pagamento de verdade na
            ficha do aluno e também preenche a Cláusula V do contrato automaticamente.
          </p>

          <div className="mt-4 space-y-3 rounded-lg border border-[var(--border)] p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
              Mensalidade
            </p>

            <label className="block text-sm font-medium text-[var(--foreground)]">
              Valor total
              <input
                inputMode="numeric"
                value={totalAmount}
                onChange={(event) => setTotalAmount(formatCurrencyInput(event.target.value))}
                placeholder="R$ 0,00"
                className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Número de parcelas
                <input
                  type="number"
                  min={1}
                  value={installmentCount}
                  onChange={(event) => setInstallmentCount(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                />
              </label>

              <label className="block text-sm font-medium text-[var(--foreground)]">
                Data da 1ª parcela
                <input
                  type="date"
                  value={firstDueDate}
                  onChange={(event) => setFirstDueDate(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-[var(--foreground)]">
              Forma de pagamento
              <select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
              >
                <option value="">Selecione</option>
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
            <input
              type="checkbox"
              checked={includeEnrollment}
              onChange={(event) => {
                const checked = event.currentTarget.checked;
                setIncludeEnrollment(checked);
              }}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Incluir taxa de matrícula
          </label>

          {includeEnrollment ? (
            <div className="mt-3 space-y-3 rounded-lg border border-[var(--border)] p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                Taxa de matrícula
              </p>

              <label className="block text-sm font-medium text-[var(--foreground)]">
                Valor
                <input
                  inputMode="numeric"
                  value={enrollmentAmount}
                  onChange={(event) => setEnrollmentAmount(formatCurrencyInput(event.target.value))}
                  placeholder="R$ 0,00"
                  className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                />
              </label>

              <label className="block text-sm font-medium text-[var(--foreground)]">
                Forma de pagamento
                <select
                  value={enrollmentPaymentMethod}
                  onChange={(event) => setEnrollmentPaymentMethod(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                >
                  <option value="">Selecione</option>
                  {PAYMENT_METHOD_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <p className="text-xs leading-5 text-[var(--muted-foreground)]">
                Usa a mesma data da 1ª parcela da mensalidade, acima.
              </p>
            </div>
          ) : null}

          {error ? <p className="mt-3 text-sm font-medium text-[rgb(185,28,28)]">{error}</p> : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--panel)] disabled:cursor-not-allowed disabled:opacity-65"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-65"
            >
              {isSaving ? "Salvando..." : "Salvar pagamento"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
