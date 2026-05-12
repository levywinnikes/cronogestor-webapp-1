export type AccountType = "PF" | "PJ";

export type PlanId = "BASIC" | "PREMIUM" | "FULL";

export type PlanOption = {
  id: PlanId;
  nameKey: string;
  price: string;
  featuresKeys: string[];
  highlight: boolean;
  highlightBadgeKey?: string;
};
