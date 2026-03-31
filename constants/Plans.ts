export type PlanKey = "free" | "creator" | "pro";
export type BillingCycle = "monthly" | "yearly";

export interface Plan {
  key: PlanKey;
  id: string;
  name: string;
  monthlyPrice: number;
  description: string;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    key: "free",
    id: "free",
    name: "Free Plan",
    monthlyPrice: 0,
    description: "Get started with no commitment.",
    features: [
      "Up to 150 characters per voiceover",
      "300 characters total per month",
      "Access to voice models until your monthly limit is reached",
      "Usage reminders when you're approaching your limit",
    ],
  },
  {
    key: "creator",
    id: "creator",
    name: "Creator Plan",
    monthlyPrice: 10,
    description: "Great for regular content creators.",
    features: [
      "Up to 1,500 characters per voiceover",
      "174,000 characters total per month",
      "Access to all voice models until your monthly limit is reached",
      "Auto-optimise audio length for Instagram, TikTok, and YouTube",
    ],
  },
  {
    key: "pro",
    id: "pro",
    name: "Pro Plan",
    monthlyPrice: 17,
    description: "Professional tools for high-quality audio.",
    features: [
      "Up to 5,000 characters per voiceover",
      "Unlimited voiceovers with no monthly cap",
      "Advanced editing with custom tone and emotion controls",
      "Multi-format export: MP3, WAV, and direct export to Canva, CapCut, and more",
    ],
  },
];

/**
 * Returns the charged amount for a given plan and billing cycle.
 * Yearly = 10 months (2 months free).
 */
export function getPlanPrice(monthlyPrice: number, cycle: BillingCycle): number {
  if (cycle === "yearly") return monthlyPrice * 10;
  return monthlyPrice;
}

/**
 * Returns a human-readable price string, e.g. "$10" or "$100".
 */
export function formatPlanPrice(monthlyPrice: number, cycle: BillingCycle): string {
  if (monthlyPrice === 0) return "$0";
  return `$${getPlanPrice(monthlyPrice, cycle)}`;
}

/**
 * Returns the billing period label: "mo" or "yr".
 */
export function getPeriodLabel(cycle: BillingCycle): string {
  return cycle === "monthly" ? "mo" : "yr";
}

/**
 * Returns the alternative billing text shown below the price.
 * Free plan: "Always free" (monthly) or "$0 / yr" (yearly).
 * Paid plans: shows the other cycle's price and savings.
 */
export function getAlternativeText(plan: Plan, cycle: BillingCycle): string {
  if (plan.monthlyPrice === 0) {
    return cycle === "yearly" ? "$0 / yr" : "Always free";
  }
  const yearlyPrice = getPlanPrice(plan.monthlyPrice, "yearly");
  const saving = plan.monthlyPrice * 2;
  if (cycle === "monthly") {
    return `or $${yearlyPrice}/yr — save $${saving}`;
  }
  return `or $${plan.monthlyPrice}/mo`;
}
