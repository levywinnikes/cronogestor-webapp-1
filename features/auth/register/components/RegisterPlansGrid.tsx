"use client";

import { Check } from "lucide-react";
import { REGISTER_PLANS } from "../register.constants";
import { PlanId } from "../register.types";
import { AppButton } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

type RegisterPlansGridProps = {
  selectedPlan: PlanId;
  onSelectPlan: (planId: PlanId) => void;
};

export function RegisterPlansGrid({
  selectedPlan,
  onSelectPlan,
}: RegisterPlansGridProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
      {REGISTER_PLANS.map((plan) => (
        <div
          key={plan.id}
          className={`relative bg-white rounded-xl transition-all duration-300 ${
            plan.highlight
              ? "border-2 border-[var(--color-primary)] shadow-2xl scale-105 z-10"
              : "border border-transparent shadow-lg hover:shadow-xl mt-4 md:mt-2 mb-4 md:mb-2"
          } p-8 flex flex-col`}
        >
          {plan.highlight ? (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md text-center whitespace-pre-line leading-tight">
              {plan.highlightBadgeKey ? t(plan.highlightBadgeKey) : ""}
            </div>
          ) : null}

          <h3 className="text-[var(--color-primary)] text-2xl font-bold text-center mt-2">
            {t(plan.nameKey)}
          </h3>
          <div className="text-center mt-4 mb-6">
            <span className="text-3xl font-extrabold text-gray-900">
              {t("register.plans.currencySymbol")} {plan.price}
            </span>
            <span className="text-sm text-gray-500 font-medium">{t("register.plans.perMonth")}</span>
          </div>

          <ul className="flex-1 space-y-4 mb-8">
            {plan.featuresKeys.map((featureKey) => (
              <li key={`${plan.id}-${featureKey}`} className="flex items-start">
                <Check className="h-5 w-5 text-[var(--color-primary)] mr-2 flex-shrink-0" />
                <span className="text-gray-600 text-sm">{t(featureKey)}</span>
              </li>
            ))}
          </ul>

          <AppButton
            type="button"
            onClick={() => onSelectPlan(plan.id)}
            fullWidth
            variant={
              selectedPlan === plan.id || plan.highlight ? "primary" : "outline"
            }
            className={
              selectedPlan === plan.id
                ? "border-2 border-[var(--color-primary)]"
                : ""
            }
          >
            {selectedPlan === plan.id
              ? t("register.plans.actions.selected")
              : plan.highlight
                ? t("register.plans.actions.selectPremium")
                : t("register.plans.actions.select")}
          </AppButton>
        </div>
      ))}
    </div>
  );
}
