"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { authService, RegisterDto } from "../services/auth.service";
import { useRouter } from "next/navigation";
import { Loader2, Check, Clock, BarChart2, Smartphone } from "lucide-react";
import Image from "next/image";

// Constantes
const PLANS = [
  {
    id: "BASIC",
    name: "Básico",
    price: "99,90",
    features: ["Controle de Horas", "Gestão de Colaboradores", "Acesso Web e Mobile", "Suporte por Email"],
    highlight: false,
  },
  {
    id: "PREMIUM",
    name: "Premium",
    price: "129,90",
    features: ["14 Dias Grátis", "Controle de Horas", "Emissão de Relatórios Completos", "Até 30 Obras Paralelas", "Até 30 Usuários Ativos"],
    highlight: true,
    highlightBadge: "Melhor Custo-\nBenefício"
  },
  {
    id: "FULL",
    name: "Full",
    price: "159,90",
    features: ["Tudo Ilimitado", "Relatórios Gerenciais Avançados", "Integração com ERP", "Gerente de Conta Dedicado", "Suporte 24/7"],
    highlight: false,
  }
];

// Zod schemas para PF e PJ
const baseSchema = {
  email: z.string().email("Endereço de e-mail inválido.").min(1, "E-mail é obrigatório."),
  challenge: z.string().optional(),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
};

const pfSchema = z.object({
  type: z.literal("PF"),
  document: z.string()
    .min(14, "CPF inválido. Use o formato xxx.xxx.xxx-xx")
    .max(14, "CPF inválido. Use o formato xxx.xxx.xxx-xx"),
  name: z.string().min(3, "Nome completo é obrigatório"),
  ...baseSchema,
});

const pjSchema = z.object({
  type: z.literal("PJ"),
  document: z.string()
    .min(18, "CNPJ inválido. Use o formato xx.xxx.xxx/xxxx-xx")
    .max(18, "CNPJ inválido. Use o formato xx.xxx.xxx/xxxx-xx"),
  name: z.string().min(3, "Razão Social é obrigatória"),
  ...baseSchema,
});

type RegistrationFormValues = z.infer<typeof pfSchema> | z.infer<typeof pjSchema>;

// Formatação simples de CPF/CNPJ
const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const formatCNPJ = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export default function RegisterPage() {
  const router = useRouter();
  
  const [selectedPlan, setSelectedPlan] = useState<string>("PREMIUM");
  const [accountType, setAccountType] = useState<"PF" | "PJ">("PF");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Hook form configuration
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
    reset
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(accountType === "PF" ? pfSchema : pjSchema),
    mode: "onChange",
    defaultValues: {
      type: "PF",
    }
  });

  const documentValue = watch("document");

  // Handle document formatting dynamically
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = accountType === "PF" ? formatCPF(rawValue) : formatCNPJ(rawValue);
    setValue("document", formatted, { shouldValidate: true });
  };

  // Alterar entre CPF e CNPJ
  const switchAccountType = (type: "PF" | "PJ") => {
    setAccountType(type);
    reset({
      type,
      document: "",
      name: "",
      email: "",
      challenge: "",
      password: ""
    });
    setErrorMsg("");
  };

  const onSubmit = async (data: RegistrationFormValues) => {
    setErrorMsg("");
    setIsLoading(true);

    try {
      const payload: RegisterDto = {
        ...data,
        planId: selectedPlan as 'BASIC' | 'PREMIUM' | 'FULL',
        challenge: data.challenge || ""
      };

      const response = await authService.register(payload);
      
      // Armazenaria o JWT na sessão
      console.log("Token gerado no cadastro:", response.accessToken);
      
      // Vai direto para o dashboard
      router.push("/dashboard");

    } catch (err: any) {
      setErrorMsg(err.message || "Ocorreu um erro ao criar a conta.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6f9] pb-20 font-sans">
      {/* Header falso para logo */}
      <header className="flex justify-center py-6">
        <div className="flex items-center space-x-2">
            {/* Como não temos imagem real do logo, usamos texto com Icon */}
             <div className="w-8 h-8 bg-[#002f5c] rounded flex items-center justify-center text-white font-bold">
               C
             </div>
             <span className="text-[#002f5c] font-bold text-xl tracking-wide">Cronogestor</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        
        {/* Banner */}
        <div className="bg-[#2c9644] text-white text-center py-3 px-4 rounded-xl shadow-md font-bold mb-8 flex justify-center items-center gap-2">
          <span>🎉 OFERTA ESPECIAL: Plano Premium Grátis por 14 dias. Comece agora!</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#002f5c] text-center mb-12">
          Escolha o plano ideal para sua obra
        </h1>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <div 
              key={plan.id}
              className={`relative bg-white rounded-xl transition-all duration-300 ${
                plan.highlight 
                  ? "border-2 border-[#002f5c] shadow-2xl scale-105 z-10" 
                  : "border border-transparent shadow-lg hover:shadow-xl mt-4 md:mt-2 mb-4 md:mb-2"
              } p-8 flex flex-col`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#002f5c] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md text-center whitespace-pre-line leading-tight">
                  {plan.highlightBadge}
                </div>
              )}

              <h3 className="text-[#002f5c] text-2xl font-bold text-center mt-2">{plan.name}</h3>
              <div className="text-center mt-4 mb-6">
                <span className="text-3xl font-extrabold text-gray-900">R$ {plan.price}</span>
                <span className="text-sm text-gray-500 font-medium">/mês</span>
              </div>

              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="h-5 w-5 text-[#002f5c] mr-2 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => setSelectedPlan(plan.id)}
                className={`w-full py-3 rounded-lg font-bold transition-colors ${
                  selectedPlan === plan.id
                    ? plan.highlight 
                        ? "bg-[#002f5c] text-white" 
                        : "bg-[#002f5c] text-white border-2 border-[#002f5c]"
                    : plan.highlight 
                        ? "bg-[#002f5c] text-white hover:bg-[#001f3f]"
                        : "bg-transparent text-[#002f5c] border-2 border-[#002f5c] hover:bg-gray-50"
                }`}
              >
                 {selectedPlan === plan.id ? "Selecionado" : `Selecionar${plan.highlight ? ' Premium' : ''}`}
              </button>
            </div>
          ))}
        </div>

        {/* Benefits Icons Row */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 mb-16 text-center">
            <div className="flex flex-col items-center max-w-[200px]">
                <Clock className="w-10 h-10 text-gray-700 mb-3" strokeWidth={1.5} />
                <h4 className="font-bold text-gray-900 mb-1">Otimize o Tempo</h4>
                <p className="text-xs text-gray-500">Reduza horas gastas com planilhas manuais.</p>
            </div>
            <div className="flex flex-col items-center max-w-[200px]">
                <BarChart2 className="w-10 h-10 text-[#002f5c] mb-3" strokeWidth={1.5} />
                <h4 className="font-bold text-gray-900 mb-1">Relatórios Precisos</h4>
                <p className="text-xs text-gray-500">Dados reais para tomada de decisão.</p>
            </div>
            <div className="flex flex-col items-center max-w-[200px]">
                <Smartphone className="w-10 h-10 text-gray-700 mb-3" strokeWidth={1.5} />
                <h4 className="font-bold text-gray-900 mb-1">Acesso Total</h4>
                <p className="text-xs text-gray-500">Controle sua obra de onde estiver.</p>
            </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl mx-auto p-6 md:p-10 border border-t-4 border-t-[#002f5c]">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-[#002f5c] mb-2">Vamos começar?</h2>
            <p className="text-gray-500 text-sm">
              Preencha os dados abaixo para criar sua conta no Cronogestor.
            </p>
          </div>

          {/* Toggle Type */}
          <div className="flex bg-gray-100 p-1 rounded-lg mb-8 mx-auto max-w-sm">
            <button
              type="button"
              className={`flex-1 py-3 text-sm font-semibold rounded-md transition-all ${
                accountType === "PF" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => switchAccountType("PF")}
            >
              Pessoa Física (CPF)
            </button>
            <button
              type="button"
              className={`flex-1 py-3 text-sm font-semibold rounded-md transition-all ${
                accountType === "PJ" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => switchAccountType("PJ")}
            >
              Empresa (CNPJ)
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Tipo Oculto para o RHF */}
            <input type="hidden" {...register("type")} value={accountType} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Document Field */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {accountType === "PF" ? "CPF" : "CNPJ"}
                </label>
                <input
                  type="text"
                  placeholder={accountType === "PF" ? "000.000.000-00" : "00.000.000/0000-00"}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#002f5c] focus:border-[#002f5c] outline-none transition-all ${
                    errors.document ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  value={documentValue || ""}
                  onChange={handleDocumentChange}
                  onBlur={() => register("document").onBlur({ target: { name: 'document' }})}
                  name="document"
                />
                {errors.document && <p className="text-red-500 text-xs mt-1 font-medium">{errors.document.message as string}</p>}
              </div>

              {/* Name Field */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {accountType === "PF" ? "Nome Completo" : "Nome da Empresa (Razão Social)"}
                </label>
                <input
                  type="text"
                  placeholder={accountType === "PF" ? "Seu nome" : "Razão Social"}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#002f5c] focus:border-[#002f5c] outline-none transition-all ${
                    errors.name ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  {...register("name")}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name.message as string}</p>}
              </div>

              {/* Email Field */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail Profissional</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#002f5c] focus:border-[#002f5c] outline-none transition-all ${
                    errors.email ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  {...register("email")}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message as string}</p>}
              </div>

              {/* Challenge Field */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Qual desafio você precisa resolver na sua empresa?</label>
                <textarea
                  placeholder="Ex: Preciso controlar melhor as horas extras dos funcionários nas obras..."
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#002f5c] focus:border-[#002f5c] outline-none transition-all resize-y ${
                    errors.challenge ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  {...register("challenge")}
                />
              </div>

              {/* Password Field */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Senha de Acesso</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#002f5c] focus:border-[#002f5c] outline-none transition-all ${
                    errors.password ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  {...register("password")}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message as string}</p>}
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-200">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !isValid}
              className="mt-6 w-full relative flex justify-center items-center py-4 px-4 border border-transparent rounded-lg text-lg font-bold text-white bg-[#002f5c] hover:bg-[#001f3f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#002f5c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-6 w-6" />
              ) : (
                "Criar Conta Grátis"
              )}
            </button>
            <p className="text-center text-xs text-gray-500 mx-auto mt-4">
              Ao criar conta, você aceita nossos <a href="#" className="underline">Termos de Uso</a>.
            </p>
          </form>
        </div>

      </main>
    </div>
  );
}
