export const PAYMENT_METHOD_OPTIONS = [
  "PIX",
  "Cartão de crédito",
  "Cartão de débito",
  "Dinheiro",
] as const;

export const CREDIT_CARD_METHOD = "Cartão de crédito";

export function isCreditCardMethod(value: string | null | undefined) {
  return value === CREDIT_CARD_METHOD;
}
