export function parseMoneyInput(value: string | null | undefined) {
  const normalized = String(value ?? "")
    .trim()
    .replace(/[^\d,.-]/g, "");

  if (!normalized) {
    return null;
  }

  const hasComma = normalized.includes(",");
  const hasDot = normalized.includes(".");

  let parsed: number;

  if (hasComma && hasDot) {
    parsed = Number(normalized.replace(/\./g, "").replace(",", "."));
  } else if (hasComma) {
    parsed = Number(normalized.replace(",", "."));
  } else {
    parsed = Number(normalized);
  }

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

export function normalizeMoney(value: string | null | undefined) {
  const parsed = parseMoneyInput(value);

  if (parsed === null) {
    return null;
  }

  return parsed.toFixed(2);
}

export function formatMoneyInput(value: string | number) {
  const parsed = typeof value === "number" ? value : parseMoneyInput(value);

  if (parsed === null) {
    return "";
  }

  return parsed.toFixed(2).replace(".", ",");
}

export function formatCurrencyInput(value: string | null | undefined) {
  const digits = String(value ?? "").replace(/\D/g, "");
  const cents = Number(digits || "0");

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function formatCurrencyFromNumber(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
