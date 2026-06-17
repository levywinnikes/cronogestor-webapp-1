"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { authService } from "@/app/services/auth.service";
import { useRouter } from "next/navigation";
import { Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { TextField } from "@/components/ui/form-field";
import { PageShell } from "@/components/ui/page-shell";
import { PublicHeader } from "@/components/PublicHeader";
import { useAppToast } from "@/lib/use-app-toast";

export function LoginPageView() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loginSchema = z.object({
    email: z
      .string()
      .email(t("login.errors.invalidEmail"))
      .min(1, t("login.errors.emailRequired")),
    password: z.string().min(6, t("login.errors.passwordMinLength")),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;

  const router = useRouter();
  const appToast = useAppToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    try {
      const response = await authService.login(data);

      if (response.user.planType === "FREE") {
        setShowAdModal(true);
      } else {
        router.push("/projetos");
      }
    } catch (error: unknown) {
      appToast.fromUnknownError(error, "login.errors.invalidCredentials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseAd = () => {
    setShowAdModal(false);
    router.push("/projetos");
  };

  if (!mounted) {
    return (
      <PageShell className="relative min-h-screen flex flex-col items-center justify-center bg-[#466a87] font-sans">
        <PublicHeader />
        <div className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2">
          <button
            onClick={() => router.push("/")}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all shadow-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full max-w-[400px] bg-white rounded-xl shadow-2xl px-8 py-10 relative z-10 m-4 flex items-center justify-center min-h-[350px]">
          <Loader2 className="animate-spin h-8 w-8 text-[#002f5c]" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell className="relative min-h-screen flex flex-col items-center justify-center bg-[#466a87] font-sans">
      <PublicHeader />
      <div className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2">
        <button
          onClick={() => router.push("/")}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all shadow-md"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="w-full max-w-[400px] bg-white rounded-xl shadow-2xl px-8 py-10 relative z-10 m-4">
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2 text-[#002f5c]">
            <div className="w-6 h-6 bg-[#002f5c] rounded flex items-center justify-center text-white text-xs font-bold">
              C
            </div>
            <span className="font-bold text-lg tracking-wide">Cronogestor</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TextField
            id="email"
            type="email"
            label={t("login.email")}
            placeholder={t("login.placeholders.email")}
            error={errors.email?.message}
            {...register("email")}
          />

          <TextField
            id="password"
            type="password"
            label={t("login.password")}
            placeholder={t("login.placeholders.password")}
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !isValid}
              className="w-full flex justify-center items-center py-3 px-4 rounded-md text-sm font-bold text-white bg-[#002f5c] hover:bg-[#001f3f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#002f5c] transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                t("login.submit")
              )}
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between mt-5 text-xs font-semibold text-[#002f5c]">
          <Link href="#" className="hover:underline hover:text-[#001f3f]">
            {t("login.forgot")}
          </Link>
          <Link
            href="/register"
            className="hover:underline hover:text-[#001f3f]"
          >
            {t("login.signup")}
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-500">{t("login.footer")}</p>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur border border-gray-200 p-4 rounded-lg shadow-lg text-xs w-[250px] z-50">
        <h4 className="font-bold text-gray-800 border-b pb-2 mb-2">
          {t("login.testCredentials.title")}
        </h4>
        <ul className="space-y-1.5 text-gray-600">
          <li>
            <strong>{t("login.testCredentials.admin")}</strong> admin@obras.com
          </li>
          <li>
            <strong>{t("login.testCredentials.free")}</strong>{" "}
            funcionario@obras.com
          </li>
          <li>
            <strong>{t("login.testCredentials.inactive")}</strong>{" "}
            demitido@obras.com
          </li>
          <li className="pt-1.5">
            <strong>{t("login.testCredentials.password")}</strong> 123456
          </li>
        </ul>
      </div>

      {showAdModal ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-xl font-bold text-[#002f5c] mb-2">
              {t("login.premiumPromo.title")}
            </h2>
            <div className="my-6 bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
              <span className="text-gray-400 text-sm italic">
                [ Espaço Publicitário Simulado ]
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              Assine agora e remova propagandas. Aproveite 14 dias grátis.
            </p>
            <div className="space-y-3">
              <button
                className="w-full py-2.5 px-4 rounded-lg bg-[#2c9644] text-white font-bold hover:bg-[#237836] transition shadow-md"
                onClick={handleCloseAd}
              >
                Conhecer Premium
              </button>
              <button
                className="w-full py-2 px-4 rounded-lg text-gray-500 font-medium hover:bg-gray-100 transition"
                onClick={handleCloseAd}
              >
                {t("login.premiumPromo.skip")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
