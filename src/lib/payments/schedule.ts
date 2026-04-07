import { formatMoneyInput, parseMoneyInput } from "@/lib/payments/money";

export function formatAmountPerInstallment(totalAmount: string, count: number) {
  const parsed = parseMoneyInput(totalAmount);

  if (!parsed || count <= 0) {
    return "";
  }

  return formatMoneyInput(parsed / count);
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function addMonthsToDate(baseDate: string, monthsToAdd: number) {
  if (!baseDate) {
    return "";
  }

  const [yearText, monthText, dayText] = baseDate.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!year || !month || !day) {
    return "";
  }

  const targetMonthIndex = month - 1 + monthsToAdd;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12;
  const lastDayOfMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const safeDay = Math.min(day, lastDayOfMonth);

  return `${targetYear}-${pad(targetMonth + 1)}-${pad(safeDay)}`;
}
