"use client";

import { Input, Select } from "@/components/ui/field-primitives";
import { TextField, SelectField } from "@/components/ui/form-field";
import {
  Plus,
  Users,
  Search,
  Save,
  Trash2,
  ChevronRight,
  User,
  Briefcase,
  Info,
  DollarSign,
  Clock,
  CreditCard,
  MapPin,
  Heart,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import {
  employeeService,
  EmployeeDto,
  EmployeeRegime,
} from "@/app/services/employee.service";
import { PageShell, PageMain } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppButton } from "@/components/ui/button";

type EmployeeRecord = {
  id: string;
  nome: string;
  sobrenome: string;
  cargo: string;
  documento: string;
  salario: number;
  regime: "dia" | "quinzena" | "mes";
  horasPorDia: number;
  encargos: number;
  beneficios: number;
  bankName: string;
  bankAgency: string;
  bankAccount: string;
  bankAccountDigit: string;
  bankSwift: string;
  bankIban: string;
  pixKey: string;
  vtEnabled: boolean;
};

const EMPTY_EMPLOYEE: EmployeeRecord = {
  id: "",
  nome: "",
  sobrenome: "",
  cargo: "",
  documento: "",
  salario: 0,
  regime: "mes",
  horasPorDia: 8,
  encargos: 0,
  beneficios: 0,
  bankName: "",
  bankAgency: "",
  bankAccount: "",
  bankAccountDigit: "",
  bankSwift: "",
  bankIban: "",
  pixKey: "",
  vtEnabled: false,
};



function fromApiRegime(regime: EmployeeRegime): "dia" | "quinzena" | "mes" {
  if (regime === "DIA") return "dia";
  if (regime === "QUINZENA") return "quinzena";
  return "mes";
}

function toApiRegime(regime: "dia" | "quinzena" | "mes"): EmployeeRegime {
  if (regime === "dia") return "DIA";
  if (regime === "quinzena") return "QUINZENA";
  return "MES";
}

function hoursToTimeStr(hours: number): string {
  if (hours <= 0) return "08:00";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function timeStrToHoursDecimal(time: string): number {
  if (!time) return 0;
  const [h, m] = time.split(":").map(Number);
  return h + (m || 0) / 60;
}

function validateCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, "");
  if (clean.length === 0) return true; // allow empty while typing or other document types
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(clean[i]) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(clean[i]) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean[10])) return false;
  return true;
}

function mapEmployee(dto: EmployeeDto): EmployeeRecord {
  return {
    id: dto.id ?? "",
    nome: dto.firstName ?? "",
    sobrenome: dto.lastName ?? "",
    cargo: dto.roleName ?? "",
    documento: dto.document ?? "",
    salario: Number(dto.salary) || 0,
    regime: fromApiRegime(dto.regime),
    horasPorDia: Number(dto.hoursPerDay) || 0,
    encargos: Number(dto.chargesPercent) || 0,
    beneficios: Number(dto.benefitsAmount) || 0,
    bankName: dto.bankName ?? "",
    bankAgency: dto.bankAgency ?? "",
    bankAccount: dto.bankAccount ?? "",
    bankAccountDigit: dto.bankAccountDigit ?? "",
    bankSwift: dto.bankSwift ?? "",
    bankIban: dto.bankIban ?? "",
    pixKey: dto.pixKey ?? "",
    vtEnabled: dto.vtEnabled ?? false,
  };
}

export default function FuncionariosPageView() {
  const { t } = useTranslation();

  const regimeOptions = [
    { value: "dia", label: t("employees.options.regime.dia") },
    { value: "quinzena", label: t("employees.options.regime.quinzena") },
    { value: "mes", label: t("employees.options.regime.mes") },
  ];

  const maritalOptions = [
    { value: "solteiro", label: t("employees.options.marital.solteiro") },
    { value: "casado", label: t("employees.options.marital.casado") },
    { value: "divorciado", label: t("employees.options.marital.divorciado") },
    { value: "viuvo", label: t("employees.options.marital.viuvo") },
  ];

  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"geral" | "registro">("geral");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<EmployeeRecord>(EMPTY_EMPLOYEE);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await employeeService.getEmployees();
        const mapped = data.map(mapEmployee);
        setEmployees(mapped);
        if (mapped.length > 0) {
          setSelectedId(mapped[0].id);
          setFormData(mapped[0]);
        } else {
          setSelectedId(null);
          setFormData(EMPTY_EMPLOYEE);
        }
      } catch (error) {
        console.error("Erro ao carregar funcionarios", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadEmployees();
  }, []);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const emp = employees.find((e) => e.id === id);
    if (emp) setFormData(emp);
  };

  const totalCusto = useMemo(() => {
    const base = Number(formData.salario) || 0;
    const encargosVal = (base * (Number(formData.encargos) || 0)) / 100;
    const beneficiosVal = Number(formData.beneficios) || 0;
    return base + encargosVal + beneficiosVal;
  }, [formData]);

  const isCpfInvalid = useMemo(() => {
    const clean = formData.documento.replace(/\D/g, "");
    // Only validate if it's 11 digits or if they are typing dots/hyphens (looks like CPF)
    if (clean.length === 11 || (formData.documento.includes(".") && clean.length > 0)) {
      return !validateCPF(formData.documento);
    }
    return false;
  }, [formData.documento]);

  const hourlyBasePreview = useMemo(() => {
    const base = Number(formData.salario) || 0;
    const regime = formData.regime;
    const monthlyHours = regime === "dia" ? (Number(formData.horasPorDia) || 8) : 220;
    const baseHourRate = monthlyHours > 0 ? (base / monthlyHours) : 0;
    const chargesMultiplier = 1 + (Number(formData.encargos) || 0) / 100;
    const normalHourCost = baseHourRate * chargesMultiplier;
    return {
      normal: normalHourCost,
      overtime50: normalHourCost * 1.5,
      overtime100: normalHourCost * 2.0,
    };
  }, [formData]);

  const filteredEmployees = employees.filter((e) =>
    `${e.nome} ${e.sobrenome}`.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleInputChange = <K extends keyof EmployeeRecord>(
    field: K,
    value: EmployeeRecord[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNew = () => {
    setSelectedId(null);
    setFormData(EMPTY_EMPLOYEE);
  };

  const handleSave = async () => {
    if (isCpfInvalid) return;
    setIsSaving(true);
    try {
      const payloadData = {
        firstName: formData.nome,
        lastName: formData.sobrenome,
        document: formData.documento,
        roleName: formData.cargo,
        salary: Number(formData.salario),
        regime: toApiRegime(formData.regime),
        hoursPerDay: Number(formData.horasPorDia),
        chargesPercent: Number(formData.encargos),
        benefitsAmount: Number(formData.beneficios),
        isActive: true,
        bankName: formData.bankName || null,
        bankAgency: formData.bankAgency || null,
        bankAccount: formData.bankAccount || null,
        bankAccountDigit: formData.bankAccountDigit || null,
        bankSwift: formData.bankSwift || null,
        bankIban: formData.bankIban || null,
        pixKey: formData.pixKey || null,
        vtEnabled: formData.vtEnabled,
      };

      if (selectedId === null) {
        const created = await employeeService.createEmployee(payloadData);
        const mapped = mapEmployee(created);
        setEmployees((prev) => [...prev, mapped]);
        setSelectedId(mapped.id);
        setFormData(mapped);
      } else {
        const updated = await employeeService.updateEmployee(selectedId, payloadData);
        const mapped = mapEmployee(updated);
        setEmployees((prev) =>
          prev.map((employee) =>
            employee.id === selectedId ? mapped : employee,
          ),
        );
        setFormData(mapped);
      }
    } catch (error) {
      console.error("Erro ao salvar funcionario", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setIsDeleting(true);
    try {
      await employeeService.deleteEmployee(selectedId);
      const newEmployees = employees.filter((e) => e.id !== selectedId);
      setEmployees(newEmployees);
      if (newEmployees.length > 0) {
        setSelectedId(newEmployees[0].id);
        setFormData(newEmployees[0]);
      } else {
        handleNew();
      }
    } catch (error) {
      console.error("Erro ao excluir funcionario", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageShell>
      <Header />

      <PageHeader
        title={t("employees.page.title")}
        icon={<Users className="h-6 w-6" />}
        actions={
          <>
            <AppButton
              variant="outline"
              icon={<Plus className="w-4 h-4 text-secondary" />}
              disabled={isSaving || isDeleting}
              onClick={handleNew}
            >
              {t("employees.buttons.new")}
            </AppButton>
            <AppButton
              variant="danger-outline"
              icon={<Trash2 className="w-4 h-4" />}
              disabled={isSaving || isDeleting || selectedId === null}
              onClick={handleDelete}
            >
              {t("employees.buttons.delete")}
            </AppButton>
            <AppButton
              variant="secondary"
              icon={<Save className="w-4 h-4" />}
              loading={isSaving}
              disabled={isDeleting || isCpfInvalid}
              onClick={handleSave}
            >
              {t("employees.buttons.save")}
            </AppButton>
          </>
        }
      />

      <PageMain className="flex gap-8">
        {/* Left: Employee List */}
        <aside className="w-full max-w-[400px] flex flex-col space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              type="text"
              placeholder={t("employees.placeholders.search")}
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Card className="overflow-hidden flex-1 flex flex-col">
            <CardHeader title={t("employees.listTitle")} />
            <div className="overflow-y-auto max-h-[calc(100vh-320px)] divide-y divide-border-light">
              {isLoading ? (
                <div className="divide-y divide-border-light">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3 w-full">
                        <Skeleton variant="circular" className="w-10 h-10 flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              {filteredEmployees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => handleSelect(emp.id)}
                  className={`w-full p-4 flex items-center justify-between text-left transition-all cursor-pointer ${
                    selectedId === emp.id
                      ? "bg-primary/5 border-l-4 border-l-primary"
                      : "hover:bg-gray-50 border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        selectedId === emp.id
                          ? "bg-primary text-white"
                          : "bg-gray-200 text-text-secondary"
                      }`}
                    >
                      {emp.nome?.[0] ?? "?"}
                      {emp.sobrenome?.[0] ?? "?"}
                    </div>
                    <div>
                      <p
                        className={`font-bold text-sm ${selectedId === emp.id ? "text-primary" : "text-text-primary"}`}
                      >
                        {emp.nome} {emp.sobrenome}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {emp.cargo}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${selectedId === emp.id ? "translate-x-1 text-primary" : "text-text-muted"}`}
                  />
                </button>
              ))}
            </div>
          </Card>
        </aside>

        {/* Right: Form */}
        <section className="flex-1 flex flex-col space-y-6">
          {/* Tabs */}
          <div className="flex space-x-1 bg-surface-elevated p-1 rounded-xl border border-border shadow-sm w-fit">
            <button
              onClick={() => setActiveTab("geral")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center cursor-pointer ${
                activeTab === "geral"
                  ? "bg-primary text-white shadow-md"
                  : "text-text-secondary hover:bg-gray-50"
              }`}
            >
              <Info className="w-4 h-4 mr-2" />
              {t("employees.tabs.general")}
            </button>
            <button
              onClick={() => setActiveTab("registro")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center cursor-pointer ${
                activeTab === "registro"
                  ? "bg-primary text-white shadow-md"
                  : "text-text-secondary hover:bg-gray-50"
              }`}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              {t("employees.tabs.admission")}
            </button>
          </div>

          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Basic Data Skeleton */}
                <Card>
                  <CardHeader
                    title={t("employees.headers.required")}
                    icon={<User className="w-5 h-5" />}
                  />
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Costs & Summary Skeleton */}
                <div className="flex flex-col space-y-6">
                  <Card>
                    <CardHeader
                      title={t("employees.headers.costs")}
                      icon={<DollarSign className="w-5 h-5 text-secondary" />}
                    />
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="gradient" className="p-8 space-y-4">
                    <Skeleton className="h-4 w-48 bg-white/20" />
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full bg-white/10" />
                      <Skeleton className="h-4 w-full bg-white/10" />
                      <Skeleton className="h-4 w-full bg-white/10" />
                      <div className="pt-4 border-t border-white/10 flex justify-between">
                        <Skeleton className="h-6 w-24 bg-white/20" />
                        <Skeleton className="h-8 w-32 bg-white/30" />
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            ) : activeTab === "geral" ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Basic Data */}
                <Card>
                  <CardHeader
                    title={t("employees.headers.required")}
                    icon={<User className="w-5 h-5" />}
                  />
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <TextField
                        label={t("employees.fields.firstName")}
                        required
                        value={formData.nome || ""}
                        onChange={(e) =>
                          handleInputChange("nome", e.target.value)
                        }
                      />
                      <TextField
                        label={t("employees.fields.lastName")}
                        required
                        value={formData.sobrenome || ""}
                        onChange={(e) =>
                          handleInputChange("sobrenome", e.target.value)
                        }
                      />
                      <TextField
                        label={t("employees.fields.document")}
                        required
                        wrapperClassName="col-span-2"
                        value={formData.documento || ""}
                        onChange={(e) =>
                          handleInputChange("documento", e.target.value)
                        }
                        error={isCpfInvalid ? t("employees.errors.cpfInvalid") : undefined}
                        placeholder={t("employees.placeholders.document")}
                      />
                      <TextField
                        label={t("employees.fields.role")}
                        value={formData.cargo || ""}
                        onChange={(e) =>
                          handleInputChange("cargo", e.target.value)
                        }
                      />
                      <TextField
                        label={t("employees.fields.salary")}
                        required
                        type="number"
                        value={formData.salario ?? 0}
                        onChange={(e) =>
                          handleInputChange(
                            "salario",
                            Number(e.target.value),
                          )
                        }
                      />
                      <SelectField
                        label={t("employees.fields.regime")}
                        required
                        value={formData.regime || "mes"}
                        onChange={(e) =>
                          handleInputChange(
                            "regime",
                            e.target.value as
                              | "dia"
                              | "quinzena"
                              | "mes",
                          )
                        }
                        options={regimeOptions}
                      />
                      <TextField
                        label={t("employees.fields.hoursPerDay")}
                        required
                        type="time"
                        value={hoursToTimeStr(formData.horasPorDia)}
                        onChange={(e) =>
                          handleInputChange(
                            "horasPorDia",
                            timeStrToHoursDecimal(e.target.value),
                          )
                        }
                        icon={<Clock className="w-4 h-4" />}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Costs & Summary */}
                <div className="flex flex-col space-y-6">
                  <Card>
                    <CardHeader
                      title={t("employees.headers.costs")}
                      icon={<DollarSign className="w-5 h-5 text-secondary" />}
                    />
                    <CardContent className="space-y-4">
                      <TextField
                        label={t("employees.fields.charges")}
                        type="number"
                        value={formData.encargos ?? 0}
                        onChange={(e) =>
                          handleInputChange(
                            "encargos",
                            Number(e.target.value),
                          )
                        }
                        placeholder={t("employees.placeholders.charges")}
                      />
                      <TextField
                        label={t("employees.fields.benefits")}
                        type="number"
                        value={formData.beneficios ?? 0}
                        onChange={(e) =>
                          handleInputChange(
                            "beneficios",
                            Number(e.target.value),
                          )
                        }
                        placeholder={t("employees.placeholders.benefits")}
                      />
                    </CardContent>
                  </Card>

                  {/* Summary Card */}
                  <Card variant="gradient" className="p-8">
                    <h4 className="text-sm font-bold uppercase tracking-widest opacity-70 mb-4">
                      {t("employees.headers.summary")}
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="opacity-80">{t("employees.labels.salary")}:</span>
                        <span className="font-medium">
                          R${" "}
                          {Number(formData.salario).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="opacity-80">
                          {t("employees.labels.charges")} ({formData.encargos}%):
                        </span>
                        <span className="font-medium text-blue-200">
                          + R${" "}
                          {(
                            (formData.salario * formData.encargos) /
                            100
                          ).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="opacity-80">{t("employees.labels.benefits")}:</span>
                        <span className="font-medium text-blue-200">
                          + R${" "}
                          {Number(formData.beneficios).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="pt-4 mt-4 border-t border-white/10 flex justify-between items-end">
                        <span className="text-lg font-bold">{t("employees.labels.totalCost")}:</span>
                        <span className="text-3xl font-black text-[#4ade80]">
                          R${" "}
                          {totalCusto.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="pt-4 mt-4 border-t border-white/10 space-y-2 text-xs">
                        <span className="font-bold opacity-75">{t("employees.labels.hourlyPreview")}:</span>
                        <div className="flex justify-between">
                          <span className="opacity-80">{t("employees.labels.normalHour")}:</span>
                          <span className="font-semibold text-blue-200">
                            {hourlyBasePreview.normal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}/h
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-80">{t("employees.labels.extra50")}:</span>
                          <span className="font-semibold text-blue-200">
                            {hourlyBasePreview.overtime50.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}/h
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-80">{t("employees.labels.extra100")}:</span>
                          <span className="font-semibold text-blue-200">
                            {hourlyBasePreview.overtime100.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}/h
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-12">
                {/* Personal Info */}
                <Card>
                  <CardHeader
                    title={t("employees.headers.personal")}
                    icon={<User className="w-5 h-5" />}
                  />
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <TextField
                        label={t("employees.fields.fullName")}
                        wrapperClassName="col-span-2"
                        placeholder={t("employees.placeholders.fullName")}
                      />
                      <TextField label={t("employees.fields.nationality")} />
                      <TextField label={t("employees.fields.birthDate")} type="date" />
                      <SelectField
                        label={t("employees.fields.maritalStatus")}
                        options={maritalOptions}
                      />
                      <TextField
                        label={t("employees.fields.phone")}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Address */}
                <Card>
                  <CardHeader
                    title={t("employees.headers.address")}
                    icon={<MapPin className="w-5 h-5" />}
                  />
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <TextField
                        label={t("employees.fields.street")}
                        wrapperClassName="col-span-2"
                      />
                      <TextField label={t("employees.fields.number")} />
                      <TextField label={t("employees.fields.neighborhood")} />
                      <TextField label={t("employees.fields.city")} />
                      <TextField label={t("employees.fields.zipCode")} />
                    </div>
                  </CardContent>
                </Card>

                {/* Documents */}
                <Card>
                  <CardHeader
                    title={t("employees.headers.documents")}
                    icon={<CreditCard className="w-5 h-5" />}
                  />
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <TextField label={t("employees.fields.rg")} />
                      <TextField label={t("employees.fields.rgIssuer")} />
                      <TextField label={t("employees.fields.ctps")} />
                      <TextField label={t("employees.fields.pis")} />
                      <TextField
                        label={t("employees.fields.voterCard")}
                        wrapperClassName="col-span-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Banking */}
                <Card>
                  <CardHeader
                    title={t("employees.headers.banking")}
                    icon={<Heart className="w-5 h-5" />}
                  />
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <TextField
                        label={t("employees.fields.bank")}
                        value={formData.bankName}
                        onChange={(e) => handleInputChange("bankName", e.target.value)}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <TextField
                          label={t("employees.fields.agency")}
                          value={formData.bankAgency}
                          onChange={(e) => handleInputChange("bankAgency", e.target.value)}
                        />
                        <TextField
                          label={t("employees.fields.account")}
                          value={formData.bankAccount}
                          onChange={(e) => handleInputChange("bankAccount", e.target.value)}
                          wrapperClassName="col-span-2"
                        />
                      </div>
                      <TextField
                        label={t("employees.fields.accountDigit")}
                        value={formData.bankAccountDigit}
                        onChange={(e) => handleInputChange("bankAccountDigit", e.target.value)}
                      />
                      <TextField
                        label={t("employees.fields.pixKey")}
                        value={formData.pixKey}
                        onChange={(e) => handleInputChange("pixKey", e.target.value)}
                      />
                      <TextField
                        label={t("employees.fields.swift")}
                        value={formData.bankSwift}
                        onChange={(e) => handleInputChange("bankSwift", e.target.value)}
                      />
                      <TextField
                        label={t("employees.fields.iban")}
                        value={formData.bankIban}
                        onChange={(e) => handleInputChange("bankIban", e.target.value)}
                      />
                      <div className="space-y-1.5 col-span-2">
                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide">
                          {t("employees.fields.vt")}
                        </label>
                        <div className="flex space-x-4 mt-2">
                          <label className="flex items-center text-sm cursor-pointer">
                            <Input
                               type="radio"
                               name="vt"
                               className="mr-2 w-auto"
                               checked={formData.vtEnabled === true}
                               onChange={() => handleInputChange("vtEnabled", true)}
                            />{" "}
                            {t("employees.options.yes")}
                          </label>
                          <label className="flex items-center text-sm cursor-pointer">
                            <Input
                               type="radio"
                               name="vt"
                               className="mr-2 w-auto"
                               checked={formData.vtEnabled === false}
                               onChange={() => handleInputChange("vtEnabled", false)}
                            />{" "}
                            {t("employees.options.no")}
                          </label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>
      </PageMain>

      {/* Mobile Footer */}
      <div className="sm:hidden bg-primary text-white p-4 fixed bottom-0 w-full shadow-2xl flex justify-between items-center z-50">
        <div>
          <p className="text-[10px] opacity-70 uppercase font-bold">
            {t("employees.labels.totalCost")}
          </p>
          <p className="text-lg font-bold">
            R${" "}
            {totalCusto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <AppButton
          variant="secondary"
          size="sm"
          onClick={handleSave}
          disabled={isSaving || isDeleting || isCpfInvalid}
        >
          {t("employees.buttons.save")}
        </AppButton>
      </div>
    </PageShell>
  );
}
