export const MASTER_USER_EMAILS = [
  "gfaquino@gmail.com",
  "passimachado@hotmail.com",
] as const;

export type UserRole = "master" | "secretary" | "viewer";

export function isMasterUser(email: string | null | undefined) {
  if (!email) return false;
  return MASTER_USER_EMAILS.includes(email.toLowerCase() as (typeof MASTER_USER_EMAILS)[number]);
}

type PermissionSupabaseClient = {
  auth: {
    getUser: () => Promise<{ data: { user: { id: string; email?: string | null } | null } }>;
  };
  from: (table: string) => unknown;
};

type UserProfilesQuery = {
  select: (columns: string) => {
    eq: (column: string, value: string) => {
      maybeSingle: () => Promise<{
        data: { role: string; active: boolean } | null;
      }>;
    };
  };
};

export async function getCurrentUserAccess(supabase: PermissionSupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      role: "viewer" as UserRole,
      canWrite: false,
      canDelete: false,
    };
  }

  if (isMasterUser(user.email)) {
    return {
      user,
      role: "master" as UserRole,
      canWrite: true,
      canDelete: true,
    };
  }

  const userProfiles = supabase.from("user_profiles") as UserProfilesQuery;
  const { data: profile } = await userProfiles
    .select("role, active")
    .eq("id", user.id)
    .maybeSingle();

  const role: UserRole = profile?.role === "secretary" ? "secretary" : "viewer";
  const isActive = profile?.active ?? false;

  return {
    user,
    role: isActive ? role : ("viewer" as UserRole),
    canWrite: isActive && role === "secretary",
    canDelete: false,
  };
}

export async function canCurrentUserWrite(supabase: PermissionSupabaseClient) {
  return (await getCurrentUserAccess(supabase)).canWrite;
}

export async function canCurrentUserDelete(supabase: PermissionSupabaseClient) {
  return (await getCurrentUserAccess(supabase)).canDelete;
}
