import React, { useState } from "react";
import { 
  Package, 
  AlertTriangle, 
  Activity, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  MapPin, 
  CheckCircle2, 
  Clock,
  PlusCircle,
  ArrowRightLeft,
  FileText,
  Settings
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  AreaChart,
  Area
} from "recharts";
import { StockItem, StockMovement, AIAnalysisResult, Warehouse } from "../types";
import { motion } from "motion/react";

interface DashboardViewProps {
  items: StockItem[];
  movements: StockMovement[];
  warehouses: Warehouse[];
  onNavigate: (tab: string) => void;
  onRunAudit: () => void;
  aiResult: AIAnalysisResult;
}

export default function DashboardView({ 
  items, 
  movements, 
  warehouses,
  onNavigate, 
  onRunAudit, 
  aiResult 
}: DashboardViewProps) {
  // Compute analytics
  const totalStockUnits = items.reduce((sum, item) => sum + item.currentStock, 0);
  const totalStockValue = items.reduce((sum, item) => sum + (item.currentStock * item.price), 0);
  
  const criticalItemsCount = items.filter(
    item => item.status === "critico" || item.currentStock <= item.minStock
  ).length;
  
  const outOfStockCount = items.filter(item => item.currentStock === 0).length;

  // Generate the last 6 months labels and data dynamically for Trend analysis
  const trendData = (() => {
    const monthsList = [];
    const monthNames = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];
    
    const d = new Date();
    let currentYear = d.getFullYear();
    let currentMonth = d.getMonth();
    
    // Anchor to the latest movement date if it's in 2026/future
    if (movements && movements.length > 0) {
      movements.forEach(m => {
        const parts = m.date.split("-");
        if (parts.length >= 2) {
          const yr = parseInt(parts[0], 10);
          const mn = parseInt(parts[1], 10) - 1;
          if (!isNaN(yr) && !isNaN(mn)) {
            if (yr > currentYear || (yr === currentYear && mn > currentMonth)) {
              currentYear = yr;
              currentMonth = mn;
            }
          }
        }
      });
    }

    for (let i = 5; i >= 0; i--) {
      let m = currentMonth - i;
      let y = currentYear;
      if (m < 0) {
        m += 12;
        y -= 1;
      }
      monthsList.push({
        name: `${monthNames[m]} ${y}`,
        monthKey: `${y}-${String(m + 1).padStart(2, "0")}`,
        Entradas: 0,
        Saidas: 0
      });
    }

    // Fill in quantities from movements
    if (movements) {
      movements.forEach(m => {
        const prefix = m.date.substring(0, 7); // "YYYY-MM"
        const matched = monthsList.find(t => t.monthKey === prefix);
        if (matched) {
          if (m.type === "entrada") {
            matched.Entradas += m.quantity;
          } else if (m.type === "saida") {
            matched.Saidas += m.quantity;
          }
        }
      });
    }

    return monthsList;
  })();

  const todayStr = new Date().toISOString().split("T")[0];
  const todayMovements = movements.filter(m => m.date.startsWith(todayStr));
  const todayCount = todayMovements.length;

  // For each warehouse, calculate comparative and performance indicators
  const storePerformanceData = (warehouses || []).map(wh => {
    // Get items alocated to this warehouse/store
    const whItems = items.filter(
      item => item.warehouse.toLowerCase().includes(wh.name.split(" (")[0].toLowerCase())
    );
    
    // Get movements for this store
    const whMovements = movements.filter(m => {
      const fromMatch = m.fromWarehouse && m.fromWarehouse.toLowerCase().includes(wh.name.split(" (")[0].toLowerCase());
      const toMatch = m.toWarehouse && m.toWarehouse.toLowerCase().includes(wh.name.split(" (")[0].toLowerCase());
      return fromMatch || toMatch;
    });

    const totalQty = whItems.reduce((sum, item) => sum + item.currentStock, 0);
    const totalVal = whItems.reduce((sum, item) => sum + (item.currentStock * item.price), 0);
    const criticalItems = whItems.filter(item => item.currentStock <= item.minStock).length;
    
    // Health score: percent of items that are NOT critical (or out of stock)
    const healthScore = whItems.length > 0 
      ? Math.round(((whItems.length - criticalItems) / whItems.length) * 100) 
      : 100;

    return {
      id: wh.id,
      name: wh.name.replace("Loja ", "").split(" (")[0], // e.g. "Central", "Luanda", "Benguela", "Lobito"
      fullName: wh.name,
      location: wh.location,
      totalQty,
      totalVal,
      totalValK: Math.round(totalVal / 1000), // in thousands of Kwanzas (mKz)
      criticalItems,
      healthScore,
      movementsCount: whMovements.length,
      manager: wh.manager
    };
  });

  // Recharts Chart 1: Stock levels by Warehouse
  const stockByWarehouseData = items.reduce((acc: { name: string; Qtd: number; Valor: number }[], item) => {
    const existing = acc.find(x => x.name === item.warehouse);
    if (existing) {
      existing.Qtd += item.currentStock;
      existing.Valor += item.currentStock * item.price;
    } else {
      acc.push({ 
        name: item.warehouse.split(" (")[0], // Shorten name
        Qtd: item.currentStock, 
        Valor: Math.round((item.currentStock * item.price) / 1000) // Value in K-Kwanza (thousands)
      });
    }
    return acc;
  }, []);

  // Recharts Chart 2: Entries vs Exits this month
  const totalEntries = movements.filter(m => m.type === "entrada").reduce((sum, m) => sum + m.quantity, 0);
  const totalExits = movements.filter(m => m.type === "saida").reduce((sum, m) => sum + m.quantity, 0);
  const totalTransfers = movements.filter(m => m.type === "transferencia").reduce((sum, m) => sum + m.quantity, 0);

  const pieData = [
    { name: "Entradas", value: totalEntries || 1, color: "#10b981" },
    { name: "Saídas", value: totalExits || 1, color: "#ef4444" },
    { name: "Transferências", value: totalTransfers || 1, color: "#3b82f6" }
  ];

  const COLORS = ["#10b981", "#ef4444", "#3b82f6"];

  return (
    <div className="space-y-6">
      {/* Header and Welcome */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight text-slate-900 dark:text-white">
            Painel Geral de Controlo
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Visão integrada do inventário, armazéns e atividade logística em tempo real.
          </p>
        </div>
        <div className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-1.5 px-3 rounded-md border border-slate-200 dark:border-slate-700 self-start md:self-auto">
          SISTEMA AGT-COMPLIANT | REFS: SAF-T AO 2026
        </div>
      </div>

      {/* Main Stats Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Stock */}
        <div className="bg-white dark:bg-dark-surface p-5 rounded-xl border-l-4 border-l-brand-500 border border-slate-100 dark:border-dark-border shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-brand-500/5 dark:text-brand-400/5 group-hover:scale-110 transition-transform">
            <Package size={80} className="stroke-[1.5]" />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
              <span className="p-1.5 bg-brand-50 dark:bg-brand-950/40 text-brand-500 rounded-lg">
                <Package size={14} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Unidades em Stock</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-display font-black text-slate-900 dark:text-white">
                {totalStockUnits.toLocaleString()}
              </span>
              <span className="text-xs font-mono font-bold text-brand-500">UN</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Valor total estimado: <span className="font-semibold text-slate-700 dark:text-slate-200">{totalStockValue.toLocaleString()} AOA</span>
            </div>
          </div>
        </div>

        {/* Stat 2: Critical Stock Alerts */}
        <div className="bg-white dark:bg-dark-surface p-5 rounded-xl border-l-4 border-l-amber-500 border border-slate-100 dark:border-dark-border shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-amber-500/5 dark:text-amber-400/5 group-hover:scale-110 transition-transform">
            <AlertTriangle size={80} className="stroke-[1.5]" />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
              <span className="p-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-lg">
                <AlertTriangle size={14} className={criticalItemsCount > 0 ? "animate-pulse" : ""} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Níveis Críticos</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className={`text-3xl font-display font-black ${criticalItemsCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white"}`}>
                {criticalItemsCount}
              </span>
              <span className="text-xs text-slate-400">Artigos</span>
            </div>
            <div className="text-[10px] text-slate-400">
              {outOfStockCount > 0 ? (
                <span className="text-red-500 font-semibold">{outOfStockCount} artigos sem qualquer stock</span>
              ) : (
                "Todos os itens com stock mínimo ativo"
              )}
            </div>
          </div>
        </div>

        {/* Stat 3: Today's Movements */}
        <div className="bg-white dark:bg-dark-surface p-5 rounded-xl border-l-4 border-l-indigo-500 border border-slate-100 dark:border-dark-border shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-indigo-500/5 dark:text-indigo-400/5 group-hover:scale-110 transition-transform">
            <Activity size={80} className="stroke-[1.5]" />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
              <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-lg">
                <Activity size={14} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Operações Hoje</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-display font-black text-slate-900 dark:text-white">
                {todayCount}
              </span>
              <span className="text-xs text-slate-400">Movimentos</span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock size={11} className="text-slate-400" />
              <span>Sincronizado em tempo real</span>
            </div>
          </div>
        </div>

        {/* Stat 4: Active Warehouses */}
        <div className="bg-white dark:bg-dark-surface p-5 rounded-xl border-l-4 border-l-emerald-500 border border-slate-100 dark:border-dark-border shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-emerald-500/5 dark:text-emerald-400/5 group-hover:scale-110 transition-transform">
            <Layers size={80} className="stroke-[1.5]" />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
              <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-lg">
                <Layers size={14} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Rede de Armazéns</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-display font-black text-slate-900 dark:text-white">
                {warehouses.length}
              </span>
              <span className="text-xs text-slate-400">Lojas Ativas</span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <MapPin size={11} className="text-slate-400" />
              <span>Luanda, Benguela, Lobito</span>
            </div>
          </div>
        </div>
      </div>

      {/* Opções Rápidas (Atalhos do Operador) */}
      <div className="space-y-3" id="quick-actions-option-boxes">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Opções Rápidas & Atalhos Operacionais
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => onNavigate("inventory")} 
            className="flex items-center gap-4 bg-white dark:bg-dark-surface p-4 rounded-xl border border-slate-150 dark:border-dark-border shadow-xs hover:shadow-md hover:border-brand-500 dark:hover:border-brand-500/50 transition-all text-left cursor-pointer group focus:outline-none"
            id="opt-box-inventory"
          >
            <div className="p-3 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-lg group-hover:scale-105 transition-transform">
              <PlusCircle size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Adicionar Artigo</span>
              <span className="text-[10px] text-slate-400 block">Registar novo item ao Stock</span>
            </div>
          </button>

          <button 
            onClick={() => onNavigate("movements")} 
            className="flex items-center gap-4 bg-white dark:bg-dark-surface p-4 rounded-xl border border-slate-150 dark:border-dark-border shadow-xs hover:shadow-md hover:border-indigo-500 dark:hover:border-indigo-500/50 transition-all text-left cursor-pointer group focus:outline-none"
            id="opt-box-movements"
          >
            <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:scale-105 transition-transform">
              <ArrowRightLeft size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Movimentação</span>
              <span className="text-[10px] text-slate-400 block">Registrar entrada ou transf.</span>
            </div>
          </button>

          <button 
            onClick={onRunAudit} 
            disabled={aiResult.loading}
            className="flex items-center gap-4 bg-white dark:bg-dark-surface p-4 rounded-xl border border-slate-150 dark:border-dark-border shadow-xs hover:shadow-md hover:border-emerald-500 dark:hover:border-emerald-500/50 transition-all text-left cursor-pointer group focus:outline-none disabled:opacity-60"
            id="opt-box-audit"
          >
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg group-hover:scale-105 transition-transform">
              <Sparkles size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Auditar com IA</span>
              <span className="text-[10px] text-slate-400 block">Auditoria assistida por Gemini</span>
            </div>
          </button>

          <button 
            onClick={() => onNavigate("settings")} 
            className="flex items-center gap-4 bg-white dark:bg-dark-surface p-4 rounded-xl border border-slate-150 dark:border-dark-border shadow-xs hover:shadow-md hover:border-amber-500 dark:hover:border-amber-500/50 transition-all text-left cursor-pointer group focus:outline-none"
            id="opt-box-settings"
          >
            <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg group-hover:scale-105 transition-transform">
              <Settings size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Configurações</span>
              <span className="text-[10px] text-slate-400 block">Ajustar preferências do ERP</span>
            </div>
          </button>
        </div>
      </div>

      {/* AI Copilot Audit Widget */}
      <div className="bg-linear-to-r from-brand-900 via-brand-800 to-slate-900 text-white p-6 rounded-2xl border border-brand-800 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 bg-brand-500/30 text-brand-100 text-xs px-2.5 py-1 rounded-full border border-brand-500/40 font-mono">
              <Sparkles size={12} className="text-yellow-300 animate-pulse" />
              <span>AMADJE CO-PILOT LOGÍSTICO IA</span>
            </div>
            <h2 className="text-lg font-display font-semibold tracking-tight">
              Deseja uma auditoria automatizada do seu Stock atual?
            </h2>
            <p className="text-xs text-brand-100 max-w-2xl leading-relaxed">
              O nosso modelo de Inteligência Artificial integrado (<span className="font-mono text-yellow-300">gemini-3.5-flash</span>) irá analisar as roturas de stock, datas de validade dos lotes, distribuição geográfica nos armazéns e sugerir ordens de compra automáticas.
            </p>
          </div>
          <button 
            onClick={onRunAudit}
            disabled={aiResult.loading}
            className="shrink-0 bg-white hover:bg-slate-100 text-brand-900 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {aiResult.loading ? (
              <>
                <div className="w-4 h-4 border-2 border-brand-900 border-t-transparent rounded-full animate-spin" />
                <span>A analisar Stock...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} className="text-brand-500" />
                <span>Auditar Stock com IA</span>
              </>
            )}
          </button>
        </div>

        {/* Dynamic Audit Result Area inside dashboard */}
        {aiResult.text && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-slate-900/80 border border-brand-700/50 rounded-xl max-h-60 overflow-y-auto text-xs space-y-2 text-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-semibold text-brand-300 flex items-center gap-1">
                <Sparkles size={12} /> Resultado da Auditoria Automatizada IA:
              </span>
              <button 
                onClick={() => onNavigate("copilot")}
                className="text-brand-400 hover:text-white transition-colors"
              >
                Abrir Chat Completo →
              </button>
            </div>
            <div className="whitespace-pre-wrap leading-relaxed font-sans prose prose-invert prose-xs">
              {aiResult.text}
            </div>
          </motion.div>
        )}
      </div>

      {/* Charts & Store Comparative Grid */}
      <div className="space-y-6">
        {/* Resumo Comparativo de Stock Inter-Lojas */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-slate-150 dark:border-dark-border shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest block mb-0.5">Indicadores de Performance</span>
              <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
                Resumo Comparativo de Stock Inter-Lojas (Luanda, Benguela, Lobito)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Saúde logística, volume físico de artigos e valor financeiro consolidado por filial ativa.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono text-[10px]">CONEXÃO SEGURA SISTEMA</span>
            </div>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {storePerformanceData.map(store => {
              const healthColor = store.healthScore >= 90 
                ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40" 
                : store.healthScore >= 70 
                ? "text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40" 
                : "text-red-500 bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/40";

              return (
                <div 
                  key={store.id} 
                  className="bg-slate-50/50 dark:bg-slate-900/40 rounded-xl p-4 border border-slate-200/50 dark:border-slate-800/80 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-display font-bold text-slate-800 dark:text-slate-200 text-sm leading-snug">{store.fullName}</h4>
                        <p className="text-[10px] text-slate-400">Gerente: {store.manager}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${healthColor}`}>
                        {store.healthScore}% Saúde
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1 mt-2.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          store.healthScore >= 90 ? "bg-emerald-500" : store.healthScore >= 70 ? "bg-amber-500" : "bg-red-500"
                        }`}
                        style={{ width: `${store.healthScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Operational stats */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-white dark:bg-dark-surface p-2 rounded-lg border border-slate-100 dark:border-dark-border text-left">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Stock Alocado</span>
                      <span className="font-mono font-bold text-xs text-slate-800 dark:text-white">
                        {store.totalQty.toLocaleString()} <span className="text-[9px] font-normal text-slate-400">UN</span>
                      </span>
                    </div>
                    <div className="bg-white dark:bg-dark-surface p-2 rounded-lg border border-slate-100 dark:border-dark-border text-left">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Valor Líquido</span>
                      <span className="font-mono font-bold text-xs text-slate-800 dark:text-white">
                        {store.totalValK.toLocaleString()}k <span className="text-[9px] font-normal text-slate-400">AOA</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>{store.movementsCount} logs logísticos</span>
                    {store.criticalItems > 0 ? (
                      <span className="text-red-500 font-semibold">{store.criticalItems} alertas críticos</span>
                    ) : (
                      <span className="text-emerald-500 font-semibold">Stock Estável</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gráficos de barras verticais e distribuição */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            
            {/* Chart Column 1: Stock levels by Warehouse (Bar Chart) */}
            <div className="space-y-2 lg:col-span-1">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-brand-500 rounded-sm"></span>
                Volume Físico por Filial (Unidades)
              </h4>
              <div className="h-56 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-150 dark:border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={storePerformanceData}
                      margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 500 }} stroke="#64748b" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#fff", borderRadius: 8, fontSize: 10 }}
                        formatter={(value: any) => [`${value.toLocaleString()} Unidades`, 'Stock']}
                      />
                      <Bar dataKey="totalQty" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={30}>
                        {storePerformanceData.map((entry, index) => {
                          const colors = ["#3b82f6", "#10b981", "#6366f1", "#f59e0b", "#8b5cf6"];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-[10px] text-center text-slate-400 font-medium">Comparação direta de volume físico</div>
              </div>
            </div>

            {/* Chart Column 2: Stock financial values (Bar Chart) */}
            <div className="space-y-2 lg:col-span-1">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-emerald-500 rounded-sm"></span>
                Valor Financeiro por Filial (mKz)
              </h4>
              <div className="h-56 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-150 dark:border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={storePerformanceData}
                      margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 500 }} stroke="#64748b" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#fff", borderRadius: 8, fontSize: 10 }}
                        formatter={(value: any) => [`${(value * 1000).toLocaleString()} AOA`, 'Valor Líquido']}
                      />
                      <Bar dataKey="totalValK" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30}>
                        {storePerformanceData.map((entry, index) => {
                          const colors = ["#2563eb", "#059669", "#4f46e5", "#d97706", "#7c3aed"];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-[10px] text-center text-slate-400 font-medium">Comparação de liquidez de inventário</div>
              </div>
            </div>

            {/* Chart Column 3: Flow distribution (Pie Chart) */}
            <div className="space-y-2 lg:col-span-1">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-brand-500 rounded-sm"></span>
                Fluxo Logístico de Carga (Global)
              </h4>
              <div className="h-56 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-150 dark:border-slate-800 rounded-xl p-3 flex flex-col justify-between relative">
                <div className="h-40 flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-lg font-bold font-display text-slate-800 dark:text-slate-100">
                      {movements.length}
                    </span>
                    <span className="text-[8px] text-slate-400 uppercase tracking-widest">Logs</span>
                  </div>
                </div>
                
                {/* Custom mini legend */}
                <div className="flex justify-center gap-3 text-[10px]">
                  {pieData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-slate-500 dark:text-slate-400">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Trend Chart: Entradas vs Saídas nos últimos 6 meses */}
      <div className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-slate-150 dark:border-dark-border shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest block mb-0.5">Fluxo de Movimentação</span>
            <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
              Tendência de Entradas e Saídas de Stock (Últimos 6 Meses)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Análise de volume de reposição de stock face ao consumo e expedições mensais.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-emerald-500/20 border border-emerald-500 rounded-sm inline-block"></span>
              <span className="text-slate-600 dark:text-slate-300">Entradas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-red-500/20 border border-red-500 rounded-sm inline-block"></span>
              <span className="text-slate-600 dark:text-slate-300">Saídas</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trendData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 500 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: "#1e293b", 
                  borderColor: "#334155", 
                  color: "#fff", 
                  borderRadius: 8, 
                  fontSize: 10 
                }}
                formatter={(value: any) => [`${value.toLocaleString()} UN`, '']}
              />
              <Area 
                type="monotone" 
                dataKey="Entradas" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorEntradas)" 
              />
              <Area 
                type="monotone" 
                dataKey="Saidas" 
                stroke="#ef4444" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorSaidas)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Columns: Recent Activities and Critical Alerts List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Movements Log */}
        <div className="bg-white dark:bg-dark-surface p-5 rounded-xl border border-slate-100 dark:border-dark-border shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                Movimentações Recentes
              </h3>
              <p className="text-xs text-slate-500">Histórico das últimas operações de entrada e saída.</p>
            </div>
            <button 
              onClick={() => onNavigate("movements")}
              className="text-xs font-semibold text-brand-600 dark:text-brand-100 hover:underline flex items-center space-x-1"
            >
              <span>Gerir Registos</span>
              <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto pr-1">
            {movements.slice(0, 5).map((move) => (
              <div key={move.id} className="py-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <span className={`p-1.5 rounded-md flex items-center justify-center font-bold ${
                    move.type === "entrada" 
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" 
                      : move.type === "saida" 
                      ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400" 
                      : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                  }`}>
                    {move.type === "entrada" ? (
                      <TrendingUp size={14} />
                    ) : move.type === "saida" ? (
                      <TrendingDown size={14} />
                    ) : (
                      <Layers size={14} />
                    )}
                  </span>
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100">{move.itemName}</h4>
                    <p className="text-[10px] text-slate-400">
                      {move.type === "transferencia" 
                        ? `${move.fromWarehouse?.split(" (")[0]} ➔ ${move.toWarehouse?.split(" (")[0]}`
                        : move.type === "entrada" 
                        ? `Recebido no ${move.toWarehouse?.split(" (")[0]}`
                        : `Expedido do ${move.fromWarehouse?.split(" (")[0]}`
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-mono font-bold ${
                    move.type === "entrada" ? "text-emerald-600" : move.type === "saida" ? "text-red-600" : "text-blue-600"
                  }`}>
                    {move.type === "entrada" ? "+" : move.type === "saida" ? "-" : ""}
                    {move.quantity} {move.sku.startsWith("CAB") ? "BOBINA" : "UN"}
                  </span>
                  <p className="text-[9px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                    <span>{move.date.split(" ")[1] || move.date}</span>
                    <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">{move.reference}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Alerts & Low Stock Warning list */}
        <div className="bg-white dark:bg-dark-surface p-5 rounded-xl border border-slate-100 dark:border-dark-border shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                Alertas de Rutura e Limiares Críticos
              </h3>
              <p className="text-xs text-slate-500">Produtos que requerem intervenção logística imediata.</p>
            </div>
            <button 
              onClick={() => onNavigate("inventory")}
              className="text-xs font-semibold text-brand-600 dark:text-brand-100 hover:underline"
            >
              Ver Tudo
            </button>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {items
              .filter(item => item.status === "critico" || item.status === "sem-stock" || item.currentStock <= item.minStock)
              .slice(0, 4)
              .map(item => (
                <div 
                  key={item.id} 
                  className={`p-3 rounded-lg border flex items-center justify-between ${
                    item.currentStock === 0 
                      ? "bg-red-50/50 dark:bg-red-950/10 border-red-100 dark:border-red-950/40" 
                      : "bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-950/40"
                  }`}
                >
                  <div className="flex items-start space-x-3 text-xs">
                    <span className={`p-1.5 rounded-full mt-0.5 flex items-center justify-center ${
                      item.currentStock === 0 
                        ? "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400" 
                        : "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400"
                    }`}>
                      <AlertTriangle size={14} />
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Armazém: <span className="font-medium text-slate-600 dark:text-slate-300">{item.warehouse.split(" (")[0]}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Lote: <span className="font-mono text-slate-600 dark:text-slate-300">{item.lot}</span>
                        {item.expiryDate && (
                          <span className="ml-2 font-mono">Validade: {item.expiryDate}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <span className={`font-bold font-mono ${item.currentStock === 0 ? "text-red-600" : "text-amber-600"}`}>
                      {item.currentStock} / {item.minStock} {item.unit}
                    </span>
                    <p className="text-[9px] text-slate-400 mt-1 uppercase font-semibold">
                      {item.currentStock === 0 ? "SEM STOCK" : "RESERVA CRÍTICA"}
                    </p>
                  </div>
                </div>
              ))}
            {items.filter(item => item.status === "critico" || item.currentStock <= item.minStock).length === 0 && (
              <div className="py-8 text-center text-slate-400 space-y-2 flex flex-col items-center">
                <CheckCircle2 size={32} className="text-emerald-500" />
                <span className="text-xs">Não existem alertas de stock crítico ou rutura!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
