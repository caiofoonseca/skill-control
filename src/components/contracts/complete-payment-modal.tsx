"use client";

import { useState } from "react";

import { PAYMENT_METHOD_OPTIONS } from "@/lib/payments/constants";

import {
  saveCoursePaymentFromContractAction,
  saveEnrollmentPaymentFromContractAction,
} from "@/app/students/[id]/contract/actions";

type CoursePaymentInfo = {
  totalAmount: string;
  installmentCount: string;
  dueDateIso: string | null;
  dueDateRaw: string;
};

type EnrollmentPaymentInfo = {
  amount: string;
  dueDateIso: string | null;
  dueDateRaw: string;
};

type CompletePaymentModalProps = {
  studentId: string;
  course: CoursePaymentInfo;
  enrollment: EnrollmentPaymentInfo | null;
  onClose: () => void;
  onSaved: () => void;
};

function PaymentSection({
  title,
  summary,
  dueDateIso,
  isSaving,
  isSaved,
  error,
  onSave,
}: {
  title: string;
  summary: Array<{ label: string; value: string }>;
  dueDateIso: string | null;
  isSaving: boolean;
  isSaved: boolean;
  error: string | null;
  onSave: (paymentMethod: string) => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState("");

  return (
    <div className="rounded-lg border border-[var(--border)] p-4">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{title}</p>

      <div className="mt-3 space-y-1 text-sm">
        {summary.map((item) => (
          <p key={item.label}>
            <span className="font-semibold">{item.label}:</span> {item.value || "-"}
          </p>
        ))}
      </div>

      {isSaved ? (
        <p className="mt-3 text-sm font-medium text-[rgb(21,128,61)]">Pagamento salvo com sucesso.</p>
      ) : (
        <>
          <label className="mt-3 block text-sm font-medium text-[var(--foreground)]">
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

          {error ? <p className="mt-2 text-sm font-medium text-[rgb(185,28,28)]">{error}</p> : null}
          {!dueDateIso ? (
            <p className="mt-2 text-sm font-medium text-[rgb(185,28,28)]">
              A data preenchida no contrato não é válida. Corrija o campo de data lá antes de continuar.
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => onSave(paymentMethod)}
            disabled={isSaving || !dueDateIso}
            className="mt-3 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-65"
          >
            {isSaving ? "Salvando..." : "Salvar"}
          </button>
        </>
      )}
    </div>
  );
}

export function CompletePaymentModal({ studentId, course, enrollment, onClose, onSaved }: CompletePaymentModalProps) {
  const [courseState, setCourseState] = useState<{ saving: boolean; saved: boolean; error: string | null }>({
    saving: false,
    saved: false,
    error: null,
  });
  const [enrollmentState, setEnrollmentState] = useState<{ saving: boolean; saved: boolean; error: string | null }>({
    saving: false,
    saved: false,
    error: null,
  });

  async function handleSaveCourse(paymentMethod: string) {
    if (!paymentMethod) {
      setCourseState((current) => ({ ...current, error: "Selecione a forma de pagamento." }));
      return;
    }

    setCourseState({ saving: true, saved: false, error: null });

    const result = await saveCoursePaymentFromContractAction({
      studentId,
      totalAmount: course.totalAmount,
      installmentCount: course.installmentCount,
      firstDueDate: course.dueDateIso ?? "",
      paymentMethod,
    });

    if (result.ok) {
      setCourseState({ saving: false, saved: true, error: null });
      onSaved();
    } else {
      setCourseState({ saving: false, saved: false, error: result.error });
    }
  }

  async function handleSaveEnrollment(paymentMethod: string) {
    if (!enrollment) return;

    if (!paymentMethod) {
      setEnrollmentState((current) => ({ ...current, error: "Selecione a forma de pagamento." }));
      return;
    }

    setEnrollmentState({ saving: true, saved: false, error: null });

    const result = await saveEnrollmentPaymentFromContractAction({
      studentId,
      amount: enrollment.amount,
      dueDate: enrollment.dueDateIso ?? "",
      paymentMethod,
    });

    if (result.ok) {
      setEnrollmentState({ saving: false, saved: true, error: null });
      onSaved();
    } else {
      setEnrollmentState({ saving: false, saved: false, error: result.error });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.44)] px-4 py-6">
      <div className="w-full max-w-lg rounded-lg border border-[var(--border)] bg-white p-6 shadow-2xl shadow-[rgba(15,23,42,0.22)]">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">Completar cadastro do pagamento</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Confirme a forma de pagamento de cada parte pra registrar na ficha do aluno, sem sair
          do contrato.
        </p>

        <div className="mt-4 space-y-4">
          <PaymentSection
            title="Pagamento da mensalidade"
            summary={[
              { label: "Valor", value: course.totalAmount },
              { label: "Parcelas", value: course.installmentCount },
              { label: "Data da 1ª parcela", value: course.dueDateRaw },
            ]}
            dueDateIso={course.dueDateIso}
            isSaving={courseState.saving}
            isSaved={courseState.saved}
            error={courseState.error}
            onSave={handleSaveCourse}
          />

          {enrollment ? (
            <PaymentSection
              title="Pagamento da taxa de matrícula"
              summary={[
                { label: "Valor", value: enrollment.amount },
                { label: "Data", value: enrollment.dueDateRaw },
              ]}
              dueDateIso={enrollment.dueDateIso}
              isSaving={enrollmentState.saving}
              isSaved={enrollmentState.saved}
              error={enrollmentState.error}
              onSave={handleSaveEnrollment}
            />
          ) : null}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--panel)]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
