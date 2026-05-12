"use client";

import { Input, Select } from "@/components/ui/field-primitives";
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

function fromApiRegime(regime: EmployeeRegime): "dia" | "quinzena" | "mes" {
  if (regime === "DIA") {
    return "dia";
  }

  if (regime === "QUINZENA") {
    return "quinzena";
  }

  return "mes";
}

function toApiRegime(regime: "dia" | "quinzena" | "mes"): EmployeeRegime {
  if (regime === "dia") {
    return "DIA";
  }

  if (regime === "quinzena") {
    return "QUINZENA";
  }

  return "MES";
}

function mapEmployee(dto: EmployeeDto): EmployeeRecord {
  return {
    id: dto.id,
    nome: dto.firstName,
    sobrenome: dto.lastName,
    cargo: dto.roleName ?? "",
    documento: dto.document,
    salario: Number(dto.salary),
    regime: fromApiRegime(dto.regime),
    horasPorDia: Number(dto.hoursPerDay),
    encargos: Number(dto.chargesPercent),
    beneficios: Number(dto.benefitsAmount),
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

  // Local form state
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

  // Sync formData when selection changes
  const handleSelect = (id: string) => {
    setSelectedId(id);
    const emp = employees.find((e) => e.id === id);
    if (emp) setFormData(emp);
  };

  // Calculation Logic based on formData
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
          prev.map((employee) => (employee.id === selectedId ? mapped : employee)),
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      {/* Top Header */}
      <Header />

      {/* Action Sub-header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center text-gray-800">
            <Users className="h-6 w-6 mr-2 text-[#002f5c]" />
            <h2 className="text-2xl font-bold">Gerenciar Funcionários</h2>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleNew}
              disabled={isSaving || isDeleting}
              className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-bold transition flex items-center shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2 text-[#2c9644]" />
              Novo
            </button>
            <button
              onClick={handleDelete}
              disabled={isSaving || isDeleting || selectedId === null}
              className="px-5 py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-sm font-bold transition flex items-center shadow-sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Deletar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || isDeleting}
              className="px-6 py-2.5 bg-[#2c9644] hover:bg-[#237836] text-white rounded-lg text-sm font-bold shadow-md transition flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Cadastro
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex gap-8">
        {/* Left Side: Employee List */}
        <aside className="w-full max-w-[400px] flex flex-col space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar funcionário..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#002f5c]/20 transition shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Lista de Colaboradores
              </span>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-320px)] divide-y divide-gray-50">
              {isLoading ? (
                <div className="p-4 text-sm text-gray-500">Carregando...</div>
              ) : null}
              {filteredEmployees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => handleSelect(emp.id)}
                  className={`w-full p-4 flex items-center justify-between text-left transition-all ${
                    selectedId === emp.id
                      ? "bg-[#002f5c]/5 border-l-4 border-l-[#002f5c]"
                      : "hover:bg-gray-50 border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        selectedId === emp.id
                          ? "bg-[#002f5c] text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {emp.nome?.[0] ?? "?"}
                      {emp.sobrenome?.[0] ?? "?"}
                    </div>
                    <div>
                      <p
                        className={`font-bold text-sm ${selectedId === emp.id ? "text-[#002f5c]" : "text-gray-800"}`}
                      >
                        {emp.nome} {emp.sobrenome}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {emp.cargo}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${selectedId === emp.id ? "translate-x-1 text-[#002f5c]" : "text-gray-300"}`}
                  />
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Side: Form */}
        <section className="flex-1 flex flex-col space-y-6">
          {/* Tabs Navigation */}
          <div className="flex space-x-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm w-fit">
            <button
              onClick={() => setActiveTab("geral")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center ${
                activeTab === "geral"
                  ? "bg-[#002f5c] text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Info className="w-4 h-4 mr-2" />
              Informações Gerais
            </button>
            <button
              onClick={() => setActiveTab("registro")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center ${
                activeTab === "registro"
                  ? "bg-[#002f5c] text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Ficha de Admissão
            </button>
          </div>

          <div className="flex-1">
            {activeTab === "geral" ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Basic Data Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-2 mb-6 border-b border-gray-50 pb-4">
                    <User className="w-5 h-5 text-[#002f5c]" />
                    <h3 className="font-bold text-gray-800">
                      Dados Obrigatórios
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5Col">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        * Nome
                      </label>
                      <Input
                        type="text"
                        value={formData.nome}
                        onChange={(e) =>
                          handleInputChange("nome", e.target.value)
                        }
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-[#002f5c]/10 outline-none transition"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        * Sobrenome
                      </label>
                      <Input
                        type="text"
                        value={formData.sobrenome}
                        onChange={(e) =>
                          handleInputChange("sobrenome", e.target.value)
                        }
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-[#002f5c]/10 outline-none transition"
                      />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        * Documento (CPF ou Outros)
                      </label>
                      <Input
                        type="text"
                        value={formData.documento}
                        onChange={(e) =>
                          handleInputChange("documento", e.target.value)
                        }
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-[#002f5c]/10 outline-none transition"
                        placeholder="000.000.000-00 ou Passaporte"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        * Salário Base (R$)
                      </label>
                      <Input
                        type="number"
                        value={formData.salario}
                        onChange={(e) =>
                          handleInputChange("salario", Number(e.target.value))
                        }
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-[#002f5c]/10 outline-none transition"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        * Regime
                      </label>
                      <Select
                        value={formData.regime}
                        onChange={(e) =>
                          handleInputChange("regime", e.target.value)
                        }
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white outline-none transition"
                      >
                        <option value="dia">Dia</option>
                        <option value="quinzena">Quinzena</option>
                        <option value="mes">Mês</option>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        * Horas por Dia
                      </label>
                      <div className="relative">
                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          value={formData.horasPorDia}
                          onChange={(e) =>
                            handleInputChange(
                              "horasPorDia",
                              Number(e.target.value),
                            )
                          }
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-[#002f5c]/10 outline-none transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Data & Calculation Card */}
                <div className="flex flex-col space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-2 mb-6 border-b border-gray-50 pb-4">
                      <DollarSign className="w-5 h-5 text-[#2c9644]" />
                      <h3 className="font-bold text-gray-800">
                        Encargos e Benefícios
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                          Encargos Trabalhistas (%)
                        </label>
                        <Input
                          type="number"
                          value={formData.encargos}
                          onChange={(e) =>
                            handleInputChange(
                              "encargos",
                              Number(e.target.value),
                            )
                          }
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white outline-none transition"
                          placeholder="Ex: 50%"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                          Benefícios (Valor R$)
                        </label>
                        <Input
                          type="number"
                          value={formData.beneficios}
                          onChange={(e) =>
                            handleInputChange(
                              "beneficios",
                              Number(e.target.value),
                            )
                          }
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white outline-none transition"
                          placeholder="Ex: 100,00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-gradient-to-br from-[#002f5c] to-[#001f3f] p-8 rounded-2xl shadow-lg text-white">
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
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-12">
                {/* Personal Info Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-2 mb-6 border-b border-gray-50 pb-4">
                    <User className="w-5 h-5 text-[#002f5c]" />
                    <h3 className="font-bold text-gray-800">Dados Pessoais</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">
                        NOME COMPLETO
                      </label>
                      <Input
                        type="text"
                        className="w-full p-2 bg-gray-50 border rounded-lg text-sm"
                        placeholder="Como consta no documento"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">
                        NACIONALIDADE
                      </label>
                      <Input
                        type="text"
                        className="w-full p-2 bg-gray-50 border rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">
                        DATA NASC.
                      </label>
                      <Input
                        type="date"
                        className="w-full p-2 bg-gray-50 border rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">
                        ESTADO CIVIL
                      </label>
                      <Select className="w-full p-2 bg-gray-50 border rounded-lg text-sm">
                        <option>Solteiro(a)</option>
                        <option>Casado(a)</option>
                        <option>Divorciado(a)</option>
                        <option>Viúvo(a)</option>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">
                        CELULAR
                      </label>
                      <Input
                        type="text"
                        className="w-full p-2 bg-gray-50 border rounded-lg text-sm"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-2 mb-6 border-b border-gray-50 pb-4">
                    <MapPin className="w-5 h-5 text-[#002f5c]" />
                    <h3 className="font-bold text-gray-800">Endereço</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">
                        RUA / LOGRADOURO
                      </label>
                      <Input
                        type="text"
                        className="w-full p-2 bg-gray-50 border rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">
                        Nº
                      </label>
                      <Input
                        type="text"
                        className="w-full p-2 bg-gray-50 border rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">
                        BAIRRO
                      </label>
                      <Input
                        type="text"
                        className="w-full p-2 bg-gray-50 border rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">
                        CIDADE
                      </label>
                      <Input
                        type="text"
                        className="w-full p-2 bg-gray-50 border rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">
                        CEP
                      </label>
                      <Input
                        type="text"
                        className="w-full p-2 bg-gray-50 border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Documents Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-2 mb-6 border-b border-gray-50 pb-4">
                    <CreditCard className="w-5 h-5 text-[#002f5c]" />
                    <h3 className="font-bold text-gray-800">
                      Documentação Detalhada
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">
                        RG
                      </label>
                      <Input
                        type="text"
                        className="w-full p-2 bg-gray-50 border rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">
                        ÓRGÃO EXPEDITOR
                      </label>
                      <Input
                        type="text"
                        className="w-full p-2 bg-gray-50 border rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">
                        CTPS (Nº/SÉRIE)
                      </label>
                      <Input
                        type="text"
                        className="w-full p-2 bg-gray-50 border rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">
                        PIS / PASEP
                      </label>
                      <Input
                        type="text"
                        className="w-full p-2 bg-gray-50 border rounded-lg text-sm"
                      />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">
                        TÍTULO DE ELEITOR (ZONA/SEÇÃO)
                      </label>
                      <Input
                        type="text"
                        className="w-full p-2 bg-gray-50 border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Banking & Benefits Detail Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-2 mb-6 border-b border-gray-50 pb-4">
                    <Heart className="w-5 h-5 text-[#002f5c]" />
                    <h3 className="font-bold text-gray-800">
                      Dados Bancários e Outros
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">
                        BANCO
                      </label>
                      <Input
                        type="text"
                        className="w-full p-2 bg-gray-50 border rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">
                        AGÊNCIA / CONTA
                      </label>
                      <Input
                        type="text"
                        className="w-full p-2 bg-gray-50 border rounded-lg text-sm"
                      />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">
                        PIX (CHAVE)
                      </label>
                      <Input
                        type="text"
                        className="w-full p-2 bg-gray-50 border rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">
                        VALE TRANSPORTE?
                      </label>
                      <div className="flex space-x-4 mt-2">
                        <label className="flex items-center text-sm">
                          <Input type="radio" name="vt" className="mr-2" /> Sim
                        </label>
                        <label className="flex items-center text-sm">
                          <Input type="radio" name="vt" className="mr-2" /> Não
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Floating Footer info for mobile or quick summary */}
      <div className="sm:hidden bg-[#002f5c] text-white p-4 fixed bottom-0 w-full shadow-2xl flex justify-between items-center">
        <div>
          <p className="text-[10px] opacity-70 uppercase font-bold">
            Custo Total Est.
          </p>
          <p className="text-lg font-bold">
            R${" "}
            {totalCusto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || isDeleting}
          className="bg-[#2c9644] px-4 py-2 rounded-lg font-bold text-sm"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
