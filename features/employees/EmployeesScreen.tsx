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
import { InfoTooltip } from "@/components/ui/tooltip";
import { useAppToast } from "@/lib/use-app-toast";

type EmployeeRecord = {
  id: string;
  nome: string;
  sobrenome: string;
  cargo: string;
  documento: string;
  docType: "cpf" | "outros";
  docTypeOther: string;
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
  nationality: string;
  birthDate: string;
  maritalStatus: string;
  phone: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  zipCode: string;
  rg: string;
  rgIssuer: string;
  ctps: string;
  pis: string;
  voterCardNumber: string;
  voterCardZone: string;
  voterCardSection: string;
};

const EMPTY_EMPLOYEE: EmployeeRecord = {
  id: "",
  nome: "",
  sobrenome: "",
  cargo: "",
  documento: "",
  docType: "cpf",
  docTypeOther: "",
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
  nationality: "",
  birthDate: "",
  maritalStatus: "solteiro",
  phone: "",
  street: "",
  number: "",
  neighborhood: "",
  city: "",
  zipCode: "",
  rg: "",
  rgIssuer: "",
  ctps: "",
  pis: "",
  voterCardNumber: "",
  voterCardZone: "",
  voterCardSection: "",
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

function formatCPF(val: string): string {
  const clean = val.replace(/\D/g, "");
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`;
  if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
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

function mapEmployee(dto: EmployeeDto, existing?: EmployeeRecord): EmployeeRecord {
  const doc = dto.document ?? "";
  const docType =
    dto.documentType === "OTHER"
      ? "outros"
      : dto.documentType === "CPF"
        ? "cpf"
        : doc.replace(/\D/g, "").length === 11
          ? "cpf"
          : "outros";
  return {
    id: dto.id ?? "",
    nome: dto.firstName ?? "",
    sobrenome: dto.lastName ?? "",
    cargo: dto.roleName ?? "",
    documento: docType === "cpf" ? formatCPF(doc) : doc,
    docType,
    docTypeOther: dto.documentTypeOther ?? existing?.docTypeOther ?? "",
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
    nationality: dto.nationality ?? "",
    birthDate: dto.birthDate ?? "",
    maritalStatus: dto.maritalStatus ?? "solteiro",
    phone: dto.phone ?? "",
    street: dto.street ?? "",
    number: dto.number ?? "",
    neighborhood: dto.neighborhood ?? "",
    city: dto.city ?? "",
    zipCode: dto.zipCode ?? "",
    rg: dto.rg ?? "",
    rgIssuer: dto.rgIssuer ?? "",
    ctps: dto.ctps ?? "",
    pis: dto.pis ?? "",
    voterCardNumber: dto.voterCardNumber ?? "",
    voterCardZone: dto.voterCardZone ?? "",
    voterCardSection: dto.voterCardSection ?? "",
  };
}

export default function FuncionariosPageView() {
  const { t } = useTranslation();
  const appToast = useAppToast();

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
        const mapped = data.map((e) => mapEmployee(e));
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
    if (formData.docType !== "cpf") return false;
    const clean = formData.documento.replace(/\D/g, "");
    if (clean.length === 0) return true;
    if (clean.length !== 11) return true;
    return !validateCPF(formData.documento);
  }, [formData.docType, formData.documento]);

  const isDocTypeOtherMissing = useMemo(() => {
    return formData.docType === "outros" && !formData.docTypeOther.trim();
  }, [formData.docType, formData.docTypeOther]);

  const isDocumentMissing = useMemo(() => {
    return !formData.documento.trim();
  }, [formData.documento]);

  const isSaveDisabled =
    isCpfInvalid || isDocTypeOtherMissing || isDocumentMissing;

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
    if (isSaveDisabled) return;
    setIsSaving(true);
    try {
      const payloadData = {
        firstName: formData.nome,
        lastName: formData.sobrenome,
        document:
          formData.docType === "cpf"
            ? formData.documento.replace(/\D/g, "")
            : formData.documento.trim(),
        documentType: formData.docType === "cpf" ? ("CPF" as const) : ("OTHER" as const),
        documentTypeOther:
          formData.docType === "outros" ? formData.docTypeOther.trim() : null,
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
        nationality: formData.nationality || null,
        birthDate: formData.birthDate || null,
        maritalStatus: formData.maritalStatus || null,
        phone: formData.phone || null,
        street: formData.street || null,
        number: formData.number || null,
        neighborhood: formData.neighborhood || null,
        city: formData.city || null,
        zipCode: formData.zipCode || null,
        rg: formData.rg || null,
        rgIssuer: formData.rgIssuer || null,
        ctps: formData.ctps || null,
        pis: formData.pis || null,
        voterCardNumber: formData.voterCardNumber || null,
        voterCardZone: formData.voterCardZone || null,
        voterCardSection: formData.voterCardSection || null,
      };

      if (selectedId === null) {
        const created = await employeeService.createEmployee(payloadData);
        const mapped = mapEmployee(created, formData);
        setEmployees((prev) => [...prev, mapped]);
        setSelectedId(mapped.id);
        setFormData(mapped);
      } else {
        const updated = await employeeService.updateEmployee(selectedId, payloadData);
        const mapped = mapEmployee(updated, formData);
        setEmployees((prev) =>
          prev.map((employee) =>
            employee.id === selectedId ? mapped : employee,
          ),
        );
        setFormData(mapped);
      }
      appToast.saved();
    } catch (error) {
      console.error("Erro ao salvar funcionario", error);
      appToast.fromUnknownError(error, "employees.errors.saveFailed");
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
      appToast.deleted();
    } catch (error) {
      console.error("Erro ao excluir funcionario", error);
      appToast.fromUnknownError(error, "employees.errors.deleteFailed");
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
              disabled={isDeleting || isSaveDisabled}
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
                        label={<span>{t("employees.fields.firstName")}<InfoTooltip content={t("global.tooltips.firstName")} /></span>}
                        required
                        value={formData.nome || ""}
                        onChange={(e) =>
                          handleInputChange("nome", e.target.value)
                        }
                      />
                      <TextField
                        label={<span>{t("employees.fields.lastName")}<InfoTooltip content={t("global.tooltips.lastName")} /></span>}
                        required
                        value={formData.sobrenome || ""}
                        onChange={(e) =>
                          handleInputChange("sobrenome", e.target.value)
                        }
                      />
                      <SelectField
                        label={<span>{t("employees.fields.docType")}<InfoTooltip content={t("global.tooltips.document")} /></span>}
                        required
                        value={formData.docType || "cpf"}
                        onChange={(e) => {
                          const newDocType = e.target.value as "cpf" | "outros";
                          setFormData((prev) => ({
                            ...prev,
                            docType: newDocType,
                            docTypeOther: newDocType === "outros" ? prev.docTypeOther : "",
                            documento:
                              newDocType === "cpf"
                                ? formatCPF(prev.documento.replace(/\D/g, ""))
                                : prev.documento,
                          }));
                        }}
                        options={[
                          { value: "cpf", label: t("employees.options.docType.cpf") },
                          { value: "outros", label: t("employees.options.docType.outros") },
                        ]}
                      />
                      {formData.docType === "outros" ? (
                        <TextField
                          label={
                            <span>
                              {t("employees.fields.docTypeOther")}
                              <InfoTooltip content={t("global.tooltips.docTypeOther")} />
                            </span>
                          }
                          required
                          value={formData.docTypeOther || ""}
                          onChange={(e) =>
                            handleInputChange("docTypeOther", e.target.value)
                          }
                          error={
                            isDocTypeOtherMissing
                              ? t("employees.errors.docTypeOtherRequired")
                              : undefined
                          }
                          placeholder={t("employees.placeholders.docTypeOther")}
                        />
                      ) : null}
                      <TextField
                        wrapperClassName={formData.docType === "outros" ? "col-span-2" : undefined}
                        label={<span>{t("employees.fields.document")}<InfoTooltip content={t("global.tooltips.documentNumber")} /></span>}
                        required
                        value={formData.documento || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          const formatted = formData.docType === "cpf" ? formatCPF(val) : val;
                          handleInputChange("documento", formatted);
                        }}
                        error={
                          formData.docType === "cpf" && isCpfInvalid
                            ? t("employees.errors.cpfInvalid")
                            : isDocumentMissing
                              ? t("employees.errors.documentRequired")
                              : undefined
                        }
                        placeholder={
                          formData.docType === "cpf"
                            ? t("employees.placeholders.document")
                            : t("employees.placeholders.docNumber")
                        }
                      />
                      <TextField
                        label={<span>{t("employees.fields.role")}<InfoTooltip content={t("global.tooltips.role")} /></span>}
                        value={formData.cargo || ""}
                        onChange={(e) =>
                          handleInputChange("cargo", e.target.value)
                        }
                      />
                      <TextField
                        label={<span>{t("employees.fields.salary")}<InfoTooltip content={t("global.tooltips.salary")} /></span>}
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
                        label={<span>{t("employees.fields.regime")}<InfoTooltip content={t("global.tooltips.regime")} /></span>}
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
                        label={<span>{t("employees.fields.hoursPerDay")}<InfoTooltip content={t("global.tooltips.hoursPerDay")} /></span>}
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
                        label={<span>{t("employees.fields.charges")}<InfoTooltip content={t("global.tooltips.charges")} /></span>}
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
                        label={<span>{t("employees.fields.benefits")}<InfoTooltip content={t("global.tooltips.benefits")} /></span>}
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
                        label={<span>{t("employees.fields.nationality")}<InfoTooltip content={t("global.tooltips.nationality")} /></span>}
                        value={formData.nationality || ""}
                        onChange={(e) => handleInputChange("nationality", e.target.value)}
                      />
                      <TextField
                        label={<span>{t("employees.fields.birthDate")}<InfoTooltip content={t("global.tooltips.birthDate")} /></span>}
                        type="date"
                        value={formData.birthDate || ""}
                        onChange={(e) => handleInputChange("birthDate", e.target.value)}
                      />
                      <SelectField
                        label={<span>{t("employees.fields.maritalStatus")}<InfoTooltip content={t("global.tooltips.maritalStatus")} /></span>}
                        value={formData.maritalStatus || "solteiro"}
                        onChange={(e) => handleInputChange("maritalStatus", e.target.value)}
                        options={maritalOptions}
                      />
                      <TextField
                        label={<span>{t("employees.fields.phone")}<InfoTooltip content={t("global.tooltips.phone")} /></span>}
                        placeholder="(00) 00000-0000"
                        value={formData.phone || ""}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
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
                        label={<span>{t("employees.fields.street")}<InfoTooltip content={t("global.tooltips.street")} /></span>}
                        wrapperClassName="col-span-2"
                        value={formData.street || ""}
                        onChange={(e) => handleInputChange("street", e.target.value)}
                      />
                      <TextField
                        label={<span>{t("employees.fields.number")}<InfoTooltip content={t("global.tooltips.number")} /></span>}
                        value={formData.number || ""}
                        onChange={(e) => handleInputChange("number", e.target.value)}
                      />
                      <TextField
                        label={<span>{t("employees.fields.neighborhood")}<InfoTooltip content={t("global.tooltips.neighborhood")} /></span>}
                        value={formData.neighborhood || ""}
                        onChange={(e) => handleInputChange("neighborhood", e.target.value)}
                      />
                      <TextField
                        label={<span>{t("employees.fields.city")}<InfoTooltip content={t("global.tooltips.city")} /></span>}
                        value={formData.city || ""}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                      />
                      <TextField
                        label={<span>{t("employees.fields.zipCode")}<InfoTooltip content={t("global.tooltips.zipCode")} /></span>}
                        value={formData.zipCode || ""}
                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      />
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
                      <TextField
                        label={<span>{t("employees.fields.rg")}<InfoTooltip content={t("global.tooltips.rg")} /></span>}
                        value={formData.rg || ""}
                        onChange={(e) => handleInputChange("rg", e.target.value)}
                      />
                      <TextField
                        label={<span>{t("employees.fields.rgIssuer")}<InfoTooltip content={t("global.tooltips.rgIssuer")} /></span>}
                        value={formData.rgIssuer || ""}
                        onChange={(e) => handleInputChange("rgIssuer", e.target.value)}
                      />
                      <TextField
                        label={<span>{t("employees.fields.ctps")}<InfoTooltip content={t("global.tooltips.ctps")} /></span>}
                        value={formData.ctps || ""}
                        onChange={(e) => handleInputChange("ctps", e.target.value)}
                      />
                      <TextField
                        label={<span>{t("employees.fields.pis")}<InfoTooltip content={t("global.tooltips.pis")} /></span>}
                        value={formData.pis || ""}
                        onChange={(e) => handleInputChange("pis", e.target.value)}
                      />
                      <TextField
                        label={<span>{t("employees.fields.voterCardNumber")}<InfoTooltip content={t("global.tooltips.voterCardNumber")} /></span>}
                        value={formData.voterCardNumber || ""}
                        onChange={(e) => handleInputChange("voterCardNumber", e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <TextField
                          label={<span>{t("employees.fields.voterCardZone")}<InfoTooltip content={t("global.tooltips.voterCardZone")} /></span>}
                          value={formData.voterCardZone || ""}
                          onChange={(e) => handleInputChange("voterCardZone", e.target.value)}
                        />
                        <TextField
                          label={<span>{t("employees.fields.voterCardSection")}<InfoTooltip content={t("global.tooltips.voterCardSection")} /></span>}
                          value={formData.voterCardSection || ""}
                          onChange={(e) => handleInputChange("voterCardSection", e.target.value)}
                        />
                      </div>
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
                        label={<span>{t("employees.fields.bank")}<InfoTooltip content={t("global.tooltips.bankName")} /></span>}
                        value={formData.bankName}
                        onChange={(e) => handleInputChange("bankName", e.target.value)}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <TextField
                          label={<span>{t("employees.fields.agency")}<InfoTooltip content={t("global.tooltips.bankAgency")} /></span>}
                          value={formData.bankAgency}
                          onChange={(e) => handleInputChange("bankAgency", e.target.value)}
                        />
                        <TextField
                          label={<span>{t("employees.fields.account")}<InfoTooltip content={t("global.tooltips.bankAccount")} /></span>}
                          value={formData.bankAccount}
                          onChange={(e) => handleInputChange("bankAccount", e.target.value)}
                          wrapperClassName="col-span-2"
                        />
                      </div>
                      <TextField
                        label={<span>{t("employees.fields.accountDigit")}<InfoTooltip content={t("global.tooltips.bankAccountDigit")} /></span>}
                        value={formData.bankAccountDigit}
                        onChange={(e) => handleInputChange("bankAccountDigit", e.target.value)}
                      />
                      <TextField
                        label={<span>{t("employees.fields.pixKey")}<InfoTooltip content={t("global.tooltips.pixKey")} /></span>}
                        value={formData.pixKey}
                        onChange={(e) => handleInputChange("pixKey", e.target.value)}
                      />
                      <TextField
                        label={<span>{t("employees.fields.swift")}<InfoTooltip content={t("global.tooltips.swift")} /></span>}
                        value={formData.bankSwift}
                        onChange={(e) => handleInputChange("bankSwift", e.target.value)}
                      />
                      <TextField
                        label={<span>{t("employees.fields.iban")}<InfoTooltip content={t("global.tooltips.iban")} /></span>}
                        value={formData.bankIban}
                        onChange={(e) => handleInputChange("bankIban", e.target.value)}
                      />
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
          disabled={isSaving || isDeleting || isSaveDisabled}
        >
          {t("employees.buttons.save")}
        </AppButton>
      </div>
    </PageShell>
  );
}
