import { BarChart2, Clock, Smartphone } from "lucide-react";
import { PlanOption } from "./register.types";

export const REGISTER_PLANS: PlanOption[] = [
  {
    id: "BASIC",
    nameKey: "register.plans.basic.name",
    price: "99,90",
    featuresKeys: [
      "register.plans.basic.features.timeControl",
      "register.plans.basic.features.teamManagement",
      "register.plans.basic.features.webMobile",
      "register.plans.basic.features.emailSupport",
    ],
    highlight: false,
  },
  {
    id: "PREMIUM",
    nameKey: "register.plans.premium.name",
    price: "129,90",
    featuresKeys: [
      "register.plans.premium.features.trial",
      "register.plans.premium.features.timeControl",
      "register.plans.premium.features.reports",
      "register.plans.premium.features.parallelProjects",
      "register.plans.premium.features.activeUsers",
    ],
    highlight: true,
    highlightBadgeKey: "register.plans.premium.badge",
  },
  {
    id: "FULL",
    nameKey: "register.plans.full.name",
    price: "159,90",
    featuresKeys: [
      "register.plans.full.features.unlimited",
      "register.plans.full.features.advancedReports",
      "register.plans.full.features.erpIntegration",
      "register.plans.full.features.accountManager",
      "register.plans.full.features.support247",
    ],
    highlight: false,
  },
];

export const REGISTER_BENEFITS = [
  {
    id: "time",
    icon: Clock,
    titleKey: "register.benefits.time.title",
    descriptionKey: "register.benefits.time.description",
    iconClassName: "text-gray-700",
  },
  {
    id: "reports",
    icon: BarChart2,
    titleKey: "register.benefits.reports.title",
    descriptionKey: "register.benefits.reports.description",
    iconClassName: "text-[var(--color-primary)]",
  },
  {
    id: "access",
    icon: Smartphone,
    titleKey: "register.benefits.access.title",
    descriptionKey: "register.benefits.access.description",
    iconClassName: "text-gray-700",
  },
] as const;
