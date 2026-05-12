"use client";

import { RegisterBenefits } from "@/features/auth/register/components/RegisterBenefits";
import { RegisterFormCard } from "@/features/auth/register/components/RegisterFormCard";
import { RegisterHero } from "@/features/auth/register/components/RegisterHero";
import { RegisterPlansGrid } from "@/features/auth/register/components/RegisterPlansGrid";
import { useRegisterForm } from "@/features/auth/register/useRegisterForm";
import { PublicHeader } from "@/components/PublicHeader";

export default function RegisterScreen() {
  const {
    form,
    selectedPlan,
    accountType,
    errorMsg,
    isLoading,
    documentValue,
    setSelectedPlan,
    switchAccountType,
    handleDocumentChange,
    onSubmit,
  } = useRegisterForm();

  return (
    <div className="min-h-screen bg-[var(--color-surface)] pb-20 font-sans">
      <PublicHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <RegisterHero />
        <RegisterPlansGrid selectedPlan={selectedPlan} onSelectPlan={setSelectedPlan} />
        <RegisterBenefits />
        <RegisterFormCard
          form={form}
          accountType={accountType}
          documentValue={documentValue || ""}
          errorMsg={errorMsg}
          isLoading={isLoading}
          onSwitchAccountType={switchAccountType}
          onDocumentChange={handleDocumentChange}
          onSubmit={onSubmit}
        />
      </main>
    </div>
  );
}
