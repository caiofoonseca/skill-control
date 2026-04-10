import { notFound } from "next/navigation";

import { StudentFormManaged } from "@/components/students/student-form-managed";
import { getStudentOptions } from "@/lib/organization/queries";
import { getStudentDetails } from "@/lib/students/queries";

import { updateStudentAction } from "./actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditStudentPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { error } = await searchParams;
  const { classOptions, teacherOptions } = await getStudentOptions();
  const { student, guardians, financialContact, paymentPlans } = await getStudentDetails(id);

  if (!student) {
    notFound();
  }

  const primaryGuardian =
    guardians.find((guardian) => guardian.guardian_type === "primary") ?? null;
  const secondaryGuardian =
    guardians.find((guardian) => guardian.guardian_type === "secondary") ?? null;

  const values = {
    full_name: student.full_name,
    address: student.address,
    address_number: student.address_number,
    apartment: student.apartment,
    neighborhood: student.neighborhood,
    city: student.city,
    state: student.state,
    zip_code: student.zip_code,
    instagram: student.instagram,
    email: student.email,
    birth_date: student.birth_date,
    cpf: student.cpf,
    rg: student.rg,
    phone: student.phone,
    profession: student.profession,
    class_name: student.class_name,
    teacher_name: student.teacher_name,
    current_book: student.current_book,
    source: student.source,
    language: student.language,
    payment_notes: student.payment_notes,
    is_active: student.is_active ? "true" : "false",
    guardian1_full_name: primaryGuardian?.full_name,
    guardian1_cpf: primaryGuardian?.cpf,
    guardian1_profession: primaryGuardian?.profession,
    guardian1_company: primaryGuardian?.company,
    guardian1_phone: primaryGuardian?.phone,
    guardian1_work_phone: primaryGuardian?.work_phone,
    guardian1_email: primaryGuardian?.email,
    guardian1_instagram: primaryGuardian?.instagram,
    guardian2_full_name: secondaryGuardian?.full_name,
    guardian2_cpf: secondaryGuardian?.cpf,
    guardian2_profession: secondaryGuardian?.profession,
    guardian2_company: secondaryGuardian?.company,
    guardian2_phone: secondaryGuardian?.phone,
    guardian2_work_phone: secondaryGuardian?.work_phone,
    guardian2_email: secondaryGuardian?.email,
    guardian2_instagram: secondaryGuardian?.instagram,
    financial_full_name: financialContact?.full_name,
    financial_cpf: financialContact?.cpf,
    financial_address: financialContact?.address,
    financial_profession: financialContact?.profession,
    financial_company: financialContact?.company,
    financial_phone: financialContact?.phone,
    financial_work_phone: financialContact?.work_phone,
    financial_email: financialContact?.email,
  };

  const boundAction = updateStudentAction.bind(null, student.id);

  return (
    <StudentFormManaged
      title="Editar aluno"
      description="Atualize os dados do aluno e dos responsáveis vinculados."
      cancelHref={`/students/${student.id}`}
      submitLabel="Salvar alterações"
      action={boundAction}
      error={error}
      values={values}
      classOptions={classOptions}
      teacherOptions={teacherOptions}
      studentId={student.id}
      existingPayments={paymentPlans.map((plan) => ({
        id: plan.id,
        title: plan.title,
        totalAmount: plan.total_amount,
        installmentCount: plan.installment_count,
        paymentType: plan.payment_type,
      }))}
    />
  );
}
