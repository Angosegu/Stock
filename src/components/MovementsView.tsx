import React, { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Search, 
  Plus, 
  ArrowRightLeft, 
  Calendar, 
  User, 
  FileText, 
  X, 
  ChevronRight, 
  Warehouse as WhIcon,
  Ban
} from "lucide-react";
import { StockMovement, StockItem, Warehouse, UserRole } from "../types";

interface MovementsViewProps {
  movements: StockMovement[];
  items: StockItem[];
  warehouses: Warehouse[];
  onAddMovement: (movement: Omit<StockMovement, "id" | "date">) => void;
  onVoidMovement?: (id: string) => void;
  currentUser?: UserRole | null;
}

export default function MovementsView({
  movements,
  items,
  warehouses,
  onAddMovement,
  onVoidMovement,
  currentUser
}: MovementsViewProps) {
  // Filters state
  const [selectedType, setSelectedType] = useState<"all" | "entrada" | "saida" | "transferencia">("all");
  const [selectedStore, setSelectedStore] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Registration form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    itemId: "",
    type: "entrada" as "entrada" | "saida" | "transferencia",
    fromWarehouse: "",
    toWarehouse: "",
    quantity: 1,
    user: "Supervisor AMADJE",
    reference: "",
    lot: "Geral",
    notes: ""
  });

  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StockItem | null>(null);

  // Group items by SKU to show each product uniquely in search results
  const uniqueItems: StockItem[] = [];
  const seenSkus = new Set<string>();
  items.forEach(item => {
    if (!seenSkus.has(item.sku)) {
      seenSkus.add(item.sku);
      uniqueItems.push(item);
    }
  });

  const matchingItems = uniqueItems.filter(item => 
    item.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  // Filter movements
  const filteredMovements = movements.filter(m => {
    const matchesType = selectedType === "all" || m.type === selectedType;
    const matchesStore = selectedStore === "all" || 
      m.fromWarehouse === selectedStore || 
      m.toWarehouse === selectedStore;
    const matchesSearch = 
      m.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.user.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesStore && matchesSearch;
  });

  const handleProductSelect = (item: StockItem) => {
    setSelectedProduct(item);
    setProductSearchTerm(item.name);
    setShowSearchResults(false);
    setFormData(prev => ({
      ...prev,
      itemId: item.id,
      lot: item.lot || "Geral"
    }));
  };

  const handleTypeChange = (type: "entrada" | "saida" | "transferencia") => {
    setFormData(prev => ({
      ...prev,
      type,
      fromWarehouse: "",
      toWarehouse: ""
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      alert("Por favor, selecione um artigo.");
      return;
    }

    // Validation for stores selection
    if (formData.type === "entrada" && !formData.toWarehouse) {
      alert("Por favor, selecione a loja de entrada.");
      return;
    }
    if (formData.type === "saida" && !formData.fromWarehouse) {
      alert("Por favor, selecione a loja de saída.");
      return;
    }
    if (formData.type === "transferencia") {
      if (!formData.fromWarehouse) {
        alert("Por favor, selecione a loja de origem.");
        return;
      }
      if (!formData.toWarehouse) {
        alert("Por favor, selecione a loja de destino.");
        return;
      }
      if (formData.fromWarehouse === formData.toWarehouse) {
        alert("A loja de origem e de destino não podem ser as mesmas.");
        return;
      }
    }

    // If exit or transfer, verify that the item exists and has sufficient stock in the source warehouse
    if (formData.type === "saida" || formData.type === "transferencia") {
      const sourceItem = items.find(i => i.sku === selectedProduct.sku && i.warehouse === formData.fromWarehouse);
      if (!sourceItem) {
        alert(`Erro: Não existe stock registado do artigo "${selectedProduct.name}" no armazém "${formData.fromWarehouse.split(" (")[0]}".`);
        return;
      }
      if (formData.quantity > sourceItem.currentStock) {
        alert(`Erro: Quantidade solicitada (${formData.quantity}) excede o stock atual disponível (${sourceItem.currentStock} ${sourceItem.unit}) no armazém "${formData.fromWarehouse.split(" (")[0]}".`);
        return;
      }
    }

    const finalReference = "REG-MOV-" + Math.floor(100000 + Math.random() * 900000);
    const finalLot = selectedProduct.lot || "Geral";

    onAddMovement({
      type: formData.type,
      itemId: selectedProduct.id,
      itemName: selectedProduct.name,
      sku: selectedProduct.sku,
      fromWarehouse: formData.type === "entrada" ? undefined : formData.fromWarehouse,
      toWarehouse: formData.type === "saida" ? undefined : formData.toWarehouse,
      quantity: Number(formData.quantity),
      user: formData.user,
      reference: finalReference,
      lot: finalLot,
      notes: formData.notes
    });

    setIsModalOpen(false);
    // Reset form states
    setProductSearchTerm("");
    setSelectedProduct(null);
    setFormData({
      itemId: "",
      type: "entrada",
      fromWarehouse: "",
      toWarehouse: "",
      quantity: 1,
      user: "Supervisor AMADJE",
      reference: "",
      lot: "Geral",
      notes: ""
    });
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-white">
            Histórico de Movimentações & Logs
          </h2>
          <p className="text-xs text-slate-500">
            Audit trail completo e rastreabilidade tributária SAF-T de entradas, saídas e transferências de mercadoria.
          </p>
        </div>
        <button
          onClick={() => {
            if (items.length > 0) {
              setProductSearchTerm("");
              setSelectedProduct(null);
              setShowSearchResults(false);
              setFormData({
                itemId: "",
                type: "entrada",
                fromWarehouse: "",
                toWarehouse: "",
                quantity: 1,
                user: "Supervisor AMADJE",
                reference: "",
                lot: "Geral",
                notes: ""
              });
              setIsModalOpen(true);
            } else {
              alert("Por favor, registe primeiro um produto no inventário antes de efetuar movimentações.");
            }
          }}
          className="bg-slate-900 hover:bg-slate-800 dark:bg-brand-500 dark:hover:bg-brand-600 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center justify-center space-x-2 shadow-xs transition-all hover:scale-105"
          id="btn-new-movement"
        >
          <Plus size={16} />
          <span>Registar Movimento de Stock</span>
        </button>
      </div>

      {/* Filters Area */}
      <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-slate-200 dark:border-dark-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Quick filters pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedType("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedType === "all"
                ? "bg-slate-900 text-white dark:bg-brand-500"
                : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            }`}
          >
            Todos os Registos ({movements.length})
          </button>
          <button
            onClick={() => setSelectedType("entrada")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              selectedType === "entrada"
                ? "bg-emerald-600 text-white"
                : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            }`}
          >
            <TrendingUp size={13} />
            Entradas
          </button>
          <button
            onClick={() => setSelectedType("saida")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              selectedType === "saida"
                ? "bg-red-600 text-white"
                : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            }`}
          >
            <TrendingDown size={13} />
            Saídas
          </button>
          <button
            onClick={() => setSelectedType("transferencia")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              selectedType === "transferencia"
                ? "bg-blue-600 text-white"
                : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            }`}
          >
            <ArrowRightLeft size={13} />
            Transferências
          </button>
        </div>

        {/* Store filter & Search Input */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Store selector */}
          <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs w-full sm:w-48">
            <WhIcon size={14} className="text-slate-400 shrink-0" />
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-white outline-none w-full font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="dark:bg-slate-900">Todas as Lojas</option>
              {warehouses.map(wh => (
                <option key={wh.id} value={wh.name} className="dark:bg-slate-900">{wh.name}</option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-60">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Pesquisar por SKU, doc, utilizador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
              id="input-search-movements"
            />
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="table-movements">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4">Artigo</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Origem ➔ Destino</th>
                <th className="py-3 px-4 text-right">Qtd</th>
                <th className="py-3 px-4">Data de Saída</th>
                <th className="py-3 px-4">Loja</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-xs text-slate-700 dark:text-slate-300">
              {filteredMovements.map((move) => {
                const isAdmin = currentUser?.role === "admin";
                return (
                  <tr 
                    key={move.id} 
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${
                      move.voided ? "opacity-55 bg-slate-50/40 dark:bg-slate-900/10" : ""
                    }`}
                  >
                    {/* Name and SKU */}
                    <td className="py-3.5 px-4">
                      <div className={`font-semibold text-slate-900 dark:text-white ${move.voided ? "line-through" : ""}`}>{move.itemName}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">SKU: {move.sku}</div>
                    </td>

                    {/* Type Badge */}
                    <td className="py-3.5 px-4">
                      {move.voided ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 uppercase tracking-wider">
                          <Ban size={9} />
                          <span>Anulado</span>
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${
                          move.type === "entrada" 
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200" 
                            : move.type === "saida" 
                            ? "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200" 
                            : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200"
                        }`}>
                          {move.type === "entrada" ? (
                            <TrendingUp size={10} />
                          ) : move.type === "saida" ? (
                            <TrendingDown size={10} />
                          ) : (
                            <ArrowRightLeft size={10} />
                          )}
                          <span>{move.type}</span>
                        </span>
                      )}
                    </td>

                    {/* Origin -> Destination Route */}
                    <td className="py-3.5 px-4">
                      <div className={`flex items-center space-x-1 text-slate-600 dark:text-slate-300 ${move.voided ? "line-through" : ""}`}>
                        <span className="truncate max-w-[120px]" title={move.fromWarehouse || "Fornecedor Externo"}>
                          {move.fromWarehouse ? move.fromWarehouse.split(" (")[0] : "Fornecedor / Import"}
                        </span>
                        <ChevronRight size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-[120px] font-medium text-slate-900 dark:text-white" title={move.toWarehouse || "Cliente Final"}>
                          {move.toWarehouse ? move.toWarehouse.split(" (")[0] : "Saída / Cliente / Consumo"}
                        </span>
                      </div>
                      {move.notes && (
                        <p className="text-[10px] text-slate-400 italic mt-1 font-sans">{move.notes}</p>
                      )}
                    </td>

                    {/* Quantity */}
                    <td className={`py-3.5 px-4 text-right font-mono font-bold ${move.voided ? "line-through text-slate-400" : ""}`}>
                      <span className={move.type === "entrada" ? "text-emerald-600" : move.type === "saida" ? "text-red-600" : "text-blue-600"}>
                        {move.type === "entrada" ? "+" : move.type === "saida" ? "-" : ""}
                        {move.quantity}
                      </span>
                    </td>

                    {/* Data de Saida */}
                    <td className={`py-3.5 px-4 text-slate-500 font-mono text-[11px] ${move.voided ? "line-through" : ""}`}>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-400 shrink-0" />
                        <span>{move.date}</span>
                      </div>
                    </td>

                    {/* Loja */}
                    <td className={`py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium ${move.voided ? "line-through" : ""}`}>
                      <div className="flex items-center gap-1.5">
                        <WhIcon size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-[150px]">
                          {move.type === "entrada" 
                            ? (move.toWarehouse ? move.toWarehouse.split(" (")[0] : "N/A")
                            : move.type === "saida" 
                            ? (move.fromWarehouse ? move.fromWarehouse.split(" (")[0] : "N/A")
                            : `${move.fromWarehouse ? move.fromWarehouse.split(" (")[0] : "N/A"} ➔ ${move.toWarehouse ? move.toWarehouse.split(" (")[0] : "N/A"}`}
                        </span>
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="py-3.5 px-4 text-center">
                      {move.voided ? (
                        <span className="text-[10px] font-semibold text-slate-400 italic">Movimento Inativo</span>
                      ) : isAdmin ? (
                        <button
                          onClick={() => onVoidMovement?.(move.id)}
                          className="px-2.5 py-1 text-[10px] font-bold bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg border border-red-200/50 dark:border-red-900/30 transition-all flex items-center gap-1 mx-auto cursor-pointer"
                          title="Anular este movimento"
                        >
                          <Ban size={11} />
                          <span>Anular</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Requer Admin</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredMovements.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ArrowRightLeft size={36} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">Nenhum movimento logado com os critérios selecionados.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTRATION FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-dark-border shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <h3 className="text-xs font-display font-bold">Registar Movimento</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Product selector (Searchable Auto-complete) */}
              <div className="space-y-1 relative">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Artigo em Stock *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Pesquisar por nome ou SKU..."
                    value={productSearchTerm}
                    onChange={(e) => {
                      setProductSearchTerm(e.target.value);
                      setShowSearchResults(true);
                      if (selectedProduct) {
                        setSelectedProduct(null);
                      }
                    }}
                    onFocus={() => setShowSearchResults(true)}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                  {productSearchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setProductSearchTerm("");
                        setSelectedProduct(null);
                        setShowSearchResults(false);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {showSearchResults && productSearchTerm && matchingItems.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-40 overflow-y-auto z-50 text-xs">
                    {matchingItems.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleProductSelect(item)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex flex-col border-b border-slate-100 dark:border-slate-800 last:border-none"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</span>
                      </button>
                    ))}
                  </div>
                )}
                {showSearchResults && productSearchTerm && matchingItems.length === 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 z-50 text-xs text-slate-400 text-center">
                    Nenhum artigo encontrado.
                  </div>
                )}
              </div>

              {/* Movement Type pills */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Tipo de Movimento</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["entrada", "saida", "transferencia"] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTypeChange(t)}
                      className={`py-1.5 rounded-lg border text-[10px] font-semibold uppercase tracking-wider text-center transition-all ${
                        formData.type === t
                          ? t === "entrada"
                            ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                            : t === "saida"
                            ? "bg-red-50 dark:bg-red-950/20 border-red-500 text-red-700 dark:text-red-400"
                            : "bg-blue-50 dark:bg-blue-950/20 border-blue-500 text-blue-700 dark:text-blue-400"
                          : "border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      {t === "entrada" ? "Entrada" : t === "saida" ? "Saída" : "Transf."}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source Warehouse (if exit or transfer) */}
              {(formData.type === "saida" || formData.type === "transferencia") && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    {formData.type === "saida" ? "Loja de Saída *" : "Loja de Origem (Saída) *"}
                  </label>
                  <select
                    required
                    value={formData.fromWarehouse}
                    onChange={(e) => setFormData(prev => ({ ...prev, fromWarehouse: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  >
                    <option value="">-- Selecione a Loja de Saída --</option>
                    {warehouses.map(wh => (
                      <option key={wh.id} value={wh.name}>{wh.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Destination Warehouse (if entrance or transfer) */}
              {(formData.type === "entrada" || formData.type === "transferencia") && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    {formData.type === "entrada" ? "Loja de Entrada *" : "Loja de Destino (Entrada) *"}
                  </label>
                  <select
                    required
                    value={formData.toWarehouse}
                    onChange={(e) => setFormData(prev => ({ ...prev, toWarehouse: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  >
                    <option value="">-- Selecione a Loja de Entrada --</option>
                    {warehouses
                      .filter(w => formData.type === "entrada" || w.name !== formData.fromWarehouse)
                      .map(wh => (
                        <option key={wh.id} value={wh.name}>{wh.name}</option>
                      ))}
                  </select>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Quantidade *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 font-mono focus:outline-hidden"
                  />
                  {selectedProduct && (
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      ({selectedProduct.unit})
                    </span>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Observações / Notas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Informações adicionais..."
                  className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 h-12 resize-none focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-3.5 py-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-slate-950 dark:bg-brand-500 hover:bg-slate-850 dark:hover:bg-brand-600 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all"
                >
                  Confirmar Registo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
