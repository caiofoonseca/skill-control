export const TAB_SESSION_KEY = "skill-control-tab-session";

// Marca colocada na URL de links que abrem uma aba nova a partir de uma aba
// já autenticada (ex.: "Emitir contrato"). A aba nova lê essa marca e se
// autoriza sozinha, sem depender do navegador copiar o sessionStorage.
export const TAB_SESSION_QUERY_PARAM = "_session";
export const TAB_SESSION_QUERY_VALUE = "continue";

export function markTabSessionActive() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(TAB_SESSION_KEY, "active");
}

export function isTabSessionActive() {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(TAB_SESSION_KEY) === "active";
}

export function clearTabSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(TAB_SESSION_KEY);
}

export function withTabSessionContinue(href: string) {
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}${TAB_SESSION_QUERY_PARAM}=${TAB_SESSION_QUERY_VALUE}`;
}
