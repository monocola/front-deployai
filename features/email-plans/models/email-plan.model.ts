export interface EmailPlan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  priceCentsMonthly: number;
  currency: string;
  customPricing: boolean;
  emailsPerMonth: number | null;
  overageCentsPer1000: number | null;
  aliases: number;
  /** Null / missing = unlimited mailboxes. */
  mailboxes: number | null;
  defquotaMb: number;
  maxquotaMb: number;
  quotaMb: number;
  rlFrame: string;
  rlValue: number;
  supportLevel: string;
  automationRuns: number | null;
  featureSendingReceiving: boolean;
  enabled: boolean;
  recommended: boolean;
  displayOrder: number;
}

export interface CreateEmailPlanPayload {
  code: string;
  name: string;
  description?: string | null;
  priceCentsMonthly: number;
  currency: string;
  customPricing: boolean;
  emailsPerMonth?: number | null;
  overageCentsPer1000?: number | null;
  aliases: number;
  /** Null / missing = unlimited mailboxes. */
  mailboxes: number | null;
  defquotaMb: number;
  maxquotaMb: number;
  quotaMb: number;
  rlFrame: string;
  rlValue: number;
  supportLevel: string;
  automationRuns?: number | null;
  featureSendingReceiving: boolean;
  enabled: boolean;
  recommended: boolean;
  displayOrder: number;
}

export type UpdateEmailPlanPayload = Partial<CreateEmailPlanPayload>;

export function mapEmailPlan(raw: EmailPlan): EmailPlan {
  return {
    ...raw,
    description: raw.description ?? null,
    currency: raw.currency || "USD",
    emailsPerMonth: raw.emailsPerMonth ?? null,
    overageCentsPer1000: raw.overageCentsPer1000 ?? null,
    mailboxes: raw.mailboxes ?? null,
    automationRuns: raw.automationRuns ?? null,
    rlFrame: raw.rlFrame || "h",
    supportLevel: raw.supportLevel || "ticket",
  };
}

export function formatEmailPlanPrice(
  cents: number,
  currency = "USD",
  customPricing = false
): string {
  if (customPricing) return "Custom";
  if (cents <= 0) return `$0 ${currency}`;
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)} ${currency}`;
}
