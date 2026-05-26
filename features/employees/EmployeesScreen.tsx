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
};

const REGIME_OPTIONS = [
  { value: "dia", label: "Dia" },
  { value: "quinzena", label: "Quinzena" },
  { value: "mes", label: "Mês" },
];

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
  };
}

export default function FuncionariosPageView() {
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
    setIsSaving(true);
    try {
      if (selectedId === null) {
        const created = await employeeService.createEmployee({
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
        });
        const mapped = mapEmployee(created);
        setEmployees((prev) => [...prev, mapped]);
        setSelectedId(mapped.id);
        setFormData(mapped);
      } else {
        const updated = await employeeService.updateEmployee(selectedId, {
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
        });
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
        title="Gerenciar Funcionários"
        icon={<Users className="h-6 w-6" />}
        actions={
          <>
            <AppButton
              variant="outline"
              icon={<Plus className="w-4 h-4 text-secondary" />}
              disabled={isSaving || isDeleting}
              onClick={handleNew}
            >
              Novo
            </AppButton>
            <AppButton
              variant="danger-outline"
              icon={<Trash2 className="w-4 h-4" />}
              disabled={isSaving || isDeleting || selectedId === null}
              onClick={handleDelete}
            >
              Deletar
            </AppButton>
            <AppButton
              variant="secondary"
              icon={<Save className="w-4 h-4" />}
              loading={isSaving}
              disabled={isDeleting}
              onClick={handleSave}
            >
              Salvar Cadastro
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
              placeholder="Buscar funcionário..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Card className="overflow-hidden flex-1 flex flex-col">
            <CardHeader title="Lista de Colaboradores" />
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
              Informações Gerais
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
              Ficha de Admissão
            </button>
          </div>

          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Basic Data Skeleton */}
                <Card>
                  <CardHeader
                    title="Dados Obrigatórios"
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
                      title="Encargos e Benefícios"
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
                    title="Dados Obrigatórios"
                    icon={<User className="w-5 h-5" />}
                  />
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <TextField
                        label="Nome"
                        required
                        value={formData.nome}
                        onChange={(e) =>
                          handleInputChange("nome", e.target.value)
                        }
                      />
                      <TextField
                        label="Sobrenome"
                        required
                        value={formData.sobrenome}
                        onChange={(e) =>
                          handleInputChange("sobrenome", e.target.value)
                        }
                      />
                      <TextField
                        label="Documento (CPF ou Outros)"
                        required
                        wrapperClassName="col-span-2"
                        value={formData.documento}
                        onChange={(e) =>
                          handleInputChange("documento", e.target.value)
                        }
                        placeholder="000.000.000-00 ou Passaporte"
                      />
                      <TextField
                        label="Salário Base (R$)"
                        required
                        type="number"
                        value={formData.salario}
                        onChange={(e) =>
                          handleInputChange(
                            "salario",
                            Number(e.target.value),
                          )
                        }
                      />
                      <SelectField
                        label="Regime"
                        required
                        value={formData.regime}
                        onChange={(e) =>
                          handleInputChange(
                            "regime",
                            e.target.value as
                              | "dia"
                              | "quinzena"
                              | "mes",
                          )
                        }
                        options={REGIME_OPTIONS}
                      />
                      <TextField
                        label="Horas por Dia"
                        required
                        type="number"
                        value={formData.horasPorDia}
                        onChange={(e) =>
                          handleInputChange(
                            "horasPorDia",
                            Number(e.target.value),
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
                      title="Encargos e Benefícios"
                      icon={<DollarSign className="w-5 h-5 text-secondary" />}
                    />
                    <CardContent className="space-y-4">
                      <TextField
                        label="Encargos Trabalhistas (%)"
                        type="number"
                        value={formData.encargos}
                        onChange={(e) =>
                          handleInputChange(
                            "encargos",
                            Number(e.target.value),
                          )
                        }
                        placeholder="Ex: 50%"
                      />
                      <TextField
                        label="Benefícios (Valor R$)"
                        type="number"
                        value={formData.beneficios}
                        onChange={(e) =>
                          handleInputChange(
                            "beneficios",
                            Number(e.target.value),
                          )
                        }
                        placeholder="Ex: 100,00"
                      />
                    </CardContent>
                  </Card>

                  {/* Summary Card */}
                  <Card variant="gradient" className="p-8">
                    <h4 className="text-sm font-bold uppercase tracking-widest opacity-70 mb-4">
                      Resumo de Custo Mensal
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="opacity-80">Salário Base:</span>
                        <span className="font-medium">
                          R${" "}
                          {Number(formData.salario).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="opacity-80">
                          Encargos ({formData.encargos}%):
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
                        <span className="opacity-80">Benefícios:</span>
                        <span className="font-medium text-blue-200">
                          + R${" "}
                          {Number(formData.beneficios).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="pt-4 mt-4 border-t border-white/10 flex justify-between items-end">
                        <span className="text-lg font-bold">Custo Total:</span>
                        <span className="text-3xl font-black text-[#4ade80]">
                          R${" "}
                          {totalCusto.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
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
                    title="Dados Pessoais"
                    icon={<User className="w-5 h-5" />}
                  />
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <TextField
                        label="Nome Completo"
                        wrapperClassName="col-span-2"
                        placeholder="Como consta no documento"
                      />
                      <TextField label="Nacionalidade" />
                      <TextField label="Data Nasc." type="date" />
                      <SelectField
                        label="Estado Civil"
                        options={[
                          { value: "solteiro", label: "Solteiro(a)" },
                          { value: "casado", label: "Casado(a)" },
                          { value: "divorciado", label: "Divorciado(a)" },
                          { value: "viuvo", label: "Viúvo(a)" },
                        ]}
                      />
                      <TextField
                        label="Celular"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Address */}
                <Card>
                  <CardHeader
                    title="Endereço"
                    icon={<MapPin className="w-5 h-5" />}
                  />
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <TextField
                        label="Rua / Logradouro"
                        wrapperClassName="col-span-2"
                      />
                      <TextField label="Nº" />
                      <TextField label="Bairro" />
                      <TextField label="Cidade" />
                      <TextField label="CEP" />
                    </div>
                  </CardContent>
                </Card>

                {/* Documents */}
                <Card>
                  <CardHeader
                    title="Documentação Detalhada"
                    icon={<CreditCard className="w-5 h-5" />}
                  />
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <TextField label="RG" />
                      <TextField label="Órgão Expeditor" />
                      <TextField label="CTPS (Nº/Série)" />
                      <TextField label="PIS / PASEP" />
                      <TextField
                        label="Título de Eleitor (Zona/Seção)"
                        wrapperClassName="col-span-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Banking */}
                <Card>
                  <CardHeader
                    title="Dados Bancários e Outros"
                    icon={<Heart className="w-5 h-5" />}
                  />
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <TextField label="Banco" />
                      <TextField label="Agência / Conta" />
                      <TextField
                        label="PIX (Chave)"
                        wrapperClassName="col-span-2"
                      />
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide">
                          Vale Transporte?
                        </label>
                        <div className="flex space-x-4 mt-2">
                          <label className="flex items-center text-sm cursor-pointer">
                            <Input
                              type="radio"
                              name="vt"
                              className="mr-2 w-auto"
                            />{" "}
                            Sim
                          </label>
                          <label className="flex items-center text-sm cursor-pointer">
                            <Input
                              type="radio"
                              name="vt"
                              className="mr-2 w-auto"
                            />{" "}
                            Não
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
            Custo Total Est.
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
          disabled={isSaving || isDeleting}
        >
          Salvar
        </AppButton>
      </div>
    </PageShell>
  );
}
