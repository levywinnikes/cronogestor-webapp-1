"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { RegisterBenefits } from "@/features/auth/register/components/RegisterBenefits";
import { RegisterFormCard } from "@/features/auth/register/components/RegisterFormCard";
import { RegisterHero } from "@/features/auth/register/components/RegisterHero";
import { RegisterPlansGrid } from "@/features/auth/register/components/RegisterPlansGrid";
import { useRegisterForm } from "@/features/auth/register/useRegisterForm";
import { PublicHeader } from "@/components/PublicHeader";

export default function RegisterScreen() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const {
    form,
    selectedPlan,
    accountType,
    isLoading,
    documentValue,
    setSelectedPlan,
    switchAccountType,
    handleDocumentChange,
    onSubmit,
  } = useRegisterForm();

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[var(--color-surface)] pb-20 font-sans">
        <PublicHeader />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin h-10 w-10 text-[#002f5c]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] pb-20 font-sans">
      <PublicHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <RegisterHero />
        <RegisterPlansGrid
          selectedPlan={selectedPlan}
          onSelectPlan={setSelectedPlan}
        />
        <RegisterBenefits />
        <RegisterFormCard
          form={form}
          accountType={accountType}
          documentValue={documentValue || ""}
          isLoading={isLoading}
          onSwitchAccountType={switchAccountType}
          onDocumentChange={handleDocumentChange}
          onSubmit={onSubmit}
        />
      </main>
    </div>
  );
}
