const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

function getEnvVar(name: keyof typeof requiredEnvVars) {
  const value = requiredEnvVars[name];

  if (!value) {
    throw new Error(
      `Variavel de ambiente ausente: ${name}. Preencha o arquivo .env.local.`,
    );
  }

  return value;
}

export function getSupabaseEnv() {
  return {
    url: getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}

export function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;
}
