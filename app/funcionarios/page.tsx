"use client";

import { useRouter } from "next/navigation";
import { 
  LogOut, 
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
  LayoutDashboard,
  CreditCard,
  MapPin,
  Heart
} from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";

// Mock Data
const INITIAL_EMPLOYEES = [
  { id: 1, nome: "João", sobrenome: "Silva", cargo: "Desenvolvedor Full Stack", documento: "123.456.789-00", salario: 5000, regime: "mes", horasPorDia: 8, encargos: 50, beneficios: 200 },
  { id: 2, nome: "Maria", sobrenome: "Oliveira", cargo: "Designer UI/UX", documento: "987.654.321-11", salario: 4500, regime: "mes", horasPorDia: 8, encargos: 50, beneficios: 150 },
  { id: 3, nome: "Carlos", sobrenome: "Santos", cargo: "Gerente de Projetos", documento: "456.789.123-22", salario: 7000, regime: "mes", horasPorDia: 9, encargos: 50, beneficios: 300 },
];

export default function FuncionariosPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [selectedId, setSelectedId] = useState<number | null>(1);
  const [activeTab, setActiveTab] = useState<'geral' | 'registro'>('geral');
  const [searchTerm, setSearchTerm] = useState("");
  
  // Local form state
  const [formData, setFormData] = useState(INITIAL_EMPLOYEES[0]);

  // Sync formData when selection changes
  const handleSelect = (id: number) => {
    setSelectedId(id);
    const emp = employees.find(e => e.id === id);
    if (emp) setFormData(emp);
  };

  // Calculation Logic based on formData
  const totalCusto = useMemo(() => {
    const base = Number(formData.salario) || 0;
    const encargosVal = (base * (Number(formData.encargos) || 0)) / 100;
    const beneficiosVal = Number(formData.beneficios) || 0;
    return base + encargosVal + beneficiosVal;
  }, [formData]);

  const filteredEmployees = employees.filter(e => 
    `${e.nome} ${e.sobrenome}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNew = () => {
    setSelectedId(null);
    setFormData({
      id: 0, 
      nome: "", 
      sobrenome: "", 
      cargo: "", 
      documento: "", 
      salario: 0, 
      regime: "mes", 
      horasPorDia: 8, 
      encargos: 0, 
      beneficios: 0 
    });
  };

  const handleSave = () => {
    if (selectedId === null) {
      // Create new
      const newId = Math.max(...employees.map(e => e.id), 0) + 1;
      const newEmp = { ...formData, id: newId };
      setEmployees([...employees, newEmp]);
      setSelectedId(newId);
    } else {
      // Update existing
      setEmployees(prev => prev.map(e => e.id === selectedId ? { ...formData, id: selectedId } : e));
    }
    alert("Cadastro salvo com sucesso!");
  };

  const handleDelete = () => {
    if (!selectedId) return;
    const newEmployees = employees.filter(e => e.id !== selectedId);
    setEmployees(newEmployees);
    if (newEmployees.length > 0) {
      handleSelect(newEmployees[0].id);
    } else {
      handleNew();
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
                className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-bold transition flex items-center shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2 text-[#2c9644]" />
                Novo
              </button>
              <button 
                onClick={handleDelete}
                className="px-5 py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-sm font-bold transition flex items-center shadow-sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar
              </button>
              <button 
                onClick={handleSave}
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
            <input 
              type="text" 
              placeholder="Buscar funcionário..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#002f5c]/20 transition shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lista de Colaboradores</span>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-320px)] divide-y divide-gray-50">
              {filteredEmployees.map(emp => (
                <button
                  key={emp.id}
                  onClick={() => handleSelect(emp.id)}
                  className={`w-full p-4 flex items-center justify-between text-left transition-all ${
                    selectedId === emp.id 
                    ? 'bg-[#002f5c]/5 border-l-4 border-l-[#002f5c]' 
                    : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      selectedId === emp.id ? 'bg-[#002f5c] text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {emp.nome[0]}{emp.sobrenome[0]}
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${selectedId === emp.id ? 'text-[#002f5c]' : 'text-gray-800'}`}>
                        {emp.nome} {emp.sobrenome}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{emp.cargo}</p>
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-transform ${selectedId === emp.id ? 'translate-x-1 text-[#002f5c]' : 'text-gray-300'}`} />
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
               onClick={() => setActiveTab('geral')}
               className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center ${
                 activeTab === 'geral' 
                 ? 'bg-[#002f5c] text-white shadow-md' 
                 : 'text-gray-500 hover:bg-gray-50'
               }`}
            >
              <Info className="w-4 h-4 mr-2" />
              Informações Gerais
            </button>
            <button
               onClick={() => setActiveTab('registro')}
               className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center ${
                 activeTab === 'registro' 
                 ? 'bg-[#002f5c] text-white shadow-md' 
                 : 'text-gray-500 hover:bg-gray-50'
               }`}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Ficha de Admissão
            </button>
          </div>

          <div className="flex-1">
            {activeTab === 'geral' ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Basic Data Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-2 mb-6 border-b border-gray-50 pb-4">
                    <User className="w-5 h-5 text-[#002f5c]" />
                    <h3 className="font-bold text-gray-800">Dados Obrigatórios</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5Col">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">* Nome</label>
                      <input 
                        type="text" 
                        value={formData.nome}
                        onChange={(e) => handleInputChange('nome', e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-[#002f5c]/10 outline-none transition"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">* Sobrenome</label>
                      <input 
                        type="text" 
                        value={formData.sobrenome}
                        onChange={(e) => handleInputChange('sobrenome', e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-[#002f5c]/10 outline-none transition"
                      />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">* Documento (CPF ou Outros)</label>
                      <input 
                        type="text" 
                        value={formData.documento}
                        onChange={(e) => handleInputChange('documento', e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-[#002f5c]/10 outline-none transition"
                        placeholder="000.000.000-00 ou Passaporte"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">* Salário Base (R$)</label>
                      <input 
                        type="number" 
                        value={formData.salario}
                        onChange={(e) => handleInputChange('salario', e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-[#002f5c]/10 outline-none transition"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">* Regime</label>
                      <select 
                        value={formData.regime}
                        onChange={(e) => handleInputChange('regime', e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white outline-none transition"
                      >
                        <option value="dia">Dia</option>
                        <option value="quinzena">Quinzena</option>
                        <option value="mes">Mês</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">* Horas por Dia</label>
                      <div className="relative">
                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input 
                          type="number" 
                          value={formData.horasPorDia}
                          onChange={(e) => handleInputChange('horasPorDia', e.target.value)}
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
                      <h3 className="font-bold text-gray-800">Encargos e Benefícios</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Encargos Trabalhistas (%)</label>
                        <input 
                          type="number" 
                          value={formData.encargos}
                          onChange={(e) => handleInputChange('encargos', e.target.value)}
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white outline-none transition"
                          placeholder="Ex: 50%"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Benefícios (Valor R$)</label>
                        <input 
                          type="number" 
                          value={formData.beneficios}
                          onChange={(e) => handleInputChange('beneficios', e.target.value)}
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white outline-none transition"
                          placeholder="Ex: 100,00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-gradient-to-br from-[#002f5c] to-[#001f3f] p-8 rounded-2xl shadow-lg text-white">
                    <h4 className="text-sm font-bold uppercase tracking-widest opacity-70 mb-4">Resumo de Custo Mensal</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="opacity-80">Salário Base:</span>
                        <span className="font-medium">R$ {Number(formData.salario).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="opacity-80">Encargos ({formData.encargos}%):</span>
                        <span className="font-medium text-blue-200">+ R$ {((formData.salario * formData.encargos) / 100).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="opacity-80">Benefícios:</span>
                        <span className="font-medium text-blue-200">+ R$ {Number(formData.beneficios).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="pt-4 mt-4 border-t border-white/10 flex justify-between items-end">
                        <span className="text-lg font-bold">Custo Total:</span>
                        <span className="text-3xl font-black text-[#4ade80]">R$ {totalCusto.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
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
                      <label className="text-xs font-bold text-gray-500">NOME COMPLETO</label>
                      <input type="text" className="w-full p-2 bg-gray-50 border rounded-lg text-sm" placeholder="Como consta no documento" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">NACIONALIDADE</label>
                      <input type="text" className="w-full p-2 bg-gray-50 border rounded-lg text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">DATA NASC.</label>
                      <input type="date" className="w-full p-2 bg-gray-50 border rounded-lg text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">ESTADO CIVIL</label>
                      <select className="w-full p-2 bg-gray-50 border rounded-lg text-sm">
                        <option>Solteiro(a)</option>
                        <option>Casado(a)</option>
                        <option>Divorciado(a)</option>
                        <option>Viúvo(a)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">CELULAR</label>
                      <input type="text" className="w-full p-2 bg-gray-50 border rounded-lg text-sm" placeholder="(00) 00000-0000" />
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
                      <label className="text-xs font-bold text-gray-500">RUA / LOGRADOURO</label>
                      <input type="text" className="w-full p-2 bg-gray-50 border rounded-lg text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">Nº</label>
                      <input type="text" className="w-full p-2 bg-gray-50 border rounded-lg text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">BAIRRO</label>
                      <input type="text" className="w-full p-2 bg-gray-50 border rounded-lg text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">CIDADE</label>
                      <input type="text" className="w-full p-2 bg-gray-50 border rounded-lg text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">CEP</label>
                      <input type="text" className="w-full p-2 bg-gray-50 border rounded-lg text-sm" />
                    </div>
                  </div>
                </div>

                {/* Documents Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                   <div className="flex items-center space-x-2 mb-6 border-b border-gray-50 pb-4">
                    <CreditCard className="w-5 h-5 text-[#002f5c]" />
                    <h3 className="font-bold text-gray-800">Documentação Detalhada</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">RG</label>
                      <input type="text" className="w-full p-2 bg-gray-50 border rounded-lg text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">ÓRGÃO EXPEDITOR</label>
                      <input type="text" className="w-full p-2 bg-gray-50 border rounded-lg text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">CTPS (Nº/SÉRIE)</label>
                      <input type="text" className="w-full p-2 bg-gray-50 border rounded-lg text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">PIS / PASEP</label>
                      <input type="text" className="w-full p-2 bg-gray-50 border rounded-lg text-sm" />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">TÍTULO DE ELEITOR (ZONA/SEÇÃO)</label>
                      <input type="text" className="w-full p-2 bg-gray-50 border rounded-lg text-sm" />
                    </div>
                  </div>
                </div>

                {/* Banking & Benefits Detail Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                   <div className="flex items-center space-x-2 mb-6 border-b border-gray-50 pb-4">
                    <Heart className="w-5 h-5 text-[#002f5c]" />
                    <h3 className="font-bold text-gray-800">Dados Bancários e Outros</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">BANCO</label>
                      <input type="text" className="w-full p-2 bg-gray-50 border rounded-lg text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">AGÊNCIA / CONTA</label>
                      <input type="text" className="w-full p-2 bg-gray-50 border rounded-lg text-sm" />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">PIX (CHAVE)</label>
                      <input type="text" className="w-full p-2 bg-gray-50 border rounded-lg text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">VALE TRANSPORTE?</label>
                      <div className="flex space-x-4 mt-2">
                        <label className="flex items-center text-sm"><input type="radio" name="vt" className="mr-2" /> Sim</label>
                        <label className="flex items-center text-sm"><input type="radio" name="vt" className="mr-2" /> Não</label>
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
           <p className="text-[10px] opacity-70 uppercase font-bold">Custo Total Est.</p>
           <p className="text-lg font-bold">R$ {totalCusto.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
         </div>
         <button 
           onClick={handleSave}
           className="bg-[#2c9644] px-4 py-2 rounded-lg font-bold text-sm"
         >
           Salvar
         </button>
      </div>
    </div>
  );
}
