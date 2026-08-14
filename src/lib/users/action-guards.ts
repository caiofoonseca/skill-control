import { redirect } from "next/navigation";

import { getCurrentUserAccess } from "@/lib/users/permissions";

export async function assertCanWrite(
  supabase: Parameters<typeof getCurrentUserAccess>[0],
  redirectHref: string,
) {
  const access = await getCurrentUserAccess(supabase);

  if (!access.user) {
    redirect("/login?error=Sessao+expirada.+Entre+novamente+e+tente+salvar+de+novo.");
  }

  if (!access.canWrite) {
    redirect(`${redirectHref}?error=Acesso+somente+para+visualizacao`);
  }
}

export async function assertCanDelete(
  supabase: Parameters<typeof getCurrentUserAccess>[0],
  redirectHref: string,
) {
  const access = await getCurrentUserAccess(supabase);

  if (!access.user) {
    redirect("/login?error=Sessao+expirada.+Entre+novamente+e+tente+salvar+de+novo.");
  }

  if (!access.canDelete) {
    redirect(`${redirectHref}?error=Seu+usuario+nao+tem+permissao+para+excluir`);
  }
}
