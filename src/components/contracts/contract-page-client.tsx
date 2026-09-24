"use client";

import Link from "next/link";
import { useState } from "react";

import { logContractEmissionAction } from "@/app/students/[id]/contract/actions";

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
  ...documentProps
}: ContractPageClientProps) {
  const [selectedKey, setSelectedKey] = useState<SignerOption["key"]>(defaultSignerKey);
  const [isPrinting, setIsPrinting] = useState(false);

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

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm print:hidden">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Emissão de contrato
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{studentFullName}</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/students/${studentId}`}
            className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-white"
          >
            Voltar
          </Link>
          <button
            type="button"
            onClick={handlePrint}
            disabled={isPrinting}
            className="rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-65"
          >
            {isPrinting ? "Registrando..." : "Registrar emissão e imprimir"}
          </button>
        </div>
      </div>

      <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm print:rounded-none print:border-none print:p-0 print:shadow-none">
        <ContractDocument
          studentId={studentId}
          studentFullName={studentFullName}
          signerOptions={signerOptions}
          selectedKey={selectedKey}
          onSelectedKeyChange={setSelectedKey}
          {...documentProps}
        />
      </div>
    </>
  );
}
