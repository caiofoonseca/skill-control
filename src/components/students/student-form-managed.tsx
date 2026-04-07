"use client";

import Link from "next/link";
import { useState } from "react";

import { InlinePaymentFields } from "@/components/students/inline-payment-fields";

const studentFields = [
  { name: "full_name", label: "Nome", required: true },
  { name: "address", label: "Endereço" },
  { name: "address_number", label: "Número" },
  { name: "apartment", label: "Apto" },
  { name: "neighborhood", label: "Bairro" },
  { name: "city", label: "Cidade" },
  { name: "state", label: "UF" },
  { name: "zip_code", label: "CEP" },
  { name: "instagram", label: "Instagram" },
  { name: "email", label: "E-mail", type: "email" },
  { name: "birth_date", label: "Data de nascimento", type: "date" },
  { name: "cpf", label: "CPF" },
  { name: "rg", label: "RG" },
  { name: "phone", label: "Celular" },
  { name: "profession", label: "Profissão" },
  { name: "schedule", label: "Horário" },
  { name: "current_book", label: "Livro atual" },
  { name: "source", label: "Origem" },
] as const;

const guardian1Fields = [
  { name: "guardian1_full_name", label: "Nome" },
  { name: "guardian1_cpf", label: "CPF" },
  { name: "guardian1_profession", label: "Profissão" },
  { name: "guardian1_company", label: "Empresa" },
  { name: "guardian1_phone", label: "Celular" },
  { name: "guardian1_work_phone", label: "Telefone comercial" },
  { name: "guardian1_email", label: "E-mail", type: "email" },
  { name: "guardian1_instagram", label: "Instagram" },
] as const;

const guardian2Fields = [
  { name: "guardian2_full_name", label: "Nome" },
  { name: "guardian2_cpf", label: "CPF" },
  { name: "guardian2_profession", label: "Profissão" },
  { name: "guardian2_company", label: "Empresa" },
  { name: "guardian2_phone", label: "Celular" },
  { name: "guardian2_work_phone", label: "Telefone comercial" },
  { name: "guardian2_email", label: "E-mail", type: "email" },
  { name: "guardian2_instagram", label: "Instagram" },
] as const;

const financialFields = [
  { name: "financial_full_name", label: "Nome" },
  { name: "financial_cpf", label: "CPF" },
  { name: "financial_address", label: "Endereço" },
  { name: "financial_profession", label: "Profissão" },
  { name: "financial_company", label: "Empresa" },
  { name: "financial_phone", label: "Celular" },
  { name: "financial_work_phone", label: "Telefone comercial" },
  { name: "financial_email", label: "E-mail", type: "email" },
] as const;

type FormValues = Record<string, string | null | undefined>;
type TeacherOption = { id: string; name: string };
type ClassOption = {
  id: string;
  name: string;
  teacherId: string | null;
  teacherName: string | null;
};

function inputClassName() {
  return "mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]";
}

function FieldGrid({
  fields,
  values,
}: {
  fields: ReadonlyArray<{
    name: string;
    label: string;
    type?: string;
    required?: boolean;
  }>;
  values?: FormValues;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {fields.map((field) => (
        <label key={field.name} className="block text-sm font-medium text-[var(--foreground)]">
          {field.label}
          <input
            name={field.name}
            type={field.type ?? "text"}
            required={field.required}
            defaultValue={values?.[field.name] ?? ""}
            className={inputClassName()}
          />
        </label>
      ))}
    </div>
  );
}

type StudentFormProps = {
  title: string;
  description: string;
  cancelHref: string;
  submitLabel: string;
  action: (formData: FormData) => void | Promise<void>;
  error?: string;
  values?: FormValues;
  classOptions: ClassOption[];
  teacherOptions: TeacherOption[];
};

export function StudentFormManaged({
  title,
  description,
  cancelHref,
  submitLabel,
  action,
  error,
  values,
  classOptions,
  teacherOptions,
}: StudentFormProps) {
  const [selectedClassName, setSelectedClassName] = useState(values?.class_name ?? "");
  const [teacherName, setTeacherName] = useState(values?.teacher_name ?? "");

  function handleClassChange(nextClassName: string) {
    setSelectedClassName(nextClassName);

    const selectedClass = classOptions.find((item) => item.name === nextClassName);

    if (selectedClass?.teacherName) {
      setTeacherName(selectedClass.teacherName);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Cadastro de aluno
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
            {title}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            {description}
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
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Aluno
          </p>
          <div className="mt-5">
            <FieldGrid fields={studentFields} values={values} />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Turma
              <select
                name="class_name"
                value={selectedClassName}
                onChange={(event) => handleClassChange(event.target.value)}
                className={inputClassName()}
              >
                <option value="">Selecione</option>
                {classOptions.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-[var(--foreground)]">
              Professor
              <select
                name="teacher_name"
                value={teacherName}
                onChange={(event) => setTeacherName(event.target.value)}
                className={inputClassName()}
              >
                <option value="">Selecione</option>
                {teacherOptions.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <InlinePaymentFields />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Responsável 1
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Preencha apenas se houver responsável. O bloco só será salvo se o nome for informado.
            </p>
            <div className="mt-5">
              <FieldGrid fields={guardian1Fields} values={values} />
            </div>
          </div>

          <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Responsável 2
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Também opcional. O bloco só será salvo se o nome for informado.
            </p>
            <div className="mt-5">
              <FieldGrid fields={guardian2Fields} values={values} />
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Responsável financeiro
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Preencha apenas se necessário. O bloco só será salvo se o nome for informado.
          </p>
          <div className="mt-5">
            <FieldGrid fields={financialFields} values={values} />
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
            {submitLabel}
          </button>
        </div>
      </form>
    </section>
  );
}
