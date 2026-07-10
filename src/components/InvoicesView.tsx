import React, { useState } from "react";
import { 
  FileText, 
  Plus, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Coins, 
  ShieldCheck, 
  Users, 
  FileCode, 
  Calendar, 
  X 
} from "lucide-react";
import { SAFTInvoiceSim, StockItem, StockMovement } from "../types";

interface InvoicesViewProps {
  invoices: SAFTInvoiceSim[];
  items: StockItem[];
  movements: StockMovement[];
  onEmitInvoice: (invoice: Omit<SAFTInvoiceSim, "id" | "date" | "invoiceNo" | "status">) => void;
}

export default function InvoicesView({
  invoices,
  items,
  movements,
  onEmitInvoice
}: InvoicesViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerNif, setCustomerNif] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(items[0]?.id || "");
  const [qtyToBill, setQtyToBill] = useState(1);

  const billingItem = items.find(i => i.id === selectedProductId);

  const handleEmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingItem) return;

    if (qtyToBill > billingItem.currentStock) {
      alert(`Quantidade selecionada (${qtyToBill}) excede o stock atual (${billingItem.currentStock} UN).`);
      return;
    }

    const calculatedAmount = billingItem.price * qtyToBill;
    const calculatedTax = calculatedAmount * 0.14; // 14% IVA Angola

    onEmitInvoice({
      customerName: customerName || "Consumidor Final",
      customerNif: customerNif || "999999999",
      amount: calculatedAmount,
      taxAmount: calculatedTax,
      itemsCount: qtyToBill
    });

    setIsModalOpen(false);
    // Reset
    setCustomerName("");
    setCustomerNif("");
    setQtyToBill(1);
  };

  // Trigger real SAFT XML generation download from the backend
  const handleDownloadSAFT = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch("/api/saft/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, movements })
      });
      
      if (!response.ok) {
        throw new Error("Erro na geração remota do SAF-T.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SAF-T_AO_AMADJE_Export_${new Date().toISOString().split("T")[0]}.xml`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error(error);
      alert("Falha ao gerar SAF-T: " + error.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const totalBilled = invoices.reduce((sum, i) => sum + i.amount, 0);
  const totalTax = invoices.reduce((sum, i) => sum + i.taxAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header and Download Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-white">
            Simulador de Faturação e SAFT-AO AGT
          </h2>
          <p className="text-xs text-slate-500">
            Faturação integrada em conformidade com as regras da Administração Geral Tributária (AGT) angolana.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadSAFT}
            disabled={isDownloading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center justify-center space-x-2 shadow-xs transition-all hover:scale-105 disabled:opacity-50"
            id="btn-download-saft"
          >
            <Download size={15} />
            <span>{isDownloading ? "A Exportar SAF-T..." : "Exportar SAF-T (AO) XML"}</span>
          </button>
          
          <button
            onClick={() => {
              if (items.length === 0) {
                alert("Adicione primeiro artigos ao inventário.");
                return;
              }
              setIsModalOpen(true);
            }}
            className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center justify-center space-x-2 shadow-xs transition-all hover:scale-105"
            id="btn-new-invoice"
          >
            <Plus size={15} />
            <span>Emitir Fatura de Stock</span>
          </button>
        </div>
      </div>

      {/* Compliance Notice Banner */}
      <div className="bg-blue-50 dark:bg-dark-surface/50 p-4 rounded-xl border border-blue-200 dark:border-dark-border flex items-start gap-3">
        <span className="p-2 bg-blue-100 dark:bg-slate-800 rounded-lg text-blue-600 dark:text-blue-400 mt-0.5">
          <ShieldCheck size={20} />
        </span>
        <div className="space-y-1 text-xs">
          <h4 className="font-display font-bold text-slate-900 dark:text-white">Conformidade Legal AGT - Validação SAFT-AO</h4>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Este ERP simula a estrutura técnica do ficheiro <span className="font-semibold text-slate-800 dark:text-slate-200">SAF-T (AO)</span> regulamentada pela AGT de Angola. As faturas emitidas geram saídas de stock automáticas, aplicando a taxa de <span className="font-mono font-semibold text-brand-600 dark:text-brand-100">14% de IVA</span> padrão. A exportação do XML contém os cabeçalhos fiscais da empresa e a tabela de produtos.
          </p>
        </div>
      </div>

      {/* Metrics Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total billed */}
        <div className="bg-white dark:bg-dark-surface p-5 rounded-xl border border-slate-200 dark:border-dark-border shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Faturado</span>
          <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
            {totalBilled.toLocaleString()} AOA
          </div>
          <p className="text-[10px] text-slate-400">Excluindo retenções de fonte</p>
        </div>

        {/* Taxes amount */}
        <div className="bg-white dark:bg-dark-surface p-5 rounded-xl border border-slate-200 dark:border-dark-border shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">IVA Liquidado (14%)</span>
          <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
            {totalTax.toLocaleString()} AOA
          </div>
          <p className="text-[10px] text-slate-400">Submetido para Declaração Periódica</p>
        </div>

        {/* Total Invoices emitted */}
        <div className="bg-white dark:bg-dark-surface p-5 rounded-xl border border-slate-200 dark:border-dark-border shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Documentos Emitidos</span>
          <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
            {invoices.length} <span className="text-xs text-slate-400 font-normal">FT / FR</span>
          </div>
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <CheckCircle2 size={11} className="text-emerald-500" />
            <span>Todos assinados com chave privada</span>
          </p>
        </div>
      </div>

      {/* Invoices List table */}
      <div className="bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="table-invoices">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4">Número de Fatura</th>
                <th className="py-3 px-4">Cliente / Entidade</th>
                <th className="py-3 px-4">NIF Cliente</th>
                <th className="py-3 px-4 text-right">Valor Sem Imposto</th>
                <th className="py-3 px-4 text-right">IVA (14%)</th>
                <th className="py-3 px-4 text-right">Total com IVA</th>
                <th className="py-3 px-4 text-center">Data</th>
                <th className="py-3 px-4 text-center">Estado AGT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-xs text-slate-700 dark:text-slate-300">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-brand-600 dark:text-brand-100">
                    {inv.invoiceNo}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    {inv.customerName}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {inv.customerNif}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    {inv.amount.toLocaleString()} AOA
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-500">
                    {inv.taxAmount.toLocaleString()} AOA
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {(inv.amount + inv.taxAmount).toLocaleString()} AOA
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-500">
                    {inv.date}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[9px] font-semibold uppercase tracking-wider">
                      <ShieldCheck size={10} />
                      <span>Validada</span>
                    </span>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText size={36} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">Nenhuma fatura emitida neste período.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EMIT INVOICE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-dark-border shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <h3 className="text-sm font-display font-bold">Emitir Fatura Integrada de Stock</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleEmit} className="p-6 space-y-4">
              {/* Product selection */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Artigo a Faturar</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500"
                >
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} — Preço: {item.price.toLocaleString()} AOA (Disp: {item.currentStock} UN)
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Quantidade (Unidades)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={qtyToBill}
                  onChange={(e) => setQtyToBill(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>

              {/* Customer Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Nome do Cliente / Entidade</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Clínica Geral do Kwanza"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Customer NIF */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">NIF Angolano do Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 541987654"
                  value={customerNif}
                  onChange={(e) => setCustomerNif(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>

              {/* Tax estimation breakdown */}
              {billingItem && (
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-lg text-xs space-y-1.5 border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between text-slate-500">
                    <span>Preço Unitário:</span>
                    <span className="font-mono">{billingItem.price.toLocaleString()} AOA</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal Líquido:</span>
                    <span className="font-mono font-semibold">{(billingItem.price * qtyToBill).toLocaleString()} AOA</span>
                  </div>
                  <div className="flex justify-between text-brand-600 dark:text-brand-100 font-semibold">
                    <span>Imposto IVA (14%):</span>
                    <span className="font-mono">{(billingItem.price * qtyToBill * 0.14).toLocaleString()} AOA</span>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-600 my-1 pt-1 flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>Total Fatura:</span>
                    <span className="font-mono">{(billingItem.price * qtyToBill * 1.14).toLocaleString()} AOA</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                >
                  Confirmar e Emitir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
