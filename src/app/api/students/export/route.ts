import ExcelJS from "exceljs";
import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function isMissingNewStudentColumn(error: { message?: string } | null) {
  return error?.message?.includes("is_active")
    || error?.message?.includes("language")
    || error?.message?.includes("is_scholarship")
    || false;
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
      "full_name, class_name, teacher_name, phone, email, city, state, created_at, is_active, is_scholarship, language",
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
        is_scholarship: false,
        language: "Inglês",
      })) ?? null;
    error = fallbackResult.error;
  }

  if (error) {
    return new NextResponse("Erro ao exportar alunos", { status: 500 });
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Skill Control";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Alunos");
  worksheet.columns = [
    { header: "Nome", key: "full_name", width: 28 },
    { header: "Turma", key: "class_name", width: 24 },
    { header: "Idioma", key: "language", width: 26 },
    { header: "Professor", key: "teacher_name", width: 24 },
    { header: "Celular", key: "phone", width: 18 },
    { header: "E-mail", key: "email", width: 30 },
    { header: "Cidade", key: "city", width: 18 },
    { header: "UF", key: "state", width: 10 },
    { header: "Status", key: "status", width: 14 },
    { header: "Bolsista", key: "scholarship", width: 14 },
    { header: "Data de cadastro", key: "created_at", width: 18 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0B1F3A" },
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };

  for (const student of data ?? []) {
    worksheet.addRow({
      full_name: student.full_name ?? "",
      class_name: student.class_name ?? "",
      language: student.language ?? "Inglês",
      teacher_name: student.teacher_name ?? "",
      phone: student.phone ?? "",
      email: student.email ?? "",
      city: student.city ?? "",
      state: student.state ?? "",
      status: student.is_active ? "Ativo" : "Inativo",
      scholarship: student.is_scholarship ? "Sim" : "Não",
      created_at: new Date(student.created_at).toLocaleDateString("pt-BR"),
    });
  }

  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.eachRow((row, rowNumber) => {
    row.alignment = { vertical: "middle", horizontal: "left" };
    row.border = {
      bottom: {
        style: "thin",
        color: { argb: rowNumber === 1 ? "FF0B1F3A" : "FFE2E8F0" },
      },
    };

    if (rowNumber > 1 && rowNumber % 2 === 0) {
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF8FAFC" },
      };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="alunos-skill-control.xlsx"',
    },
  });
}
