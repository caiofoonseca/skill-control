export const PAYMENT_METHOD_OPTIONS = [
  "PIX",
  "Cartão de crédito",
  "Cartão de débito",
  "Dinheiro",
] as const;

export const CREDIT_CARD_METHOD = "Cartão de crédito";

export const PAYMENT_TYPE_OPTIONS = [
  { value: "enrollment", label: "Matrícula" },
  { value: "enrollment_first_installment", label: "Matrícula + 1ª Parcela" },
  { value: "installments", label: "Parcelas" },
  { value: "full_course", label: "Curso à vista" },
  { value: "course_material", label: "Material Didático" },
  { value: "down_payment", label: "Entrada" },
] as const;

export type PaymentType = (typeof PAYMENT_TYPE_OPTIONS)[number]["value"];

export function getPaymentTypeLabel(paymentType: string) {
  const option = PAYMENT_TYPE_OPTIONS.find((item) => item.value === paymentType);

  if (option) {
    return option.label;
  }

  switch (paymentType) {
    case "enrollment_fee":
      return "Matrícula";
    case "re_enrollment_fee":
      return "Matrícula";
    case "monthly_payment":
      return "Parcelas";
    default:
      return "Pagamento";
  }
}

export function getDefaultPaymentTitle(paymentType: string) {
  return getPaymentTypeLabel(paymentType);
}

export function canBeInstallmentPayment(paymentType: string) {
  return paymentType === "installments" || paymentType === "monthly_payment";
}

export function isCreditCardMethod(value: string | null | undefined) {
  return value === CREDIT_CARD_METHOD;
}
