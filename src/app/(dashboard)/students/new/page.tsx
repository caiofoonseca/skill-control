import { StudentFormManaged } from "@/components/students/student-form-managed";
import { getStudentOptions } from "@/lib/organization/queries";
import { createStudentAction } from "./actions";

type PageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewStudentPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { classOptions, teacherOptions } = await getStudentOptions();

  return (
    <StudentFormManaged
      title="Novo aluno"
      description="Preencha os dados do aluno e, se necessário, dos responsáveis vinculados."
      cancelHref="/students"
      submitLabel="Salvar aluno"
      action={createStudentAction}
      error={params.error}
      classOptions={classOptions}
      teacherOptions={teacherOptions}
    />
  );
}
