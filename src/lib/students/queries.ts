import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getStudentDetails(studentId: string) {
  const supabase = await createSupabaseServerClient();

  const [
    { data: student },
    { data: guardians },
    { data: financialContact },
    { data: paymentPlans },
    { data: installments },
  ] =
    await Promise.all([
      supabase.from("students").select("*").eq("id", studentId).maybeSingle(),
      supabase
        .from("student_guardians")
        .select("*")
        .eq("student_id", studentId)
        .order("guardian_type", { ascending: true }),
      supabase
        .from("student_financial_contacts")
        .select("*")
        .eq("student_id", studentId)
        .maybeSingle(),
      supabase
        .from("student_payment_plans")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false }),
      supabase
        .from("student_payment_installments")
        .select("*")
        .eq("student_id", studentId)
        .order("installment_number", { ascending: true }),
    ]);

  return {
    student,
    guardians: guardians ?? [],
    financialContact,
    paymentPlans: paymentPlans ?? [],
    installments: installments ?? [],
  };
}
