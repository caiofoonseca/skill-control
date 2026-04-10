import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function escapeCsvValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const normalized = value.replace(/"/g, '""');
  return `"${normalized}"`;
}

function isMissingNewStudentColumn(error: { message?: string } | null) {
  return error?.message?.includes("is_active") || error?.message?.includes("language") || false;
}

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const className = searchParams.get("class")?.trim() ?? "";
  const teacherName = searchParams.get("teacher")?.trim() ?? "";

  let builder = supabase
    .from("students")
    .select(
      "full_name, class_name, teacher_name, phone, email, city, state, created_at, is_active, language",
    )
    .order("created_at", { ascending: false });

  if (query) {
    builder = builder.or(
      `full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`,
    );
  }

  if (className) {
    builder = builder.eq("class_name", className);
  }

  if (teacherName) {
    builder = builder.eq("teacher_name", teacherName);
  }

  const exportResult = await builder;
  let data = exportResult.data;
  let error = exportResult.error;

  if (isMissingNewStudentColumn(error)) {
    let fallbackBuilder = supabase
      .from("students")
      .select("full_name, class_name, teacher_name, phone, email, city, state, created_at")
      .order("created_at", { ascending: false });

    if (query) {
      fallbackBuilder = fallbackBuilder.or(
        `full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`,
      );
    }

    if (className) {
      fallbackBuilder = fallbackBuilder.eq("class_name", className);
    }

    if (teacherName) {
      fallbackBuilder = fallbackBuilder.eq("teacher_name", teacherName);
    }

    const fallbackResult = await fallbackBuilder;
    data =
      fallbackResult.data?.map((student) => ({
        ...student,
        is_active: true,
        language: "Ingles",
      })) ?? null;
    error = fallbackResult.error;
  }

  if (error) {
    return new NextResponse("Erro ao exportar alunos", { status: 500 });
  }

  const header = [
    "nome",
    "turma",
    "idioma",
    "professor",
    "celular",
    "email",
    "cidade",
    "uf",
    "status",
    "data_cadastro",
  ];

  const rows = (data ?? []).map((student) =>
    [
      escapeCsvValue(student.full_name),
      escapeCsvValue(student.class_name),
      escapeCsvValue(student.language),
      escapeCsvValue(student.teacher_name),
      escapeCsvValue(student.phone),
      escapeCsvValue(student.email),
      escapeCsvValue(student.city),
      escapeCsvValue(student.state),
      escapeCsvValue(student.is_active ? "Ativo" : "Inativo"),
      escapeCsvValue(
        new Date(student.created_at).toLocaleDateString("pt-BR"),
      ),
    ].join(","),
  );

  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="alunos-skill-control.csv"',
    },
  });
}
