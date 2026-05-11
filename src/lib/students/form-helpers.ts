import { BRAZIL_STATE_VALUES } from "@/lib/brazil/states";
import type { Database } from "@/types/supabase";

export type GuardianInsert = Database["public"]["Tables"]["student_guardians"]["Insert"];
export type FinancialInsert =
  Database["public"]["Tables"]["student_financial_contacts"]["Insert"];
export type StudentInsert = Database["public"]["Tables"]["students"]["Insert"];
export type StudentUpdate = Database["public"]["Tables"]["students"]["Update"];

const studentSourceOptions = [
  "Redes sociais",
  "Google",
  "Indicação de amigos/família",
  "Parceria/convênio",
  "Pela fachada/placa escola",
  "Outros",
];

const studentLanguageOptions = [
  "Inglês",
  "Alemão",
  "Francês",
  "Espanhol",
  "Português para estrangeiros",
];

type GuardianRole = "primary" | "secondary";

export function getTextValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

function onlyDigits(value: string | null) {
  return value?.replace(/\D/g, "") ?? "";
}

function formatCpf(value: string | null) {
  const digits = onlyDigits(value);
  if (digits.length !== 11) return value;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatZipCode(value: string | null) {
  const digits = onlyDigits(value);
  if (digits.length !== 8) return value;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function formatPhone(value: string | null) {
  const digits = onlyDigits(value);
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return value;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function isValidCpf(value: string) {
  const cpf = onlyDigits(value);

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const calculateDigit = (size: number) => {
    const sum = cpf
      .slice(0, size)
      .split("")
      .reduce((total, digit, index) => total + Number(digit) * (size + 1 - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return calculateDigit(9) === Number(cpf[9]) && calculateDigit(10) === Number(cpf[10]);
}

function isPersonName(value: string) {
  return /^[A-Za-zÀ-ÖØ-öø-ÿ' ]+$/.test(value);
}

function isNumericText(value: string) {
  return /^[0-9]+[0-9\-\/ ]*$/.test(value);
}

function isAlphaText(value: string) {
  return /^[A-Za-zÀ-ÖØ-öø-ÿ' ]+$/.test(value);
}

function isAddressText(value: string) {
  return /^[0-9A-Za-zÀ-ÖØ-öø-ÿ'.,ºª\-\/ ]+$/.test(value);
}

function isSimpleText(value: string) {
  return /^[0-9A-Za-zÀ-ÖØ-öø-ÿ'.,ºª\-\/ ]+$/.test(value);
}

function isValidZipCode(value: string) {
  return onlyDigits(value).length === 8;
}

function isValidPhone(value: string) {
  const digits = onlyDigits(value);
  return digits.length >= 8 && digits.length <= 11;
}

function isValidBirthDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return !Number.isNaN(date.getTime()) && date <= today;
}

function isValidInstagram(value: string) {
  return /^@?[A-Za-z0-9._]{1,30}$/.test(value);
}

function validateOptionalEmail(formData: FormData, key: string, label: string) {
  const value = getTextValue(formData, key);
  if (value && !isValidEmail(value)) {
    return { key, message: `Informe um e-mail válido para ${label}.` };
  }
  return null;
}

function validateOptionalCpf(formData: FormData, key: string, label: string) {
  const value = getTextValue(formData, key);
  if (value && !isValidCpf(value)) {
    return { key, message: `Informe um CPF válido para ${label}.` };
  }
  return null;
}

function validateOptionalName(formData: FormData, key: string, label: string) {
  const value = getTextValue(formData, key);
  if (value && !isPersonName(value)) {
    return { key, message: `${label} deve conter apenas letras e espaços.` };
  }
  return null;
}

function validateOptionalZipCode(formData: FormData, key: string) {
  const value = getTextValue(formData, key);
  if (value && !isValidZipCode(value)) {
    return { key, message: "Campo inválido. Informe um CEP com 8 números." };
  }
  return null;
}

function validateOptionalPhone(formData: FormData, key: string, label: string) {
  const value = getTextValue(formData, key);
  if (value && !isValidPhone(value)) {
    return { key, message: `Informe um telefone válido para ${label}.` };
  }
  return null;
}

function validateOptionalAlphaText(formData: FormData, key: string, label: string) {
  const value = getTextValue(formData, key);
  if (value && !isAlphaText(value)) {
    return { key, message: `${label} deve conter apenas letras e espaços.` };
  }
  return null;
}

function validateOptionalAddressText(formData: FormData, key: string, label: string) {
  const value = getTextValue(formData, key);
  if (value && !isAddressText(value)) {
    return { key, message: `${label} contém caracteres inválidos.` };
  }
  return null;
}

function validateOptionalSimpleText(formData: FormData, key: string, label: string) {
  const value = getTextValue(formData, key);
  if (value && !isSimpleText(value)) {
    return { key, message: `${label} contém caracteres inválidos.` };
  }
  return null;
}

function validateOptionalBirthDate(formData: FormData, key: string) {
  const value = getTextValue(formData, key);
  if (value && !isValidBirthDate(value)) {
    return { key, message: "Campo inválido. Informe uma data de nascimento válida." };
  }
  return null;
}

function validateOptionalInstagram(formData: FormData, key: string, label: string) {
  const value = getTextValue(formData, key);
  if (value && !isValidInstagram(value)) {
    return { key, message: `Informe um Instagram válido para ${label}.` };
  }
  return null;
}

function validateOptionalSource(formData: FormData, key: string) {
  const value = getTextValue(formData, key);
  if (value && !studentSourceOptions.includes(value)) {
    return { key, message: "Selecione uma origem válida." };
  }
  return null;
}

function getFinancialContactSource(formData: FormData): "manual" | GuardianRole {
  const value = getTextValue(formData, "financial_contact_source");
  if (value === "primary" || value === "secondary") {
    return value;
  }

  return "manual";
}

function validateStudentLanguage(formData: FormData, key: string) {
  const value = getTextValue(formData, key) ?? "Inglês";
  if (!studentLanguageOptions.includes(value)) {
    return { key, message: "Selecione um idioma válido." };
  }
  return null;
}

function getScholarshipDiscountPercent(formData: FormData) {
  const value = getTextValue(formData, "scholarship_discount_percent");
  if (!value) return null;

  const normalizedValue = value.replace(",", ".");
  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue)) return null;
  return parsedValue;
}

export function validateStudentFormFields(formData: FormData) {
  const errors: Record<string, string> = {};
  const fullName = getTextValue(formData, "full_name");

  if (!fullName) {
    errors.full_name = "Campo obrigatório.";
  } else if (!isPersonName(fullName)) {
    errors.full_name = "Campo inválido. Use apenas letras e espaços.";
  }

  const addressNumber = getTextValue(formData, "address_number");
  if (addressNumber && !isNumericText(addressNumber)) {
    errors.address_number = "Campo inválido. Use apenas números.";
  }

  const state = getTextValue(formData, "state");
  if (state && !BRAZIL_STATE_VALUES.includes(state as (typeof BRAZIL_STATE_VALUES)[number])) {
    errors.state = "Campo inválido. Selecione uma UF válida.";
  }

  const validations = [
    validateOptionalAddressText(formData, "address", "Endereço"),
    validateOptionalSimpleText(formData, "apartment", "Complemento"),
    validateOptionalAlphaText(formData, "neighborhood", "Bairro"),
    validateOptionalAlphaText(formData, "city", "Cidade"),
    validateOptionalZipCode(formData, "zip_code"),
    validateStudentLanguage(formData, "language"),
    validateOptionalInstagram(formData, "instagram", "o aluno"),
    validateOptionalEmail(formData, "email", "o aluno"),
    validateOptionalBirthDate(formData, "birth_date"),
    validateOptionalEmail(formData, "guardian1_email", "o responsável 1"),
    validateOptionalEmail(formData, "guardian2_email", "o responsável 2"),
    validateOptionalEmail(formData, "financial_email", "o responsável financeiro"),
    validateOptionalCpf(formData, "cpf", "o aluno"),
    validateOptionalCpf(formData, "guardian1_cpf", "o responsável 1"),
    validateOptionalCpf(formData, "guardian2_cpf", "o responsável 2"),
    validateOptionalCpf(formData, "financial_cpf", "o responsável financeiro"),
    validateOptionalPhone(formData, "phone", "o aluno"),
    validateOptionalPhone(formData, "guardian1_phone", "o responsável 1"),
    validateOptionalPhone(formData, "guardian1_work_phone", "o responsável 1"),
    validateOptionalPhone(formData, "guardian2_phone", "o responsável 2"),
    validateOptionalPhone(formData, "guardian2_work_phone", "o responsável 2"),
    validateOptionalPhone(formData, "financial_phone", "o responsável financeiro"),
    validateOptionalPhone(formData, "financial_work_phone", "o responsável financeiro"),
    validateOptionalAlphaText(formData, "profession", "Profissão"),
    validateOptionalAlphaText(formData, "guardian1_profession", "Profissão do responsável 1"),
    validateOptionalAlphaText(formData, "guardian2_profession", "Profissão do responsável 2"),
    validateOptionalAlphaText(formData, "financial_profession", "Profissão do responsável financeiro"),
    validateOptionalAddressText(formData, "financial_address", "Endereço do responsável financeiro"),
    validateOptionalSimpleText(formData, "rg", "RG"),
    validateOptionalSimpleText(formData, "current_book", "Livro atual"),
    validateOptionalSource(formData, "source"),
    validateOptionalInstagram(formData, "guardian1_instagram", "o responsável 1"),
    validateOptionalInstagram(formData, "guardian2_instagram", "o responsável 2"),
    validateOptionalName(formData, "guardian1_full_name", "O nome do responsável 1"),
    validateOptionalName(formData, "guardian2_full_name", "O nome do responsável 2"),
    validateOptionalName(formData, "financial_full_name", "O nome do responsável financeiro"),
  ];

  for (const validation of validations) {
    if (validation && !errors[validation.key]) {
      errors[validation.key] = validation.message;
    }
  }

  if (!getTextValue(formData, "guardian1_full_name") && (
    getTextValue(formData, "guardian1_cpf") || getTextValue(formData, "guardian1_email")
  )) {
    errors.guardian1_full_name = "Informe o nome ou limpe os dados deste responsável.";
  }

  if (!getTextValue(formData, "guardian2_full_name") && (
    getTextValue(formData, "guardian2_cpf") || getTextValue(formData, "guardian2_email")
  )) {
    errors.guardian2_full_name = "Informe o nome ou limpe os dados deste responsável.";
  }

  const financialContactSource = getFinancialContactSource(formData);
  const scholarshipDiscountPercent = getScholarshipDiscountPercent(formData);

  if (scholarshipDiscountPercent !== null && (
    scholarshipDiscountPercent < 0 || scholarshipDiscountPercent > 100
  )) {
    errors.scholarship_discount_percent = "Informe um desconto entre 0% e 100%.";
  }

  if (formData.get("is_scholarship") !== "on" && scholarshipDiscountPercent !== null) {
    errors.scholarship_discount_percent = "Marque aluno bolsista para informar o percentual.";
  }

  if (financialContactSource === "manual") {
    if (!getTextValue(formData, "financial_full_name") && (
      getTextValue(formData, "financial_cpf") || getTextValue(formData, "financial_email")
    )) {
      errors.financial_full_name = "Informe o nome ou limpe os dados do responsável financeiro.";
    }
  } else {
    const sourcePrefix = financialContactSource === "primary" ? "guardian1" : "guardian2";
    if (!getTextValue(formData, `${sourcePrefix}_full_name`)) {
      errors.financial_contact_source = "Informe o nome do responsável selecionado antes de usá-lo como financeiro.";
    }
  }

  return errors;
}

export function validateStudentForm(formData: FormData) {
  const errors = validateStudentFormFields(formData);
  const firstError = Object.values(errors)[0];
  return firstError ?? null;
}

export function getRequiredTextValue(
  formData: FormData,
  key: string,
  fallback: string,
) {
  const value = getTextValue(formData, key);
  return value ?? fallback;
}

export function buildStudentPayload(
  formData: FormData,
): StudentInsert | StudentUpdate {
  return {
    full_name: getTextValue(formData, "full_name") ?? "",
    address: getTextValue(formData, "address"),
    address_number: getTextValue(formData, "address_number"),
    apartment: getTextValue(formData, "apartment"),
    neighborhood: getTextValue(formData, "neighborhood"),
    city: getTextValue(formData, "city"),
    state: getTextValue(formData, "state"),
    zip_code: formatZipCode(getTextValue(formData, "zip_code")),
    instagram: getTextValue(formData, "instagram"),
    email: getTextValue(formData, "email"),
    birth_date: getTextValue(formData, "birth_date"),
    cpf: formatCpf(getTextValue(formData, "cpf")),
    rg: getTextValue(formData, "rg"),
    phone: formatPhone(getTextValue(formData, "phone")),
    profession: getTextValue(formData, "profession"),
    class_name: getTextValue(formData, "class_name"),
    schedule: getTextValue(formData, "schedule"),
    teacher_name: getTextValue(formData, "teacher_name"),
    current_book: getTextValue(formData, "current_book"),
    source: getTextValue(formData, "source"),
    payment_notes: getTextValue(formData, "payment_notes"),
    is_active: formData.get("is_active") === "on",
    is_scholarship: formData.get("is_scholarship") === "on",
    scholarship_discount_percent:
      formData.get("is_scholarship") === "on"
        ? getScholarshipDiscountPercent(formData)
        : null,
    language: getTextValue(formData, "language") ?? "Inglês",
  };
}

export function buildGuardianPayload(
  formData: FormData,
  studentId: string,
  guardianType: "primary" | "secondary",
): GuardianInsert | null {
  const prefix = guardianType === "primary" ? "guardian1" : "guardian2";
  const fullName = getTextValue(formData, `${prefix}_full_name`);

  if (!fullName) {
    return null;
  }

  return {
    student_id: studentId,
    guardian_type: guardianType,
    full_name: fullName,
    cpf: formatCpf(getTextValue(formData, `${prefix}_cpf`)),
    profession: getTextValue(formData, `${prefix}_profession`),
    company: getTextValue(formData, `${prefix}_company`),
    phone: formatPhone(getTextValue(formData, `${prefix}_phone`)),
    work_phone: formatPhone(getTextValue(formData, `${prefix}_work_phone`)),
    email: getTextValue(formData, `${prefix}_email`),
    instagram: getTextValue(formData, `${prefix}_instagram`),
  };
}

export function buildFinancialContactPayload(
  formData: FormData,
  studentId: string,
): FinancialInsert | null {
  const source = getFinancialContactSource(formData);
  const fullName =
    source === "manual"
      ? getTextValue(formData, "financial_full_name")
      : getTextValue(
          formData,
          source === "primary" ? "guardian1_full_name" : "guardian2_full_name",
        );

  if (!fullName) {
    return null;
  }

  if (source === "primary" || source === "secondary") {
    const prefix = source === "primary" ? "guardian1" : "guardian2";

    return {
      student_id: studentId,
      full_name: fullName,
      cpf: formatCpf(getTextValue(formData, `${prefix}_cpf`)),
      address: null,
      profession: getTextValue(formData, `${prefix}_profession`),
      company: getTextValue(formData, `${prefix}_company`),
      phone: formatPhone(getTextValue(formData, `${prefix}_phone`)),
      work_phone: formatPhone(getTextValue(formData, `${prefix}_work_phone`)),
      email: getTextValue(formData, `${prefix}_email`),
      source_guardian_type: source,
    };
  }

  return {
    student_id: studentId,
    full_name: fullName,
    cpf: formatCpf(getTextValue(formData, "financial_cpf")),
    address: getTextValue(formData, "financial_address"),
    profession: getTextValue(formData, "financial_profession"),
    company: getTextValue(formData, "financial_company"),
    phone: formatPhone(getTextValue(formData, "financial_phone")),
    work_phone: formatPhone(getTextValue(formData, "financial_work_phone")),
    email: getTextValue(formData, "financial_email"),
    source_guardian_type: null,
  };
}
