import React, { useState } from "react";
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  ArrowRightLeft, 
  Building, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Coins, 
  ShieldAlert, 
  FileSpreadsheet, 
  BarChart3, 
  Package, 
  Clock 
} from "lucide-react";
import { StockMovement, StockItem, Warehouse } from "../types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";

interface ReportsViewProps {
  movements: StockMovement[];
  items: StockItem[];
  warehouses: Warehouse[];
}

export default function ReportsView({ movements, items, warehouses }: ReportsViewProps) {
  const logoImage = localStorage.getItem("vbsp_logoImage") || "";
  const systemName = localStorage.getItem("vbsp_systemName") || "AMADJE - COMERCIO GERAL";
  const logoText = localStorage.getItem("vbsp_logoText") || "A";

  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("2026-07-05");
  const [activeReportTab, setActiveReportTab] = useState<"daily" | "monthly" | "alerts">("daily");

  // Filter helper
  const filterByStore = (m: StockMovement) => {
    if (selectedStore === "all") return true;
    if (m.type === "entrada") return m.toWarehouse === selectedStore;
    if (m.type === "saida") return m.fromWarehouse === selectedStore;
    if (m.type === "transferencia") return m.fromWarehouse === selectedStore || m.toWarehouse === selectedStore;
    return true;
  };

  // --- 1. DAILY REPORT CALCS ---
  const dailyMovements = movements.filter(m => {
    const isSameDay = m.date.startsWith(selectedDate);
    return isSameDay && filterByStore(m);
  });

  const dailyEntradas = dailyMovements.filter(m => m.type === "entrada");
  const dailySaidas = dailyMovements.filter(m => m.type === "saida");
  const dailyTransferencias = dailyMovements.filter(m => m.type === "transferencia");

  const totalDailyEnteredQty = dailyEntradas.reduce((sum, m) => sum + m.quantity, 0);
  const totalDailyExitedQty = dailySaidas.reduce((sum, m) => sum + m.quantity, 0);
  const dailyBalance = totalDailyEnteredQty - totalDailyExitedQty;

  // --- 2. MONTHLY REPORT CALCS ---
  // Let's filter movements for July 2026 (the current month of our system context)
  const monthlyMovements = movements.filter(m => m.date.startsWith("2026-07") && filterByStore(m));
  
  // Group movements by product to find most active products
  const productActivityMap: { [sku: string]: { name: string, entered: number, exited: number, total: number } } = {};
  monthlyMovements.forEach(m => {
    if (!productActivityMap[m.sku]) {
      productActivityMap[m.sku] = { name: m.itemName, entered: 0, exited: 0, total: 0 };
    }
    if (m.type === "entrada") {
      productActivityMap[m.sku].entered += m.quantity;
    } else if (m.type === "saida") {
      productActivityMap[m.sku].exited += m.quantity;
    } else if (m.type === "transferencia") {
      productActivityMap[m.sku].entered += m.quantity;
      productActivityMap[m.sku].exited += m.quantity;
    }
    productActivityMap[m.sku].total += m.quantity;
  });

  const topActiveProducts = Object.values(productActivityMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Group by movement type for Recharts
  const monthlyTypeData = [
    { name: "Entradas", quantidade: monthlyMovements.filter(m => m.type === "entrada").reduce((sum, m) => sum + m.quantity, 0) },
    { name: "Saídas", quantidade: monthlyMovements.filter(m => m.type === "saida").reduce((sum, m) => sum + m.quantity, 0) },
    { name: "Transferências", quantidade: monthlyMovements.filter(m => m.type === "transferencia").reduce((sum, m) => sum + m.quantity, 0) },
  ];

  // --- 3. SUSPICIOUS & STOCK ALERTS ---
  // Suspect condition 1: Out of business hours (before 08:00 or after 19:00)
  // Suspect condition 2: Very high quantity movement (> 100 units at once)
  // Suspect condition 3: Stock item is completely out of stock or critical
  const suspiciousMovements = movements.filter(m => {
    const isSuspectQty = m.quantity > 100;
    
    // Parse hour from date "YYYY-MM-DD HH:mm"
    let isSuspectHour = false;
    const timePart = m.date.split(" ")[1];
    if (timePart) {
      const hour = parseInt(timePart.split(":")[0]);
      if (hour < 8 || hour >= 19) {
        isSuspectHour = true;
      }
    }

    return isSuspectQty || isSuspectHour;
  }).filter(filterByStore);

  const criticalItems = items.filter(item => {
    const belongsToSelectedStore = selectedStore === "all" || item.warehouse === selectedStore;
    return belongsToSelectedStore && (item.currentStock <= item.minStock);
  });

  // Handle Export / Download effect
  const [exporting, setExporting] = useState<boolean>(false);
  const handleExportPDF = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      window.print();
    }, 400);
  };

  const COLORS = ["#10b981", "#ef4444", "#3b82f6"];

  return (
    <>
      <style>{`
        @media screen {
          .print-only {
            display: none !important;
          }
        }
        @media print {
          .screen-only {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          body {
            background: white !important;
            color: black !important;
            font-family: 'Inter', sans-serif !important;
          }
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            padding: 20px !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-top: 15px !important;
            margin-bottom: 25px !important;
          }
          th, td {
            border: 1px solid #e2e8f0 !important;
            padding: 8px 10px !important;
            text-align: left !important;
            font-size: 11px !important;
            color: #1e293b !important;
          }
          th {
            background-color: #f8fafc !important;
            font-weight: bold !important;
            color: #0f172a !important;
          }
          .badge {
            display: inline-block !important;
            padding: 2px 6px !important;
            font-size: 9px !important;
            font-weight: bold !important;
            border-radius: 4px !important;
            text-transform: uppercase !important;
          }
          .badge-entrada {
            background-color: #d1fae5 !important;
            color: #065f46 !important;
            border: 1px solid #a7f3d0 !important;
          }
          .badge-saida {
            background-color: #fee2e2 !important;
            color: #991b1b !important;
            border: 1px solid #fecaca !important;
          }
          .badge-transfer {
            background-color: #dbeafe !important;
            color: #1e40af !important;
            border: 1px solid #bfdbfe !important;
          }
        }
      `}</style>

      <div className="space-y-6 screen-only">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-white">
            Relatórios Operacionais & Alertas Multi-Loja
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhe o balanço diário de entradas e saídas por estabelecimento e detete anomalias logísticas.
          </p>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-2 screen-only">
          {/* Store selector */}
          <div className="flex items-center space-x-1 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border px-2.5 py-1.5 rounded-lg text-xs shadow-xs">
            <Building size={14} className="text-slate-400" />
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-white outline-hidden font-semibold animate-none"
            >
              <option value="all">Todas as Lojas</option>
              {warehouses.map(wh => (
                <option key={wh.id} value={wh.name}>{wh.name.split(" (")[0]}</option>
              ))}
            </select>
          </div>

          {/* Date Picker (only relevant for daily report) */}
          {activeReportTab === "daily" && (
            <div className="flex items-center space-x-1.5 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border px-2.5 py-1.5 rounded-lg text-xs shadow-xs">
              <Calendar size={14} className="text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-white font-mono font-semibold outline-hidden"
              />
            </div>
          )}

          {/* Export button */}
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download size={14} />
            <span>{exporting ? "A Preparar..." : "Exportar PDF"}</span>
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveReportTab("daily")}
          className={`pb-3 text-xs font-bold uppercase tracking-wider relative transition-colors ${
            activeReportTab === "daily"
              ? "text-brand-500 dark:text-brand-400 border-b-2 border-brand-500"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          📘 Relatório Diário
        </button>
        <button
          onClick={() => setActiveReportTab("monthly")}
          className={`pb-3 text-xs font-bold uppercase tracking-wider relative transition-colors ${
            activeReportTab === "monthly"
              ? "text-brand-500 dark:text-brand-400 border-b-2 border-brand-500"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          📗 Relatório Mensal (Julho 2026)
        </button>
        <button
          onClick={() => setActiveReportTab("alerts")}
          className={`pb-3 text-xs font-bold uppercase tracking-wider relative transition-colors flex items-center gap-1.5 ${
            activeReportTab === "alerts"
              ? "text-red-500 border-b-2 border-red-500"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          ⚠️ Alertas ({criticalItems.length + suspiciousMovements.length})
        </button>
      </div>

      {/* VIEW RENDERINGS */}

      {/* Tab 1: DAILY REPORT */}
      {activeReportTab === "daily" && (
        <div className="space-y-6">
          {/* Quick Stats Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-dark-surface p-5 rounded-xl border border-slate-200 dark:border-dark-border shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                  <TrendingUp size={11} className="text-emerald-500" />
                  Entradas do Dia
                </span>
                <div className="font-mono text-xl font-bold text-slate-900 dark:text-white">
                  +{totalDailyEnteredQty.toLocaleString()} <span className="text-xs font-normal text-slate-400">UN</span>
                </div>
                <p className="text-[9px] text-slate-400 font-sans">{dailyEntradas.length} guias processadas</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl">
                <TrendingUp size={22} />
              </div>
            </div>

            <div className="bg-white dark:bg-dark-surface p-5 rounded-xl border border-slate-200 dark:border-dark-border shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                  <TrendingDown size={11} className="text-red-500" />
                  Saídas do Dia
                </span>
                <div className="font-mono text-xl font-bold text-slate-900 dark:text-white">
                  -{totalDailyExitedQty.toLocaleString()} <span className="text-xs font-normal text-slate-400">UN</span>
                </div>
                <p className="text-[9px] text-slate-400 font-sans">{dailySaidas.length} saídas efetuadas</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-xl">
                <TrendingDown size={22} />
              </div>
            </div>

            <div className="bg-white dark:bg-dark-surface p-5 rounded-xl border border-slate-200 dark:border-dark-border shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Balanço Líquido</span>
                <div className={`font-mono text-xl font-bold ${dailyBalance >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {dailyBalance >= 0 ? "+" : ""}{dailyBalance.toLocaleString()} <span className="text-xs font-normal text-slate-400">UN</span>
                </div>
                <p className="text-[9px] text-slate-400 font-sans">Saldo físico cumulativo</p>
              </div>
              <div className={`p-3 rounded-xl ${dailyBalance >= 0 ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20" : "bg-red-50 text-red-600 dark:bg-red-950/20"}`}>
                <ArrowRightLeft size={22} />
              </div>
            </div>
          </div>

          {/* Table of the day's movements */}
          <div className="bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-display font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Log Detalhado das Movimentações de {selectedDate}
              </h3>
              <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded">
                {dailyMovements.length} Registos Encontrados
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/40 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-4">Hora</th>
                    <th className="py-2.5 px-4">Artigo</th>
                    <th className="py-2.5 px-4">Tipo</th>
                    <th className="py-2.5 px-4">Estabelecimento / Loja</th>
                    <th className="py-2.5 px-4 text-right">Qtd</th>
                    <th className="py-2.5 px-4">Documento</th>
                    <th className="py-2.5 px-4">Operador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-700 text-xs">
                  {dailyMovements.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-300">
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                        {m.date.split(" ")[1] || "00:00"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 dark:text-white">{m.itemName}</span>
                        <span className="block text-[9px] font-mono text-slate-400">SKU: {m.sku}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          m.type === "entrada" 
                            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600" 
                            : m.type === "saida" 
                            ? "bg-red-50 dark:bg-red-950/20 text-red-500" 
                            : "bg-blue-50 dark:bg-blue-950/20 text-blue-500"
                        }`}>
                          {m.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {m.type === "entrada" && `📥 ${m.toWarehouse?.split(" (")[0]}`}
                        {m.type === "saida" && `📤 ${m.fromWarehouse?.split(" (")[0]}`}
                        {m.type === "transferencia" && `🔁 ${m.fromWarehouse?.split(" (")[0]} ➔ ${m.toWarehouse?.split(" (")[0]}`}
                      </td>
                      <td className={`py-3 px-4 text-right font-mono font-bold ${
                        m.type === "entrada" ? "text-emerald-600" : m.type === "saida" ? "text-red-500" : "text-blue-500"
                      }`}>
                        {m.type === "entrada" ? "+" : m.type === "saida" ? "-" : ""}{m.quantity}
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-500">
                        {m.reference}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {m.user}
                      </td>
                    </tr>
                  ))}
                  {dailyMovements.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-sans">
                        <Clock size={28} className="mx-auto mb-2 text-slate-300" />
                        <p className="text-xs">Nenhum movimento registado para esta data.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: MONTHLY REPORT */}
      {activeReportTab === "monthly" && (
        <div className="space-y-6">
          {/* Charts and rankings columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Recharts Activity bar */}
            <div className="bg-white dark:bg-dark-surface p-5 rounded-xl border border-slate-200 dark:border-dark-border shadow-xs space-y-4">
              <h3 className="text-xs font-display font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Volume Mensal por Tipo de Operação (Julho 2026)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTypeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip cursor={{ fill: "rgba(148, 163, 184, 0.05)" }} />
                    <Bar dataKey="quantidade" radius={[4, 4, 0, 0]}>
                      {monthlyTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top products moving */}
            <div className="bg-white dark:bg-dark-surface p-5 rounded-xl border border-slate-200 dark:border-dark-border shadow-xs space-y-4">
              <h3 className="text-xs font-display font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Ranking de Produtos Mais Movimentados (UN)
              </h3>
              <div className="space-y-3">
                {topActiveProducts.map((p, i) => {
                  const maxVal = Math.max(...topActiveProducts.map(x => x.total));
                  const percentage = Math.round((p.total / maxVal) * 100);

                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[250px]">
                          {i + 1}. {p.name}
                        </span>
                        <span className="font-mono text-slate-500 font-bold">
                          {p.total} <span className="text-[10px] text-slate-400 font-normal">UN</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-brand-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 w-10 text-right">
                          +{p.entered} / -{p.exited}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {topActiveProducts.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-10">Nenhum registo mensal encontrado.</p>
                )}
              </div>
            </div>

          </div>

          {/* Extra KPI summary table for tax and money metrics */}
          <div className="bg-white dark:bg-dark-surface p-5 rounded-xl border border-slate-200 dark:border-dark-border shadow-xs">
            <h3 className="text-xs font-display font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4">
              Resumo Consolidado de Faturação e Impostos no Mês
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Média por Fatura</span>
                <span className="text-sm font-mono font-bold text-slate-800 dark:text-white">606,666 AOA</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Taxa IVA Angola</span>
                <span className="text-sm font-mono font-bold text-slate-800 dark:text-white">14.00% IVA</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Estabilidade Logística</span>
                <span className="text-sm font-semibold text-emerald-600">Alta (94.2%)</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Selo SAF-T Auditado</span>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1">
                  <CheckCircle size={12} /> AGT_AMADJE_2026
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: ALERTS & SUSPICIOUS OPERATIONS */}
      {activeReportTab === "alerts" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Critical stock items */}
          <div className="bg-white dark:bg-dark-surface p-5 rounded-xl border border-slate-200 dark:border-dark-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-display font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-amber-500" />
                Ruturas e Stock Baixo ({criticalItems.length})
              </h3>
              <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2 py-0.5 rounded uppercase">
                Ação Requerida
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {criticalItems.map(item => {
                const isOut = item.currentStock === 0;

                return (
                  <div 
                    key={item.id} 
                    className={`p-3 rounded-lg border text-xs flex justify-between items-center ${
                      isOut 
                        ? "bg-red-50/20 border-red-200 text-red-700 dark:border-red-950/40" 
                        : "bg-amber-50/20 border-amber-200 text-amber-700 dark:border-amber-950/40"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">SKU: {item.sku} | {item.warehouse.split(" (")[0]}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold">
                        {item.currentStock} {item.unit}
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono">
                        Mínimo: {item.minStock} {item.unit}
                      </div>
                    </div>
                  </div>
                );
              })}
              {criticalItems.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-12">Nenhum artigo em rutura ou com stock baixo!</p>
              )}
            </div>
          </div>

          {/* Suspicious movements logging */}
          <div className="bg-white dark:bg-dark-surface p-5 rounded-xl border border-slate-200 dark:border-dark-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-display font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-red-500" />
                Movimentações Não Usuais / Suspeitas ({suspiciousMovements.length})
              </h3>
              <span className="text-[9px] bg-red-50 text-red-700 border border-red-200 font-bold px-2 py-0.5 rounded uppercase">
                Análise de Risco
              </span>
            </div>

            <p className="text-[10px] text-slate-500">
              O sistema sinaliza automaticamente movimentações que excedam as 100 unidades em simultâneo ou que tenham sido executadas fora do horário comercial regular (08:00 - 19:00).
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {suspiciousMovements.map(m => {
                const hour = parseInt((m.date.split(" ")[1] || "").split(":")[0]);
                const isLate = hour < 8 || hour >= 19;
                const isHeavy = m.quantity > 100;

                return (
                  <div key={m.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">{m.itemName}</div>
                        <div className="text-[10px] text-slate-400">Operador: {m.user}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Ref: {m.reference} | {m.date}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-red-600 block">
                          {m.type === "entrada" ? "+" : "-"}{m.quantity} UN
                        </span>
                        <span className="text-[9px] text-slate-400 italic block">
                          {m.type}
                        </span>
                      </div>
                    </div>

                    {/* Reasons list */}
                    <div className="mt-2 flex flex-wrap gap-1.5 pt-2 border-t border-slate-150 dark:border-slate-700">
                      {isHeavy && (
                        <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Package size={10} /> Volume Alto (&gt;100)
                        </span>
                      )}
                      {isLate && (
                        <span className="text-[9px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Clock size={10} /> Horário Noturno ({m.date.split(" ")[1]})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {suspiciousMovements.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-12">Nenhuma atividade fora do padrão sinalizada hoje.</p>
              )}
            </div>
          </div>

        </div>
      )}
      </div>

      {/* PRINT-ONLY EXECUTIVE FORMAL REPORT CONTAINER */}
      <div className="print-only print-container">
        {/* Header letterhead */}
        <div className="flex justify-between items-center border-b-2 border-slate-900 pb-5 mb-6" style={{ contentVisibility: "auto" }}>
          <div className="flex items-center gap-4">
            {logoImage ? (
              <img src={logoImage} alt="Logo" className="w-14 h-14 object-cover rounded-lg border border-slate-300 animate-fade-in" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-14 h-14 bg-slate-900 rounded-lg flex items-center justify-center font-display font-black text-xl text-white">
                {logoText}
              </div>
            )}
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 uppercase leading-snug">{systemName}</h1>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">AMADJE ERP - RELATÓRIO OPERACIONAL</p>
              <p className="text-[9px] text-slate-400 font-medium">SISTEMA INTEGRADO DE GESTÃO DE STOCK E LOGÍSTICA</p>
            </div>
          </div>
          <div className="text-right text-xs">
            <p className="font-bold text-slate-900">DATA DE EMISSÃO: {selectedDate}</p>
            <p className="text-slate-500 text-[10px]">LOJA / FILIAL: {selectedStore === "all" ? "TODAS AS FILIAIS" : selectedStore.toUpperCase()}</p>
          </div>
        </div>

        {/* Tab 1 content inside print-only */}
        {activeReportTab === "daily" && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase border-b border-slate-300 pb-1.5">RELATÓRIO DIÁRIO DE MOVIMENTO</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="border border-slate-200 p-3 rounded">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Entradas do Dia</span>
                <span className="font-mono text-sm font-bold text-slate-900">+{totalDailyEnteredQty} UN</span>
              </div>
              <div className="border border-slate-200 p-3 rounded">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Saídas do Dia</span>
                <span className="font-mono text-sm font-bold text-slate-900">-{totalDailyExitedQty} UN</span>
              </div>
              <div className="border border-slate-200 p-3 rounded">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Balanço Líquido</span>
                <span className={`font-mono text-sm font-bold ${dailyBalance >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                  {dailyBalance >= 0 ? "+" : ""}{dailyBalance} UN
                </span>
              </div>
            </div>

            <h3 className="text-xs font-bold uppercase mt-4">Lista de Movimentações Processadas</h3>
            {dailyMovements.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">Nenhum movimento registado neste dia.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Tipo</th>
                    <th>Referência</th>
                    <th>Artigo</th>
                    <th>SKU</th>
                    <th>Qtd</th>
                    <th>Operador</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyMovements.map(m => (
                    <tr key={m.id}>
                      <td className="font-mono">{m.date}</td>
                      <td>
                        <span className={`badge ${m.type === "entrada" ? "badge-entrada" : m.type === "saida" ? "badge-saida" : "badge-transfer"}`}>
                          {m.type}
                        </span>
                      </td>
                      <td className="font-mono">{m.reference}</td>
                      <td>{m.itemName}</td>
                      <td className="font-mono">{m.sku}</td>
                      <td className="font-mono font-bold">{m.quantity}</td>
                      <td>{m.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2 content inside print-only */}
        {activeReportTab === "monthly" && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase border-b border-slate-300 pb-1.5">RELATÓRIO MENSAL - JULHO 2026</h2>
            
            <h3 className="text-xs font-bold uppercase mt-4">Top 5 Artigos Mais Ativos</h3>
            <table>
              <thead>
                <tr>
                  <th>Nome do Artigo</th>
                  <th>Total Movimentado</th>
                  <th>Entradas</th>
                  <th>Saídas</th>
                </tr>
              </thead>
              <tbody>
                {topActiveProducts.map(p => (
                  <tr key={p.name}>
                    <td className="font-bold">{p.name}</td>
                    <td className="font-mono font-bold">{p.total} UN</td>
                    <td className="font-mono text-emerald-700">+{p.entered}</td>
                    <td className="font-mono text-red-700">-{p.exited}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 className="text-xs font-bold uppercase mt-4">Distribuição por Categoria de Movimento</h3>
            <table>
              <thead>
                <tr>
                  <th>Categoria de Movimento</th>
                  <th>Volume Registado</th>
                </tr>
              </thead>
              <tbody>
                {monthlyTypeData.map(d => (
                  <tr key={d.name}>
                    <td>{d.name}</td>
                    <td className="font-mono font-bold">{d.quantidade} UN</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3 content inside print-only */}
        {activeReportTab === "alerts" && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase border-b border-slate-300 pb-1.5">SINALIZAÇÕES E ALERTAS DE INVENTÁRIO</h2>
            
            <h3 className="text-xs font-bold uppercase text-red-700 mt-4">Ruturas de Stock e Níveis Críticos ({criticalItems.length})</h3>
            {criticalItems.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">Nenhuma rutura sinalizada para a seleção atual.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Artigo</th>
                    <th>SKU</th>
                    <th>Localização / Filial</th>
                    <th>Stock Atual</th>
                    <th>Mínimo Exigido</th>
                  </tr>
                </thead>
                <tbody>
                  {criticalItems.map(item => (
                    <tr key={item.id}>
                      <td className="font-bold">{item.name}</td>
                      <td className="font-mono">{item.sku}</td>
                      <td>{item.warehouse}</td>
                      <td className="font-mono font-bold text-red-600">{item.currentStock} {item.unit}</td>
                      <td className="font-mono">{item.minStock} {item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <h3 className="text-xs font-bold uppercase text-amber-700 mt-4">Movimentações Não Usuais Detectadas ({suspiciousMovements.length})</h3>
            {suspiciousMovements.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">Nenhuma atividade anormal detetada no período.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Artigo</th>
                    <th>Referência</th>
                    <th>Tipo</th>
                    <th>Quantidade</th>
                    <th>Operador</th>
                  </tr>
                </thead>
                <tbody>
                  {suspiciousMovements.map(m => (
                    <tr key={m.id}>
                      <td className="font-mono">{m.date}</td>
                      <td className="font-bold">{m.itemName}</td>
                      <td className="font-mono">{m.reference}</td>
                      <td className="uppercase font-semibold">{m.type}</td>
                      <td className="font-mono font-bold text-red-600">{m.quantity}</td>
                      <td>{m.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Footer for print */}
        <div className="mt-12 pt-5 border-t border-slate-300 text-center text-[9px] text-slate-400">
          <p>Relatório oficial emitido pelo sistema de gestão de armazéns AMADJE ERP. Todos os logs estão encriptados e auditáveis legalmente pela AGT.</p>
          <p className="mt-1 font-bold">Assinatura Eletrónica do Auditor: AGT_AMADJE_COMPLIANCE_KEY_2026</p>
        </div>
      </div>
    </>
  );
}
