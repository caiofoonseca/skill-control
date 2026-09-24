"use client";

import { useEffect, useState } from "react";

import { logContractEmissionAction } from "@/app/students/[id]/contract/actions";
import { markTabSessionActive, TAB_SESSION_QUERY_PARAM, TAB_SESSION_QUERY_VALUE } from "@/lib/auth/tab-session";

import { ContractDocument, type MainPlanSummary, type MaterialPlanSummary } from "./contract-document";
import type { SignerOption } from "./signer-selector";

type ContractPageClientProps = {
  studentId: string;
  studentFullName: string;
  signerOptions: SignerOption[];
  defaultSignerKey: SignerOption["key"];
  contractedStages: string | null;
  contractStartDateFormatted: string | null;
  contractEndDateFormatted: string | null;
  lessonsStartDateFormatted: string | null;
  lessonsEndDateFormatted: string | null;
  vacationPeriod: string | null;
  material: MaterialPlanSummary | null;
  main: MainPlanSummary | null;
  enrollmentFeeFormatted: string | null;
  leaveAuthorization: "authorized" | "not_authorized" | null;
  todayFormatted: string;
};

export function ContractPageClient({
  studentId,
  studentFullName,
  signerOptions,
  defaultSignerKey,
  main,
  ...documentProps
}: ContractPageClientProps) {
  const [selectedKey, setSelectedKey] = useState<SignerOption["key"]>(defaultSignerKey);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get(TAB_SESSION_QUERY_PARAM) === TAB_SESSION_QUERY_VALUE) {
      markTabSessionActive();
    }
  }, []);

  async function handlePrint() {
    const selected = signerOptions.find((option) => option.key === selectedKey) ?? signerOptions[0];

    setIsPrinting(true);
    try {
      await logContractEmissionAction(studentId, selected.key, selected.fullName);
    } catch {
      // registro é best-effort — não deve travar a impressão
    } finally {
      setIsPrinting(false);
    }

    window.print();
  }

  function handleClose() {
    window.close();
    window.setTimeout(() => {
      window.location.href = `/students/${studentId}`;
    }, 300);
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm print:hidden">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Emissão de contrato
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{studentFullName}</h2>
        </div>

        <div className="flex flex-col items-start gap-3">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-white"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              className="rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-65"
            >
              {isPrinting ? "Abrindo..." : "Imprimir"}
            </button>
          </div>

          {!main ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(true)}
                className="rounded-xl border border-[var(--accent)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--accent)] transition hover:bg-[rgba(182,133,58,0.08)]"
              >
                Cadastrar pagamento
              </button>

              <div className="group relative inline-flex">
                <span
                  tabIndex={0}
                  aria-label="Mais informações sobre cadastrar pagamento"
                  className="flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-[var(--border)] text-xs font-semibold text-[var(--muted-foreground)] outline-none transition hover:bg-[var(--panel)] focus-visible:ring-2 focus-visible:ring-[rgba(182,133,58,0.4)]"
                >
                  ?
                </span>
                <div className="pointer-events-none absolute right-0 top-full z-10 mt-2 w-72 rounded-lg border border-[var(--border)] bg-white p-3 text-xs leading-5 text-[var(--foreground)] opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100">
                  Esse aluno ainda não tem pagamento cadastrado. Cadastre aqui a mensalidade (e a
                  taxa de matrícula, se quiser) — ao salvar, já vira pagamento de verdade na
                  ficha do aluno e preenche a Cláusula V do contrato sozinho.
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm print:rounded-none print:border-none print:p-0 print:shadow-none">
        <ContractDocument
          studentId={studentId}
          studentFullName={studentFullName}
          signerOptions={signerOptions}
          selectedKey={selectedKey}
          onSelectedKeyChange={setSelectedKey}
          main={main}
          isPaymentModalOpen={isPaymentModalOpen}
          onPaymentModalOpenChange={setIsPaymentModalOpen}
          {...documentProps}
        />
      </div>
    </>
  );
}
