import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnv, getSupabaseServiceRoleKey } from "@/lib/env";

export function createSupabaseAdminClient() {
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!serviceRoleKey) {
    return null;
  }

  const { url } = getSupabaseEnv();
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
