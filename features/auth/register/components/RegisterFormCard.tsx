"use client";

import { Input, Textarea } from "@/components/ui/field-primitives";
import { AppButton } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { SubmitHandler, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { AccountType } from "../register.types";
import { RegistrationFormValues } from "../register.schemas";

type RegisterFormCardProps = {
  form: UseFormReturn<RegistrationFormValues>;
  accountType: AccountType;
  documentValue: string;
  errorMsg: string;
  isLoading: boolean;
  onSwitchAccountType: (accountType: AccountType) => void;
  onDocumentChange: (rawValue: string) => void;
  onSubmit: SubmitHandler<RegistrationFormValues>;
};

export function RegisterFormCard({
  form,
  accountType,
  documentValue,
  errorMsg,
  isLoading,
  onSwitchAccountType,
  onDocumentChange,
  onSubmit,
}: RegisterFormCardProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isValid },
  } = form;

  return (
    <div className="bg-white rounded-2xl shadow-xl max-w-2xl mx-auto p-6 md:p-10 border border-t-4 border-t-[var(--color-primary)]">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-[var(--color-primary)] mb-2">
          {t("register.form.title")}
        </h2>
        <p className="text-gray-500 text-sm">
          {t("register.form.description")}
        </p>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-lg mb-8 mx-auto max-w-sm">
        <button
          type="button"
          className={`flex-1 py-3 text-sm font-semibold rounded-md transition-all ${
            accountType === "PF"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => onSwitchAccountType("PF")}
        >
          {t("register.form.personPf")}
        </button>
        <button
          type="button"
          className={`flex-1 py-3 text-sm font-semibold rounded-md transition-all ${
            accountType === "PJ"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => onSwitchAccountType("PJ")}
        >
          {t("register.form.personPj")}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input type="hidden" {...register("type")} value={accountType} />
        <Input
          type="hidden"
          {...register("document")}
          value={documentValue || ""}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {accountType === "PF"
                ? t("register.form.documentCpf")
                : t("register.form.documentCnpj")}
            </label>
            <Input
              type="text"
              placeholder={
                accountType === "PF" ? "000.000.000-00" : "00.000.000/0000-00"
              }
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all ${
                errors.document ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
              value={documentValue || ""}
              onChange={(event) => onDocumentChange(event.target.value)}
              onBlur={() => {
                void trigger("document");
              }}
            />
            {errors.document ? (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.document.message as string}
              </p>
            ) : null}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {accountType === "PF"
                ? t("register.form.namePf")
                : t("register.form.namePj")}
            </label>
            <Input
              type="text"
              placeholder={
                accountType === "PF"
                  ? t("register.form.placeholders.namePf")
                  : t("register.form.placeholders.namePj")
              }
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all ${
                errors.name ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
              {...register("name")}
            />
            {errors.name ? (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.name.message as string}
              </p>
            ) : null}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t("register.form.email")}
            </label>
            <Input
              type="email"
              placeholder={t("register.form.placeholders.email")}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all ${
                errors.email ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.email.message as string}
              </p>
            ) : null}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t("register.form.challenge")}
            </label>
            <Textarea
              placeholder={t("register.form.placeholders.challenge")}
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all resize-y ${
                errors.challenge
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              }`}
              {...register("challenge")}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t("register.form.password")}
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all ${
                errors.password ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.password.message as string}
              </p>
            ) : null}
          </div>
        </div>

        {errorMsg ? (
          <div className="p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-200">
            {errorMsg}
          </div>
        ) : null}

        <AppButton
          type="submit"
          disabled={isLoading || !isValid}
          fullWidth
          size="lg"
          className="mt-6"
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-6 w-6" />
          ) : (
            t("register.form.submit")
          )}
        </AppButton>
        <p className="text-center text-xs text-gray-500 mx-auto mt-4">
          {t("register.form.terms")}
        </p>
      </form>
    </div>
  );
}
