"use client";

import Link from "next/link";
import { useState } from "react";

import { InlinePaymentFields } from "@/components/students/inline-payment-fields";
import { validateStudentFormFields } from "@/lib/students/form-helpers";

const studentFields = [
  { name: "full_name", label: "Nome", required: true, pattern: "[A-Za-zÀ-ÖØ-öø-ÿ' ]+" },
  { name: "address", label: "Endereço" },
  { name: "address_number", label: "Número", pattern: "[0-9][0-9\\-/ ]*" },
  { name: "apartment", label: "Apto" },
  { name: "neighborhood", label: "Bairro" },
  { name: "city", label: "Cidade" },
  { name: "state", label: "UF", maxLength: 2, pattern: "[A-Za-z]{2}" },
  { name: "zip_code", label: "CEP", inputMode: "numeric", pattern: "[0-9.\\- ]{8,10}" },
  { name: "instagram", label: "Instagram" },
  { name: "email", label: "E-mail", type: "email" },
  { name: "birth_date", label: "Data de nascimento", type: "date" },
  { name: "cpf", label: "CPF", inputMode: "numeric", pattern: "[0-9.\\- ]{11,14}" },
  { name: "rg", label: "RG" },
  { name: "phone", label: "Celular", inputMode: "tel", pattern: "[0-9()\\-+ ]{8,16}" },
  { name: "profession", label: "Profissão" },
] as const;

const guardian1Fields = [
  { name: "guardian1_full_name", label: "Nome", pattern: "[A-Za-zÀ-ÖØ-öø-ÿ' ]+" },
  { name: "guardian1_cpf", label: "CPF", inputMode: "numeric", pattern: "[0-9.\\- ]{11,14}" },
  { name: "guardian1_profession", label: "Profissão" },
  { name: "guardian1_company", label: "Empresa" },
  { name: "guardian1_phone", label: "Celular", inputMode: "tel", pattern: "[0-9()\\-+ ]{8,16}" },
  { name: "guardian1_work_phone", label: "Telefone comercial", inputMode: "tel", pattern: "[0-9()\\-+ ]{8,16}" },
  { name: "guardian1_email", label: "E-mail", type: "email" },
  { name: "guardian1_instagram", label: "Instagram" },
] as const;

const guardian2Fields = [
  { name: "guardian2_full_name", label: "Nome", pattern: "[A-Za-zÀ-ÖØ-öø-ÿ' ]+" },
  { name: "guardian2_cpf", label: "CPF", inputMode: "numeric", pattern: "[0-9.\\- ]{11,14}" },
  { name: "guardian2_profession", label: "Profissão" },
  { name: "guardian2_company", label: "Empresa" },
  { name: "guardian2_phone", label: "Celular", inputMode: "tel", pattern: "[0-9()\\-+ ]{8,16}" },
  { name: "guardian2_work_phone", label: "Telefone comercial", inputMode: "tel", pattern: "[0-9()\\-+ ]{8,16}" },
  { name: "guardian2_email", label: "E-mail", type: "email" },
  { name: "guardian2_instagram", label: "Instagram" },
] as const;

const financialFields = [
  { name: "financial_full_name", label: "Nome", pattern: "[A-Za-zÀ-ÖØ-öø-ÿ' ]+" },
  { name: "financial_cpf", label: "CPF", inputMode: "numeric", pattern: "[0-9.\\- ]{11,14}" },
  { name: "financial_address", label: "Endereço" },
  { name: "financial_profession", label: "Profissão" },
  { name: "financial_company", label: "Empresa" },
  { name: "financial_phone", label: "Celular", inputMode: "tel", pattern: "[0-9()\\-+ ]{8,16}" },
  { name: "financial_work_phone", label: "Telefone comercial", inputMode: "tel", pattern: "[0-9()\\-+ ]{8,16}" },
  { name: "financial_email", label: "E-mail", type: "email" },
] as const;

const sourceOptions = [
  "Redes sociais",
  "Google",
  "Indicação de amigos/família",
  "Parceria/convênio",
  "Pela fachada/placa escola",
  "Outros",
] as const;

const languageOptions = [
  "Ingles",
  "Alemao",
  "Frances",
  "Espanhol",
  "Portugues para estrangeiros",
] as const;

type FormValues = Record<string, string | null | undefined>;
type TeacherOption = { id: string; name: string };
type ClassOption = {
  id: string;
  name: string;
  teacherId: string | null;
  teacherName: string | null;
};
type ExistingPaymentPlan = {
  id: string;
  title: string;
  totalAmount: string;
  installmentCount: number;
  paymentType: string;
};

function inputClassName() {
  return "mt-1.5 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(182,133,58,0.18)]";
}

function fieldClassName(hasError: boolean) {
  if (!hasError) {
    return inputClassName();
  }

  return "mt-1.5 w-full rounded-lg border border-[rgb(185,28,28)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[rgb(185,28,28)] focus:ring-2 focus:ring-[rgba(185,28,28,0.18)]";
}

function FieldGrid({
  fields,
  values,
  errors,
}: {
  fields: ReadonlyArray<{
    name: string;
    label: string;
    type?: string;
    required?: boolean;
    pattern?: string;
    maxLength?: number;
    inputMode?: "numeric" | "tel";
  }>;
  values?: FormValues;
  errors?: Record<string, string>;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {fields.map((field) => {
        const fieldError = errors?.[field.name];

        return (
          <label key={field.name} className="block text-sm font-medium text-[var(--foreground)]">
            {field.label}
            <input
              name={field.name}
              type={field.type ?? "text"}
              required={field.required}
              pattern={field.pattern}
              maxLength={field.maxLength}
              inputMode={field.inputMode}
              defaultValue={values?.[field.name] ?? ""}
              aria-invalid={Boolean(fieldError)}
              aria-describedby={fieldError ? `${field.name}-error` : undefined}
              className={fieldClassName(Boolean(fieldError))}
            />
            {fieldError ? (
              <span id={`${field.name}-error`} className="mt-1 block text-xs font-semibold text-[rgb(185,28,28)]">
                {fieldError}
              </span>
            ) : null}
          </label>
        );
      })}
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
  studentId?: string;
  existingPayments?: ExistingPaymentPlan[];
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
  studentId,
  existingPayments = [],
}: StudentFormProps) {
  const [selectedClassName, setSelectedClassName] = useState(values?.class_name ?? "");
  const [teacherName, setTeacherName] = useState(values?.teacher_name ?? "");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function handleClassChange(nextClassName: string) {
    setSelectedClassName(nextClassName);

    const selectedClass = classOptions.find((item) => item.name === nextClassName);

    if (selectedClass?.teacherName) {
      setTeacherName(selectedClass.teacherName);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Cadastro de aluno
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            {description}
          </p>
        </div>

        <Link
          href={cancelHref}
          className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-white"
        >
          Voltar
        </Link>
      </div>

      {Object.keys(fieldErrors).length > 0 || error ? (
        <div className="rounded-lg border border-[rgba(180,83,9,0.18)] bg-[rgba(255,247,237,0.92)] px-4 py-3 text-sm font-medium text-[rgb(146,64,14)] shadow-sm">
          {Object.keys(fieldErrors).length > 0
            ? "Revise os campos destacados antes de salvar."
            : error}
        </div>
      ) : null}

      <form
        action={action}
        className="space-y-4"
        noValidate
        onSubmit={(event) => {
          const form = event.currentTarget;
          const nextFieldErrors = validateStudentFormFields(new FormData(form));
          const firstInvalidField = Object.keys(nextFieldErrors)[0];

          if (firstInvalidField) {
            event.preventDefault();
            setFieldErrors(nextFieldErrors);

            requestAnimationFrame(() => {
              const field = form.elements.namedItem(firstInvalidField);
              if (field instanceof HTMLElement) {
                field.focus();
                field.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            });

            return;
          }

          setFieldErrors({});
        }}
      >
        <div className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Aluno
            </p>
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
              <input
                name="is_active"
                type="checkbox"
                defaultChecked={values?.is_active !== "false"}
                className="h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)]"
              />
              Aluno ativo
            </label>
          </div>
          <div className="mt-4">
            <FieldGrid fields={studentFields} values={values} errors={fieldErrors} />
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Livro atual
              <input
                name="current_book"
                defaultValue={values?.current_book ?? ""}
                className={fieldClassName(Boolean(fieldErrors.current_book))}
                aria-invalid={Boolean(fieldErrors.current_book)}
                aria-describedby={fieldErrors.current_book ? "current_book-error" : undefined}
              />
              {fieldErrors.current_book ? (
                <span id="current_book-error" className="mt-1 block text-xs font-semibold text-[rgb(185,28,28)]">
                  {fieldErrors.current_book}
                </span>
              ) : null}
            </label>

            <label className="block text-sm font-medium text-[var(--foreground)]">
              Idioma
              <select
                name="language"
                defaultValue={values?.language ?? "Ingles"}
                className={fieldClassName(Boolean(fieldErrors.language))}
                aria-invalid={Boolean(fieldErrors.language)}
                aria-describedby={fieldErrors.language ? "language-error" : undefined}
              >
                {languageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {fieldErrors.language ? (
                <span id="language-error" className="mt-1 block text-xs font-semibold text-[rgb(185,28,28)]">
                  {fieldErrors.language}
                </span>
              ) : null}
            </label>

            <label className="block text-sm font-medium text-[var(--foreground)]">
              Origem
              <select
                name="source"
                defaultValue={values?.source ?? ""}
                className={inputClassName()}
              >
                <option value="">Selecione</option>
                {sourceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-[var(--foreground)]">
              Turma/Horário
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
          <InlinePaymentFields studentId={studentId} existingPayments={existingPayments} />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Responsável 1
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              Preencha apenas se houver responsável. O bloco só será salvo se o nome for informado.
            </p>
            <div className="mt-4">
              <FieldGrid fields={guardian1Fields} values={values} errors={fieldErrors} />
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Responsável 2
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              Também opcional. O bloco só será salvo se o nome for informado.
            </p>
            <div className="mt-4">
              <FieldGrid fields={guardian2Fields} values={values} errors={fieldErrors} />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Responsável financeiro
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
            Preencha apenas se necessário. O bloco só será salvo se o nome for informado.
          </p>
          <div className="mt-4">
            <FieldGrid fields={financialFields} values={values} errors={fieldErrors} />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link
            href={cancelHref}
            className="rounded-lg border border-[var(--border)] bg-white px-5 py-2.5 text-center text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--panel)]"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </section>
  );
}
