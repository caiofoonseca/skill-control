import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStudentDetails } from "@/lib/students/queries";

const ENROLLMENT_FEE_PLAN_TYPES = new Set([
  "enrollment",
  "enrollment_fee",
  "re_enrollment_fee",
  "enrollment_first_installment",
]);

const COURSE_VALUE_PLAN_TYPES = new Set([
  "installments",
  "monthly_payment",
  "full_course",
  "down_payment",
]);

export async function getStudentContractData(studentId: string) {
  const supabase = await createSupabaseServerClient();
  const details = await getStudentDetails(studentId);

  const { data: courseClass } = details.student?.class_name
    ? await supabase
        .from("course_classes")
        .select("*")
        .eq("name", details.student.class_name)
        .maybeSingle()
    : { data: null };

  const materialPlan =
    details.paymentPlans.find((plan) => plan.payment_type === "course_material") ?? null;
  const enrollmentPlan =
    details.paymentPlans.find((plan) => ENROLLMENT_FEE_PLAN_TYPES.has(plan.payment_type)) ?? null;
  const mainPlan =
    details.paymentPlans.find((plan) => COURSE_VALUE_PLAN_TYPES.has(plan.payment_type)) ?? null;

  const materialInstallments = materialPlan
    ? details.installments.filter((installment) => installment.payment_plan_id === materialPlan.id)
    : [];
  const mainInstallments = mainPlan
    ? details.installments.filter((installment) => installment.payment_plan_id === mainPlan.id)
    : [];

  return {
    ...details,
    courseClass: courseClass ?? null,
    materialPlan,
    materialInstallments,
    enrollmentPlan,
    mainPlan,
    mainInstallments,
  };
}

export async function getContractEmissions(studentId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("contract_emissions")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export function isMinor(birthDate: string | null): boolean {
  if (!birthDate) {
    return false;
  }

  const today = new Date();
  const dob = new Date(`${birthDate}T12:00:00`);
  let age = today.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }

  return age < 18;
}

export function getInstallmentDueDateRange(installments: Array<{ due_date: string | null }>) {
  const dueDates = installments
    .map((installment) => installment.due_date)
    .filter((value): value is string => Boolean(value))
    .sort();

  if (dueDates.length === 0) {
    return { first: null as string | null, last: null as string | null };
  }

  return { first: dueDates[0], last: dueDates[dueDates.length - 1] };
}
