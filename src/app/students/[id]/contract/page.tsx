import { notFound, redirect } from "next/navigation";

import type { MainPlanSummary, MaterialPlanSummary } from "@/components/contracts/contract-document";
import { ContractPageClient } from "@/components/contracts/contract-page-client";
import type { SignerOption } from "@/components/contracts/signer-selector";
import { getInstallmentDueDateRange, getStudentContractData, isMinor } from "@/lib/contracts/queries";
import { formatAmountPerInstallment } from "@/lib/payments/schedule";
import { formatCurrencyFromNumber } from "@/lib/payments/money";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDateBR(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

function formatMoneyBR(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return formatCurrencyFromNumber(Number(value));
}

export default async function StudentContractPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    student,
    guardians,
    courseClass,
    materialPlan,
    materialInstallments,
    enrollmentPlan,
    mainPlan,
    mainInstallments,
  } = await getStudentContractData(id);

  if (!student) {
    notFound();
  }

  const primaryGuardian = guardians.find((guardian) => guardian.guardian_type === "primary") ?? null;
  const secondaryGuardian = guardians.find((guardian) => guardian.guardian_type === "secondary") ?? null;

  const signerOptions: SignerOption[] = [
    { key: "student", label: "Aluno", fullName: student.full_name, cpf: student.cpf },
    ...(primaryGuardian
      ? [{ key: "primary" as const, label: "Responsável 1", fullName: primaryGuardian.full_name, cpf: primaryGuardian.cpf }]
      : []),
    ...(secondaryGuardian
      ? [{ key: "secondary" as const, label: "Responsável 2", fullName: secondaryGuardian.full_name, cpf: secondaryGuardian.cpf }]
      : []),
  ];

  const defaultSignerKey: SignerOption["key"] = isMinor(student.birth_date)
    ? primaryGuardian
      ? "primary"
      : secondaryGuardian
        ? "secondary"
        : "student"
    : "student";

  const material: MaterialPlanSummary | null = materialPlan
    ? {
        installmentCount: materialInstallments.length || materialPlan.installment_count,
        amountPerInstallmentFormatted:
          formatMoneyBR(materialInstallments[0]?.amount) ??
          formatAmountPerInstallment(materialPlan.total_amount, materialPlan.installment_count || 1),
        validFromFormatted: formatDateBR(getInstallmentDueDateRange(materialInstallments).first),
        validUntilFormatted: formatDateBR(getInstallmentDueDateRange(materialInstallments).last),
      }
    : null;

  const mainDueRange = getInstallmentDueDateRange(mainInstallments);
  const main: MainPlanSummary | null = mainPlan
    ? {
        totalAmountFormatted: formatMoneyBR(mainPlan.total_amount) ?? "-",
        installmentCount: mainInstallments.length || mainPlan.installment_count,
        firstDueDateFormatted: formatDateBR(mainDueRange.first),
      }
    : null;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-6 sm:px-6 print:bg-white print:px-0 print:py-0">
      <section className="mx-auto max-w-3xl space-y-6 print:max-w-none print:space-y-0">
        <ContractPageClient
          studentId={student.id}
          studentFullName={student.full_name}
          signerOptions={signerOptions}
          defaultSignerKey={defaultSignerKey}
          contractedStages={student.contracted_stages}
          contractStartDateFormatted={formatDateBR(courseClass?.contract_start_date)}
          contractEndDateFormatted={formatDateBR(courseClass?.contract_end_date)}
          lessonsStartDateFormatted={formatDateBR(courseClass?.lessons_start_date)}
          lessonsEndDateFormatted={formatDateBR(courseClass?.lessons_end_date)}
          vacationPeriod={courseClass?.vacation_period ?? null}
          material={material}
          main={main}
          enrollmentFeeFormatted={formatMoneyBR(enrollmentPlan?.total_amount)}
          leaveAuthorization={student.leave_without_guardian_authorization}
          todayFormatted={new Date().toLocaleDateString("pt-BR")}
        />
      </section>
    </main>
  );
}
