import type { Database } from "@/types/supabase";

export type GuardianInsert = Database["public"]["Tables"]["student_guardians"]["Insert"];
export type FinancialInsert =
  Database["public"]["Tables"]["student_financial_contacts"]["Insert"];
export type StudentInsert = Database["public"]["Tables"]["students"]["Insert"];
export type StudentUpdate = Database["public"]["Tables"]["students"]["Update"];

export function getTextValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
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
    zip_code: getTextValue(formData, "zip_code"),
    instagram: getTextValue(formData, "instagram"),
    email: getTextValue(formData, "email"),
    birth_date: getTextValue(formData, "birth_date"),
    cpf: getTextValue(formData, "cpf"),
    rg: getTextValue(formData, "rg"),
    phone: getTextValue(formData, "phone"),
    profession: getTextValue(formData, "profession"),
    class_name: getTextValue(formData, "class_name"),
    schedule: getTextValue(formData, "schedule"),
    teacher_name: getTextValue(formData, "teacher_name"),
    current_book: getTextValue(formData, "current_book"),
    source: getTextValue(formData, "source"),
    payment_notes: getTextValue(formData, "payment_notes"),
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
    cpf: getTextValue(formData, `${prefix}_cpf`),
    profession: getTextValue(formData, `${prefix}_profession`),
    company: getTextValue(formData, `${prefix}_company`),
    phone: getTextValue(formData, `${prefix}_phone`),
    work_phone: getTextValue(formData, `${prefix}_work_phone`),
    email: getTextValue(formData, `${prefix}_email`),
    instagram: getTextValue(formData, `${prefix}_instagram`),
  };
}

export function buildFinancialContactPayload(
  formData: FormData,
  studentId: string,
): FinancialInsert | null {
  const fullName = getTextValue(formData, "financial_full_name");

  if (!fullName) {
    return null;
  }

  return {
    student_id: studentId,
    full_name: fullName,
    cpf: getTextValue(formData, "financial_cpf"),
    address: getTextValue(formData, "financial_address"),
    profession: getTextValue(formData, "financial_profession"),
    company: getTextValue(formData, "financial_company"),
    phone: getTextValue(formData, "financial_phone"),
    work_phone: getTextValue(formData, "financial_work_phone"),
    email: getTextValue(formData, "financial_email"),
  };
}
