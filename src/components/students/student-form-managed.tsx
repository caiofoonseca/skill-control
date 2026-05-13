"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { InlinePaymentFields } from "@/components/students/inline-payment-fields";
import { BRAZIL_STATE_OPTIONS } from "@/lib/brazil/states";
import { validateStudentFormFields } from "@/lib/students/form-helpers";

const studentPersonalFields = [
  {
    name: "full_name",
    label: "Nome",
    required: true,
    pattern: "[A-Za-zÀ-ÖØ-öø-ÿ' ]+",
    className: "md:col-span-2 xl:col-span-4",
  },
  { name: "birth_date", label: "Data de nascimento", type: "date", className: "xl:col-span-3" },
  { name: "rg", label: "RG", className: "xl:col-span-2" },
  {
    name: "cpf",
    label: "CPF",
    inputMode: "numeric",
    pattern: "[0-9.\\- ]{11,14}",
    format: "cpf",
    className: "xl:col-span-3",
  },
  {
    name: "phone",
    label: "Celular",
    inputMode: "tel",
    pattern: "[0-9()\\-+ ]{8,16}",
    format: "phone",
    className: "xl:col-span-3",
  },
  { name: "email", label: "E-mail", type: "email", className: "md:col-span-2 xl:col-span-4" },
  { name: "profession", label: "Profissão", className: "xl:col-span-3" },
  { name: "instagram", label: "Instagram", className: "xl:col-span-2" },
] as const;

const studentAddressFields = [
  {
    name: "zip_code",
    label: "CEP",
    inputMode: "numeric",
    pattern: "[0-9.\\- ]{8,10}",
    format: "zip",
    className: "xl:col-span-2",
  },
  { name: "address", label: "Endereço", className: "md:col-span-2 xl:col-span-8" },
  { name: "address_number", label: "Número", pattern: "[0-9][0-9\\-/ ]*", className: "xl:col-span-2" },
  { name: "apartment", label: "Complemento", className: "xl:col-span-3" },
  { name: "neighborhood", label: "Bairro", className: "xl:col-span-3" },
  { name: "city", label: "Cidade", className: "xl:col-span-4" },
] as const;

const guardian1Fields = [
  { name: "guardian1_full_name", label: "Nome", pattern: "[A-Za-zÀ-ÖØ-öø-ÿ' ]+" },
  { name: "guardian1_cpf", label: "CPF", inputMode: "numeric", pattern: "[0-9.\\- ]{11,14}", format: "cpf" },
  { name: "guardian1_profession", label: "Profissão" },
  { name: "guardian1_company", label: "Empresa" },
  { name: "guardian1_phone", label: "Celular", inputMode: "tel", pattern: "[0-9()\\-+ ]{8,16}", format: "phone" },
  { name: "guardian1_work_phone", label: "Telefone comercial", inputMode: "tel", pattern: "[0-9()\\-+ ]{8,16}", format: "phone" },
  { name: "guardian1_email", label: "E-mail", type: "email" },
  { name: "guardian1_instagram", label: "Instagram" },
] as const;

const guardian2Fields = [
  { name: "guardian2_full_name", label: "Nome", pattern: "[A-Za-zÀ-ÖØ-öø-ÿ' ]+" },
  { name: "guardian2_cpf", label: "CPF", inputMode: "numeric", pattern: "[0-9.\\- ]{11,14}", format: "cpf" },
  { name: "guardian2_profession", label: "Profissão" },
  { name: "guardian2_company", label: "Empresa" },
  { name: "guardian2_phone", label: "Celular", inputMode: "tel", pattern: "[0-9()\\-+ ]{8,16}", format: "phone" },
  { name: "guardian2_work_phone", label: "Telefone comercial", inputMode: "tel", pattern: "[0-9()\\-+ ]{8,16}", format: "phone" },
  { name: "guardian2_email", label: "E-mail", type: "email" },
  { name: "guardian2_instagram", label: "Instagram" },
] as const;

const financialFields = [
  { name: "financial_full_name", label: "Nome", pattern: "[A-Za-zÀ-ÖØ-öø-ÿ' ]+" },
  { name: "financial_cpf", label: "CPF", inputMode: "numeric", pattern: "[0-9.\\- ]{11,14}", format: "cpf" },
  { name: "financial_address", label: "Endereço" },
  { name: "financial_profession", label: "Profissão" },
  { name: "financial_company", label: "Empresa" },
  { name: "financial_phone", label: "Celular", inputMode: "tel", pattern: "[0-9()\\-+ ]{8,16}", format: "phone" },
  { name: "financial_work_phone", label: "Telefone comercial", inputMode: "tel", pattern: "[0-9()\\-+ ]{8,16}", format: "phone" },
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
  "Inglês",
  "Alemão",
  "Francês",
  "Espanhol",
  "Português para estrangeiros",
] as const;

type FormValues = Record<string, string | null | undefined>;
type TeacherOption = { id: string; name: string };
type ClassOption = {
  id: string;
  name: string;
  teacherId: string | null;
  teacherName: string | null;
};
type BookOption = { id: string; name: string };
type ExistingPaymentPlan = {
  id: string;
  title: string;
  totalAmount: string;
  installmentCount: number;
  paymentType: string;
};

type FinancialContactSource = "manual" | "primary" | "secondary";
type StandardFormat = "cpf" | "phone" | "zip";

type GuardianPreview = {
  name: string;
  cpf: string;
  phone: string;
  workPhone: string;
  email: string;
  profession: string;
  company: string;
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

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatCpf(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length !== 11) return value;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatZipCode(value: string) {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length !== 8) return value;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function formatPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return value;
}

function formatStandardValue(value: string, format?: StandardFormat) {
  if (!format || !value.trim()) return value;
  if (format === "cpf") return formatCpf(value);
  if (format === "zip") return formatZipCode(value);
  return formatPhone(value);
}

function getGuardianPreview(formData: FormData, source: FinancialContactSource): GuardianPreview | null {
  if (source === "manual") return null;

  const prefix = source === "primary" ? "guardian1" : "guardian2";
  const name = String(formData.get(`${prefix}_full_name`) ?? "").trim();

  if (!name) return null;

  return {
    name,
    cpf: String(formData.get(`${prefix}_cpf`) ?? "").trim(),
    phone: String(formData.get(`${prefix}_phone`) ?? "").trim(),
    workPhone: String(formData.get(`${prefix}_work_phone`) ?? "").trim(),
    email: String(formData.get(`${prefix}_email`) ?? "").trim(),
    profession: String(formData.get(`${prefix}_profession`) ?? "").trim(),
    company: String(formData.get(`${prefix}_company`) ?? "").trim(),
  };
}

function getGuardianPreviewFromValues(values: FormValues | undefined, source: FinancialContactSource) {
  if (!values || source === "manual") return null;

  const prefix = source === "primary" ? "guardian1" : "guardian2";
  const name = String(values[`${prefix}_full_name`] ?? "").trim();

  if (!name) return null;

  return {
    name,
    cpf: String(values[`${prefix}_cpf`] ?? "").trim(),
    phone: String(values[`${prefix}_phone`] ?? "").trim(),
    workPhone: String(values[`${prefix}_work_phone`] ?? "").trim(),
    email: String(values[`${prefix}_email`] ?? "").trim(),
    profession: String(values[`${prefix}_profession`] ?? "").trim(),
    company: String(values[`${prefix}_company`] ?? "").trim(),
  };
}

function FieldGrid({
  fields,
  values,
  errors,
  className = "grid gap-3 md:grid-cols-2 xl:grid-cols-12",
}: {
  fields: ReadonlyArray<{
    name: string;
    label: string;
    type?: string;
    required?: boolean;
    pattern?: string;
    maxLength?: number;
    inputMode?: "numeric" | "tel";
    format?: StandardFormat;
    className?: string;
  }>;
  values?: FormValues;
  errors?: Record<string, string>;
  className?: string;
}) {
  return (
    <div className={className}>
      {fields.map((field) => {
        const fieldError = errors?.[field.name];

        return (
          <label
            key={field.name}
            className={`block text-sm font-medium text-[var(--foreground)] ${field.className ?? "xl:col-span-4"}`}
          >
            {field.label}
            <input
              name={field.name}
              type={field.type ?? "text"}
              required={field.required}
              pattern={field.pattern}
              maxLength={field.maxLength}
              inputMode={field.inputMode}
              defaultValue={values?.[field.name] ?? ""}
              data-format={field.format}
              onBlur={(event) => {
                event.currentTarget.value = formatStandardValue(event.currentTarget.value, field.format);
              }}
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
  bookOptions?: BookOption[];
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
  bookOptions = [],
  studentId,
  existingPayments = [],
}: StudentFormProps) {
  const [selectedClassName, setSelectedClassName] = useState(values?.class_name ?? "");
  const [teacherName, setTeacherName] = useState(values?.teacher_name ?? "");
  const [financialContactSource, setFinancialContactSource] = useState<FinancialContactSource>(
    (values?.financial_contact_source as FinancialContactSource | undefined) ?? "manual",
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScholarship, setIsScholarship] = useState(values?.is_scholarship === "true");
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [financialPreview, setFinancialPreview] = useState<GuardianPreview | null>(() =>
    getGuardianPreviewFromValues(
      values,
      (values?.financial_contact_source as FinancialContactSource | undefined) ?? "manual",
    ),
  );
  const formRef = useRef<HTMLFormElement>(null);
  const isSubmittingRef = useRef(false);
  const allowNavigationRef = useRef(false);
  const pendingNavigationRef = useRef<(() => void) | null>(null);
  const isFinancialManual = financialContactSource === "manual";
  const currentBookOptions = useMemo(() => {
    const bookNames = bookOptions.map((book) => book.name);
    const value = values?.current_book;

    if (value && !bookNames.includes(value)) {
      return [{ id: "current-book-value", name: value }, ...bookOptions];
    }

    return bookOptions;
  }, [bookOptions, values?.current_book]);

  useEffect(() => {
    if (!isDirty || isSubmitting) return;

    const handleDocumentClick = (event: globalThis.MouseEvent) => {
      if (allowNavigationRef.current) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-unsaved-modal]")) return;

      const anchor = target.closest("a[href]");
      if (anchor instanceof HTMLAnchorElement) {
        const href = anchor.href;

        if (!href || href === window.location.href) return;

        event.preventDefault();
        event.stopPropagation();
        pendingNavigationRef.current = () => {
          window.location.assign(href);
        };
        setShowUnsavedModal(true);
        return;
      }

      const button = target.closest("button");
      if (!(button instanceof HTMLButtonElement)) return;
      if (button.form === formRef.current && button.type === "submit") return;

      event.preventDefault();
      event.stopPropagation();
      pendingNavigationRef.current = () => {
        button.click();
      };
      setShowUnsavedModal(true);
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, [isDirty, isSubmitting]);

  function handleClassChange(nextClassName: string) {
    setSelectedClassName(nextClassName);

    const selectedClass = classOptions.find((item) => item.name === nextClassName);

    if (selectedClass?.teacherName) {
      setTeacherName(selectedClass.teacherName);
    }
  }

  function updateFinancialPreview(form: HTMLFormElement, source = financialContactSource) {
    setFinancialPreview(getGuardianPreview(new FormData(form), source));
  }

  function handleFormChange(form: HTMLFormElement) {
    setIsDirty(true);
    if (!isFinancialManual) {
      updateFinancialPreview(form);
    }
  }

  function continueWithoutSaving() {
    const pendingNavigation = pendingNavigationRef.current;
    pendingNavigationRef.current = null;
    allowNavigationRef.current = true;
    setIsDirty(false);
    setShowUnsavedModal(false);
    pendingNavigation?.();

    window.setTimeout(() => {
      allowNavigationRef.current = false;
    }, 0);
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
        ref={formRef}
        className="space-y-4"
        noValidate
        onInput={(event) => handleFormChange(event.currentTarget)}
        onChange={(event) => handleFormChange(event.currentTarget)}
        onSubmit={(event) => {
          if (isSubmittingRef.current) {
            event.preventDefault();
            return;
          }

          const form = event.currentTarget;
          for (const input of Array.from(form.elements)) {
            if (input instanceof HTMLInputElement) {
              const format = input.dataset.format as StandardFormat | undefined;
              input.value = formatStandardValue(input.value, format);
            }
          }

          const nextFieldErrors = validateStudentFormFields(new FormData(form));
          const firstInvalidField = Object.keys(nextFieldErrors)[0];

          if (firstInvalidField) {
            event.preventDefault();
            isSubmittingRef.current = false;
            setIsSubmitting(false);
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

          isSubmittingRef.current = true;
          setFieldErrors({});
          setIsSubmitting(true);
        }}
      >
        <div className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Aluno
            </p>
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                <input
                  name="is_active"
                  type="checkbox"
                  defaultChecked={values?.is_active !== "false"}
                  className="h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)]"
                />
                Aluno ativo
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                <input
                  name="is_scholarship"
                  type="checkbox"
                  checked={isScholarship}
                  onChange={(event) => {
                    const nextIsScholarship = event.currentTarget.checked;
                    setIsScholarship(nextIsScholarship);
                    setIsDirty(true);

                    if (!nextIsScholarship && event.currentTarget.form) {
                      const discountField = event.currentTarget.form.elements.namedItem(
                        "scholarship_discount_percent",
                      );

                      if (discountField instanceof HTMLInputElement) {
                        discountField.value = "";
                      }
                    }
                  }}
                  className="h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)]"
                />
                Aluno bolsista
              </label>
              <label className="flex min-w-[160px] items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                Desconto
                <input
                  name="scholarship_discount_percent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  defaultValue={values?.scholarship_discount_percent ?? ""}
                  disabled={!isScholarship}
                  aria-invalid={Boolean(fieldErrors.scholarship_discount_percent)}
                  aria-describedby={
                    fieldErrors.scholarship_discount_percent
                      ? "scholarship-discount-percent-error"
                      : undefined
                  }
                  className="w-20 rounded-lg border border-[var(--border)] bg-white px-2 py-1.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:bg-[var(--panel)] disabled:text-[var(--muted-foreground)]"
                />
                <span>%</span>
              </label>
            </div>
          </div>
          {fieldErrors.scholarship_discount_percent ? (
            <span id="scholarship-discount-percent-error" className="mt-2 block text-xs font-semibold text-[rgb(185,28,28)]">
              {fieldErrors.scholarship_discount_percent}
            </span>
          ) : null}
          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              Dados pessoais
            </p>
            <div className="mt-3">
              <FieldGrid fields={studentPersonalFields} values={values} errors={fieldErrors} />
            </div>
          </div>
          <div className="mt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              Endereço
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-12">
              <FieldGrid
                fields={studentAddressFields}
                values={values}
                errors={fieldErrors}
                className="contents"
              />
              <label className="block text-sm font-medium text-[var(--foreground)] xl:col-span-2">
                UF
                <select
                  name="state"
                  defaultValue={values?.state ?? ""}
                  className={fieldClassName(Boolean(fieldErrors.state))}
                  aria-invalid={Boolean(fieldErrors.state)}
                  aria-describedby={fieldErrors.state ? "state-error" : undefined}
                >
                  <option value="">Selecione</option>
                  {BRAZIL_STATE_OPTIONS.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.value} - {state.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.state ? (
                  <span id="state-error" className="mt-1 block text-xs font-semibold text-[rgb(185,28,28)]">
                    {fieldErrors.state}
                  </span>
                ) : null}
              </label>
            </div>
          </div>
          <div className="mt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              Curso
            </p>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Livro atual
              <select
                name="current_book"
                defaultValue={values?.current_book ?? ""}
                className={fieldClassName(Boolean(fieldErrors.current_book))}
                aria-invalid={Boolean(fieldErrors.current_book)}
                aria-describedby={fieldErrors.current_book ? "current_book-error" : undefined}
              >
                <option value="">Selecione</option>
                {currentBookOptions.map((book) => (
                  <option key={book.id} value={book.name}>
                    {book.name}
                  </option>
                ))}
              </select>
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
                defaultValue={values?.language ?? "Inglês"}
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
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Origem do responsável financeiro
              <select
                name="financial_contact_source"
                value={financialContactSource}
                onChange={(event) => {
                  const nextSource = event.target.value as FinancialContactSource;
                  setFinancialContactSource(nextSource);
                  setIsDirty(true);
                  if (event.currentTarget.form) {
                    updateFinancialPreview(event.currentTarget.form, nextSource);
                  }
                }}
                className={fieldClassName(Boolean(fieldErrors.financial_contact_source))}
                aria-invalid={Boolean(fieldErrors.financial_contact_source)}
                aria-describedby={fieldErrors.financial_contact_source ? "financial-contact-source-error" : undefined}
              >
                <option value="manual">Cadastrar separadamente</option>
                <option value="primary">Usar responsável 1</option>
                <option value="secondary">Usar responsável 2</option>
              </select>
              {fieldErrors.financial_contact_source ? (
                <span id="financial-contact-source-error" className="mt-1 block text-xs font-semibold text-[rgb(185,28,28)]">
                  {fieldErrors.financial_contact_source}
                </span>
              ) : null}
            </label>
          </div>
          <div className="mt-4">
            <fieldset disabled={!isFinancialManual} className={!isFinancialManual ? "opacity-70" : undefined}>
              <FieldGrid fields={financialFields} values={values} errors={fieldErrors} />
            </fieldset>
            {!isFinancialManual ? (
              <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm leading-6 text-[var(--foreground)]">
                {financialPreview ? (
                  <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    <p><span className="font-semibold">Nome:</span> {financialPreview.name}</p>
                    <p><span className="font-semibold">CPF:</span> {financialPreview.cpf || "-"}</p>
                    <p><span className="font-semibold">Celular:</span> {financialPreview.phone || "-"}</p>
                    <p><span className="font-semibold">Telefone comercial:</span> {financialPreview.workPhone || "-"}</p>
                    <p><span className="font-semibold">E-mail:</span> {financialPreview.email || "-"}</p>
                    <p><span className="font-semibold">Profissão:</span> {financialPreview.profession || "-"}</p>
                    <p><span className="font-semibold">Empresa:</span> {financialPreview.company || "-"}</p>
                  </div>
                ) : (
                  <p className="text-[var(--muted-foreground)]">
                    Preencha o nome do responsável selecionado para visualizar os dados que serão reaproveitados.
                  </p>
                )}
              </div>
            ) : null}
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
            disabled={isSubmitting}
            className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-65"
          >
            {isSubmitting ? "Salvando..." : submitLabel}
          </button>
        </div>
      </form>

      {showUnsavedModal ? (
        <div
          data-unsaved-modal
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.44)] px-4 py-6"
        >
          <div className="w-full max-w-md rounded-lg border border-[rgba(180,83,9,0.18)] bg-white p-6 shadow-2xl shadow-[rgba(15,23,42,0.22)]">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              Sair sem salvar?
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
              Existem dados preenchidos que ainda não foram salvos. Se você sair agora, todo o cadastro digitado será perdido.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  pendingNavigationRef.current = null;
                  setShowUnsavedModal(false);
                }}
                className="rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--panel)]"
              >
                Voltar ao cadastro
              </button>
              <button
                type="button"
                onClick={continueWithoutSaving}
                className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Sair sem salvar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
