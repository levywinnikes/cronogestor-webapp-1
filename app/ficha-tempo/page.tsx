"use client";

import React, { useState, useMemo } from "react";
import { 
  Clock, 
  Calendar, 
  Users, 
  Briefcase, 
  Plus, 
  Trash2, 
  Save, 
  Calculator,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Moon,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { timeSheetService, TimeEntryRecord, DayCostBreakdown } from "../services/time-sheet.service";

// Mock Data for Demo
const MOCK_PROJECTS = [
  { id: 1, name: "Edifício Ocean View", extraMonthlyValue: 100 },
  { id: 2, name: "Shopping Santa Luzia", extraMonthlyValue: 0 },
];

const MOCK_EMPLOYEES = [
  { id: 1, nome: "João Silva", cargo: "Pedreiro", salario: 3000, horasPorDia: 8, encargos: 50, overtime50: 50, overtime100: 100, nightShift: 20, saturdayRate: 50 },
  { id: 2, nome: "Maria Oliveira", cargo: "Servente", salario: 2000, horasPorDia: 8, encargos: 50, overtime50: 50, overtime100: 100, nightShift: 20, saturdayRate: 50 },
];

export default function TimeSheetPage() {
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState<number>(MOCK_PROJECTS[0].id);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(MOCK_EMPLOYEES[0].id);
  const [entries, setEntries] = useState<TimeEntryRecord[]>([
    { id: '1', employeeId: 1, projectId: 1, date: new Date().toISOString().split('T')[0], startTime: "08:00", endTime: "17:00", breakDurationMinutes: 60 }
  ]);

  const selectedProject = MOCK_PROJECTS.find(p => p.id === selectedProjectId);
  const selectedEmployee = MOCK_EMPLOYEES.find(e => e.id === selectedEmployeeId);

  const calculatedEntries = useMemo(() => {
    if (!selectedEmployee) return [];
    return entries.map(entry => ({
      ...entry,
      breakdown: timeSheetService.calculateDayCost(entry, selectedEmployee, selectedProject)
    }));
  }, [entries, selectedEmployee, selectedProject]);

  const stats = useMemo(() => {
    return calculatedEntries.reduce((acc, curr) => ({
      totalHours: acc.totalHours + curr.breakdown.totalHours,
      totalCost: acc.totalCost + curr.breakdown.calculatedCost,
      totalOT: acc.totalOT + curr.breakdown.overtime50 + curr.breakdown.overtime100,
      totalNight: acc.totalNight + curr.breakdown.nightShiftHours
    }), { totalHours: 0, totalCost: 0, totalOT: 0, totalNight: 0 });
  }, [calculatedEntries]);

  const handleAddEntry = () => {
    const lastEntry = entries[entries.length - 1];
    const nextDate = lastEntry 
        ? new Date(new Date(lastEntry.date).getTime() + 86400000).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
        
    setEntries([...entries, {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: selectedEmployeeId,
      projectId: selectedProjectId,
      date: nextDate,
      startTime: "08:00",
      endTime: "17:00",
      breakDurationMinutes: 60
    }]);
  };

  const handleUpdateEntry = (id: string, field: keyof TimeEntryRecord, value: any) => {
    setEntries(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleRemoveEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans mb-20 md:mb-0">
      
      {/* Top Header */}
      <Header />

      {/* Action Sub-header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
         <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center text-gray-800">
               <Clock className="h-6 w-6 mr-2 text-[#002f5c]" />
               <h2 className="text-2xl font-bold">Lançamento de Ficha Tempo</h2>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-bold transition flex items-center shadow-sm"
              >
                Exportar PDF
              </button>
              <button 
                className="px-6 py-2.5 bg-[#002f5c] hover:bg-[#001f3f] text-white rounded-lg text-sm font-bold shadow-md transition flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Fechar Ficha
              </button>
            </div>
         </div>
      </div>

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left Side: Context Selectors & Stats */}
        <div className="xl:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Projeto Alvo</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select 
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-[#002f5c]/20 transition"
                            >
                                {MOCK_PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Colaborador</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select 
                                value={selectedEmployeeId}
                                onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-[#002f5c]/20 transition"
                            >
                                {MOCK_EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase">Resumo da Ficha</span>
                        <div className="px-2 py-0.5 bg-green-50 text-[#2c9644] rounded text-[10px] font-bold border border-green-200 animate-pulse">LIVE</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Horas Totais</p>
                            <p className="text-xl font-bold text-gray-900">{stats.totalHours.toFixed(1)}h</p>
                        </div>
                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Extras (OT)</p>
                            <p className="text-xl font-bold text-orange-600">{stats.totalOT.toFixed(1)}h</p>
                        </div>
                    </div>

                    <div className="p-5 bg-gradient-to-br from-[#002f5c] to-[#001f3f] rounded-2xl text-white shadow-lg">
                        <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1.5">Custo Estimado</p>
                        <p className="text-3xl font-black">{formatCurrency(stats.totalCost)}</p>
                        <div className="mt-3 flex items-center text-[10px] font-medium text-[#4ade80]">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            <span>Incluindo encargos e extras</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-amber-800 leading-relaxed">
                    Certifique-se de que o intervalo de descanso está correto para evitar cálculos de hora extra indevidos.
                </p>
            </div>
        </div>

        {/* Right Side: Entry Table */}
        <div className="xl:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h3 className="font-bold text-gray-900 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-[#002f5c]" />
                        Registros Diários
                    </h3>
                    <button 
                        onClick={handleAddEntry}
                        className="p-1.5 bg-[#2c9644] text-white rounded-md hover:bg-[#237c37] transition shadow-sm"
                        title="Adicionar Dia"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest w-40">Data</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Entrada / Saída</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Intervalo</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest min-w-[200px]">Breakdown (h)</th>
                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Custo Dia</th>
                                <th className="px-5 py-3 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {calculatedEntries.map((entry) => (
                                <tr key={entry.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-5 py-3">
                                        <input 
                                            type="date" 
                                            value={entry.date}
                                            onChange={(e) => handleUpdateEntry(entry.id, 'date', e.target.value)}
                                            className="bg-transparent border border-transparent hover:border-gray-200 rounded p-1 text-sm font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#002f5c]/20 w-32 transition"
                                        />
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="time" 
                                                value={entry.startTime}
                                                onChange={(e) => handleUpdateEntry(entry.id, 'startTime', e.target.value)}
                                                className="bg-gray-50 border border-gray-200 rounded-md p-1.5 text-xs font-bold w-[76px] focus:bg-white focus:outline-none transition"
                                            />
                                            <ArrowRight className="w-3 h-3 text-gray-400" />
                                            <input 
                                                type="time" 
                                                value={entry.endTime}
                                                onChange={(e) => handleUpdateEntry(entry.id, 'endTime', e.target.value)}
                                                className="bg-gray-50 border border-gray-200 rounded-md p-1.5 text-xs font-bold w-[76px] focus:bg-white focus:outline-none transition"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-1">
                                            <input 
                                                type="number" 
                                                value={entry.breakDurationMinutes}
                                                onChange={(e) => handleUpdateEntry(entry.id, 'breakDurationMinutes', Number(e.target.value))}
                                                className="bg-gray-50 border border-gray-200 rounded-md p-1.5 text-xs font-bold w-16 text-center focus:bg-white focus:outline-none transition"
                                            />
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">min</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex gap-2 flex-wrap">
                                            <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-100">
                                                N: {entry.breakdown.normalHours.toFixed(1)}
                                            </div>
                                            {entry.breakdown.overtime50 > 0 && (
                                                <div className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-[10px] font-bold border border-amber-100">
                                                    50%: {entry.breakdown.overtime50.toFixed(1)}
                                                </div>
                                            )}
                                            {entry.breakdown.overtime100 > 0 && (
                                                <div className="px-2 py-1 bg-red-50 text-red-700 rounded text-[10px] font-bold border border-red-100">
                                                    100%: {entry.breakdown.overtime100.toFixed(1)}
                                                </div>
                                            )}
                                            {entry.breakdown.nightShiftHours > 0 && (
                                                <div className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-[10px] font-bold border border-purple-100 flex items-center gap-1">
                                                    <Moon className="w-2.5 h-2.5" /> {entry.breakdown.nightShiftHours.toFixed(1)}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <p className="text-sm font-bold text-gray-900">{formatCurrency(entry.breakdown.calculatedCost)}</p>
                                        <p className="text-[10px] font-medium text-gray-500">Total {entry.breakdown.totalHours.toFixed(1)}h</p>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <button 
                                            onClick={() => handleRemoveEntry(entry.id)}
                                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors group-hover:opacity-100 md:opacity-0"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {entries.length === 0 && (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-300">
                            <Calculator className="w-12 h-12 mb-3 opacity-30" />
                            <p className="text-sm font-bold opacity-60 uppercase tracking-widest">Nenhum registro lançado</p>
                        </div>
                    )}
                </div>
                
                <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex gap-8">
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Carga Horária</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-gray-900">{stats.totalHours.toFixed(1)}</span>
                                <span className="text-xs font-semibold text-gray-500">horas</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Média por Dia</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-gray-900">{(entries.length > 0 ? stats.totalHours / entries.length : 0).toFixed(1)}</span>
                                <span className="text-xs font-semibold text-gray-500">h/dia</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Total da Ficha</p>
                        <p className="text-2xl font-black text-[#2c9644]">{formatCurrency(stats.totalCost)}</p>
                    </div>
                </div>
            </div>
        </div>

      </main>

      {/* Mobile Footer for quick save */}
      <div className="sm:hidden bg-[#002f5c] text-white p-4 fixed bottom-0 w-full shadow-2xl flex justify-between items-center z-50">
         <div>
           <p className="text-[10px] opacity-70 uppercase font-bold">Custo Total</p>
           <p className="text-lg font-bold">{formatCurrency(stats.totalCost)}</p>
         </div>
         <button 
           className="bg-[#2c9644] px-4 py-2 rounded-lg font-bold text-sm"
         >
           Salvar
         </button>
      </div>

    </div>
  );
}
