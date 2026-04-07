import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getStudentOptions() {
  const supabase = await createSupabaseServerClient();

  const [{ data: classes }, { data: teachers }] = await Promise.all([
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
  ]);

  return {
    classOptions:
      classes?.map((item) => ({
        id: item.id,
        name: item.name,
        teacherId: item.teacher_id,
        teacherName: Array.isArray(item.teachers)
          ? item.teachers[0]?.name ?? null
          : item.teachers?.name ?? null,
      })) ?? [],
    teacherOptions: teachers ?? [],
  };
}

export async function getClassManagementData() {
  const supabase = await createSupabaseServerClient();

  const [{ data: classes }, { data: students }] = await Promise.all([
    supabase
      .from("course_classes")
      .select("id, name, active, teacher_id, teachers(name)")
      .order("name", { ascending: true }),
    supabase.from("students").select("id, class_name"),
  ]);

  const usageMap = new Map<string, number>();

  for (const student of students ?? []) {
    if (!student.class_name) continue;
    usageMap.set(student.class_name, (usageMap.get(student.class_name) ?? 0) + 1);
  }

  return (classes ?? []).map((item) => ({
    ...item,
    teacherName: Array.isArray(item.teachers)
      ? item.teachers[0]?.name ?? null
      : item.teachers?.name ?? null,
    studentCount: usageMap.get(item.name) ?? 0,
  }));
}

export async function getTeacherManagementData() {
  const supabase = await createSupabaseServerClient();

  const [{ data: teachers }, { data: students }, { data: classes }] = await Promise.all([
    supabase.from("teachers").select("*").order("name", { ascending: true }),
    supabase.from("students").select("id, teacher_name"),
    supabase.from("course_classes").select("id, name, teacher_id").order("name", { ascending: true }),
  ]);

  const usageMap = new Map<string, number>();

  for (const student of students ?? []) {
    if (!student.teacher_name) continue;
    usageMap.set(student.teacher_name, (usageMap.get(student.teacher_name) ?? 0) + 1);
  }

  return (teachers ?? []).map((item) => {
    const linkedClasses = (classes ?? []).filter((courseClass) => courseClass.teacher_id === item.id);

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

  return (data ?? [])
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
