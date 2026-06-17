"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { authService, RegisterDto } from "@/app/services/auth.service";
import { formatDocument } from "./register.formatters";
import { getRegisterSchema, RegistrationFormValues } from "./register.schemas";
import { AccountType, PlanId } from "./register.types";
import { useAppToast } from "@/lib/use-app-toast";

export function useRegisterForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const appToast = useAppToast();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("PREMIUM");
  const [accountType, setAccountType] = useState<AccountType>("PF");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(getRegisterSchema(accountType)),
    mode: "onChange",
    defaultValues: {
      type: "PF",
    },
  });

  const documentValue = form.watch("document");

  const handleDocumentChange = (rawValue: string) => {
    const formatted = formatDocument(rawValue, accountType);
    form.setValue("document", formatted, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const switchAccountType = (type: AccountType) => {
    setAccountType(type);
    form.reset({
      type,
      document: "",
      name: "",
      email: "",
      challenge: "",
      password: "",
    });
  };

  const onSubmit = async (data: RegistrationFormValues) => {
    setIsLoading(true);

    try {
      const payload: RegisterDto = {
        ...data,
        planId: selectedPlan,
        challenge: data.challenge || "",
      };

      await authService.register(payload);
      appToast.success(t("register.messages.success"));
      router.push("/projetos");
    } catch (error: unknown) {
      appToast.fromUnknownError(error, "register.errors.generic");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    selectedPlan,
    accountType,
    isLoading,
    documentValue,
    setSelectedPlan,
    switchAccountType,
    handleDocumentChange,
    onSubmit,
  };
}
