"use client";

import { useTranslation } from "react-i18next";
import { REGISTER_BENEFITS } from "../register.constants";

export function RegisterBenefits() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 mb-16 text-center">
      {REGISTER_BENEFITS.map((benefit) => {
        const Icon = benefit.icon;
        return (
          <div
            key={benefit.id}
            className="flex flex-col items-center max-w-[200px]"
          >
            <Icon
              className={`w-10 h-10 mb-3 ${benefit.iconClassName}`}
              strokeWidth={1.5}
            />
            <h4 className="font-bold text-gray-900 mb-1">
              {t(benefit.titleKey)}
            </h4>
            <p className="text-xs text-gray-500">{t(benefit.descriptionKey)}</p>
          </div>
        );
      })}
    </div>
  );
}
