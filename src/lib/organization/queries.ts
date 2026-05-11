import { createSupabaseServerClient } from "@/lib/supabase/server";

type TeacherOption = {
  id: string;
  name: string;
  address?: string | null;
  cpf?: string | null;
  rg?: string | null;
  email?: string | null;
  phone?: string | null;
  family_phone?: string | null;
  active?: boolean;
};

type BookOption = {
  id: string;
  name: string;
  active?: boolean;
};

type ClassOptionRow = {
  id: string;
  name: string;
  teacher_id: string | null;
  teachers?: { name: string | null } | { name: string | null }[] | null;
};

type StudentClassUsageRow = {
  id: string;
  full_name?: string;
  class_name: string | null;
  teacher_name?: string | null;
};

type StudentTeacherUsageRow = {
  id: string;
  teacher_name: string | null;
};

type MonthlyBirthdayRow = {
  id: string;
  full_name: string;
  birth_date: string | null;
};

function getTeacherName(value: ClassOptionRow["teachers"]) {
  if (Array.isArray(value)) {
    return value[0]?.name ?? null;
  }

  return value?.name ?? null;
}

export async function getStudentOptions() {
  const supabase = await createSupabaseServerClient();

  const [{ data: classes }, { data: teachers }, { data: books }] = await Promise.all([
    supabase
      .from("course_classes")
      .select("id, name, teacher_id, teachers(name)")
      .eq("active", true)
      .order("name", { ascending: true }),
    supabase
      .from("teachers")
      .select("id, name")
      .eq("active", true)
      .order("name", { ascending: true }),
    supabase
      .from("books")
      .select("id, name")
      .eq("active", true)
      .order("name", { ascending: true }),
  ]);

  const classRows = (classes ?? []) as ClassOptionRow[];
  const teacherRows = (teachers ?? []) as TeacherOption[];
  const bookRows = (books ?? []) as BookOption[];

  return {
    classOptions: classRows.map((item) => ({
      id: item.id,
      name: item.name,
      teacherId: item.teacher_id,
      teacherName: getTeacherName(item.teachers),
    })),
    teacherOptions: teacherRows,
    bookOptions: bookRows,
  };
}

export async function getBookManagementData() {
  const supabase = await createSupabaseServerClient();

  const [{ data: books }, { data: students }] = await Promise.all([
    supabase.from("books").select("*").order("name", { ascending: true }),
    supabase.from("students").select("id, current_book"),
  ]);

  const bookRows = (books ?? []) as BookOption[];
  const usageMap = new Map<string, number>();

  for (const student of students ?? []) {
    if (!student.current_book) continue;
    usageMap.set(student.current_book, (usageMap.get(student.current_book) ?? 0) + 1);
  }

  return bookRows.map((book) => ({
    ...book,
    studentCount: usageMap.get(book.name) ?? 0,
  }));
}

export async function getClassManagementData() {
  const supabase = await createSupabaseServerClient();

  const [{ data: classes }, { data: students }] = await Promise.all([
    supabase
      .from("course_classes")
      .select("id, name, active, teacher_id, teachers(name)")
      .order("name", { ascending: true }),
    supabase.from("students").select("id, full_name, class_name, teacher_name").order("full_name", { ascending: true }),
  ]);

  const classRows = (classes ?? []) as ClassOptionRow[];
  const studentRows = (students ?? []) as StudentClassUsageRow[];
  const usageMap = new Map<string, number>();

  for (const student of studentRows) {
    if (!student.class_name) continue;
    usageMap.set(student.class_name, (usageMap.get(student.class_name) ?? 0) + 1);
  }

  return classRows.map((item) => ({
    ...item,
    teacherName: getTeacherName(item.teachers),
    studentCount: usageMap.get(item.name) ?? 0,
    students: studentRows
      .filter((student) => student.class_name === item.name)
      .map((student) => ({
        id: student.id,
        fullName: student.full_name ?? "",
        teacherName: student.teacher_name ?? null,
      })),
  }));
}

export async function getTeacherManagementData() {
  const supabase = await createSupabaseServerClient();

  const [{ data: teachers }, { data: students }, { data: classes }] = await Promise.all([
    supabase.from("teachers").select("*").order("name", { ascending: true }),
    supabase.from("students").select("id, teacher_name"),
    supabase.from("course_classes").select("id, name, teacher_id").order("name", { ascending: true }),
  ]);

  const teacherRows = (teachers ?? []) as TeacherOption[];
  const studentRows = (students ?? []) as StudentTeacherUsageRow[];
  const classRows = (classes ?? []) as Array<Pick<ClassOptionRow, "id" | "name" | "teacher_id">>;
  const usageMap = new Map<string, number>();

  for (const student of studentRows) {
    if (!student.teacher_name) continue;
    usageMap.set(student.teacher_name, (usageMap.get(student.teacher_name) ?? 0) + 1);
  }

  return teacherRows.map((item) => {
    const linkedClasses = classRows.filter((courseClass) => courseClass.teacher_id === item.id);

    return {
      ...item,
      studentCount: usageMap.get(item.name) ?? 0,
      classCount: linkedClasses.length,
      classNames: linkedClasses.map((courseClass) => courseClass.name),
    };
  });
}

export async function getMonthlyBirthdays() {
  const supabase = await createSupabaseServerClient();
  const currentMonth = new Date().getMonth() + 1;

  const { data } = await supabase
    .from("students")
    .select("id, full_name, birth_date")
    .not("birth_date", "is", null)
    .order("full_name", { ascending: true });

  const students = (data ?? []) as MonthlyBirthdayRow[];

  return students
    .filter((student) => {
      if (!student.birth_date) return false;
      return new Date(`${student.birth_date}T12:00:00`).getMonth() + 1 === currentMonth;
    })
    .map((student) => ({
      id: student.id,
      fullName: student.full_name,
      birthDate: student.birth_date as string,
      day: new Date(`${student.birth_date}T12:00:00`).getDate(),
    }))
    .sort((a, b) => a.day - b.day || a.fullName.localeCompare(b.fullName, "pt-BR"));
}
