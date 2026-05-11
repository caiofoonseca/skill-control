"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isMasterUser } from "@/lib/users/permissions";

function getTextValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

export async function saveCurrentUserProfileAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const isMaster = isMasterUser(user.email);
  const { data: currentProfile } = await supabase
    .from("user_profiles")
    .select("role, can_delete_records, can_access_financial, active")
    .eq("id", user.id)
    .maybeSingle();

  const role = currentProfile?.role === "viewer" ? "viewer" : "secretary";

  const { error } = await supabase.from("user_profiles").upsert({
    id: user.id,
    email: user.email,
    full_name: getTextValue(formData, "full_name"),
    role,
    can_delete_records: false,
    can_access_financial: isMaster ? true : role === "secretary",
    active: currentProfile?.active ?? true,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    redirect(`/users?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/users");
  redirect("/users?updated=Perfil+salvo+com+sucesso");
}

export async function createUserAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isMasterUser(user?.email)) {
    redirect("/users?error=Apenas+usuarios+MASTER+podem+criar+usuarios");
  }

  const adminSupabase = createSupabaseAdminClient();

  if (!adminSupabase) {
    redirect("/users?error=Configure+SUPABASE_SERVICE_ROLE_KEY+para+criar+usuarios+pelo+sistema");
  }

  const email = getTextValue(formData, "email")?.toLowerCase();
  const password = getTextValue(formData, "password");
  const fullName = getTextValue(formData, "full_name");
  const requestedRole = getTextValue(formData, "role");
  const role = requestedRole === "viewer" ? "viewer" : "secretary";

  if (!email || !password || password.length < 6) {
    redirect("/users?error=Informe+email+e+senha+com+pelo+menos+6+caracteres");
  }

  if (isMasterUser(email)) {
    redirect("/users?error=Usuarios+MASTER+ja+sao+definidos+pelos+emails+dos+proprietarios");
  }

  const { data: createdUser, error: createError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  });

  if (createError || !createdUser.user) {
    redirect(`/users?error=${encodeURIComponent(createError?.message ?? "Nao foi possivel criar o usuario")}`);
  }

  const { error: profileError } = await adminSupabase.from("user_profiles").upsert({
    id: createdUser.user.id,
    email,
    full_name: fullName,
    role,
    can_delete_records: false,
    can_access_financial: role === "secretary",
    active: true,
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    redirect("/users?error=Usuario+criado+no+Auth+mas+nao+foi+possivel+salvar+o+perfil");
  }

  revalidatePath("/users");
  redirect("/users?updated=Usuario+criado+com+sucesso");
}

export async function updateUserProfileAction(profileId: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isMasterUser(user?.email)) {
    redirect("/users?error=Apenas+usuarios+MASTER+podem+editar+usuarios");
  }

  const { data: targetProfile, error: targetError } = await supabase
    .from("user_profiles")
    .select("id, email")
    .eq("id", profileId)
    .maybeSingle();

  if (targetError || !targetProfile) {
    redirect("/users?error=Usuario+nao+encontrado");
  }

  if (isMasterUser(targetProfile.email) && targetProfile.id !== user?.id) {
    redirect("/users?error=Um+MASTER+nao+pode+editar+outro+MASTER");
  }

  const requestedRole = getTextValue(formData, "role");
  const role = requestedRole === "viewer" ? "viewer" : "secretary";
  const isTargetMaster = isMasterUser(targetProfile.email);
  const safeRole = isTargetMaster ? "secretary" : role;

  const { error } = await supabase
    .from("user_profiles")
    .update({
      full_name: getTextValue(formData, "full_name"),
      role: safeRole,
      can_delete_records: false,
      can_access_financial: isTargetMaster || safeRole === "secretary",
      active: isTargetMaster ? true : formData.get("active") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId);

  if (error) {
    redirect(`/users?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/users");
  redirect("/users?updated=Usuario+atualizado+com+sucesso");
}
