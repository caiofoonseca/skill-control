import { notFound } from "next/navigation";

import { PaymentPlanForm } from "@/components/students/payment-plan-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { createPaymentPlanAction } from "./actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewPaymentPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createSupabaseServerClient();

  const { data: student } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("id", id)
    .maybeSingle();

  if (!student) {
    notFound();
  }

  const boundAction = createPaymentPlanAction.bind(null, student.id);

  return (
    <PaymentPlanForm
      studentName={student.full_name}
      cancelHref={`/students/${student.id}`}
      action={boundAction}
      error={error}
    />
  );
}
