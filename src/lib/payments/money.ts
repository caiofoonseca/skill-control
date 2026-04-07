export function parseMoneyInput(value: string | null | undefined) {
  const normalized = String(value ?? "").trim();

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
