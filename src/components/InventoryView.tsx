import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  Coins, 
  Package, 
  Check, 
  X, 
  MapPin, 
  Layers, 
  ArrowUpRight, 
  ArrowDownLeft 
} from "lucide-react";
import { StockItem, Warehouse } from "../types";

interface InventoryViewProps {
  items: StockItem[];
  warehouses: Warehouse[];
  onAddItem: (item: Omit<StockItem, "id" | "status">) => void;
  onUpdateItem: (item: StockItem) => void;
  onDeleteItem: (id: string) => void;
  onQuickAdjust: (itemId: string, quantity: number, type: "entrada" | "saida", note: string) => void;
  categoriesList?: string[];
  unitsList?: string[];
  skuMode?: string;
  defaultMinStock?: number;
  onShowConfirm?: (title: string, message: string, onConfirm: () => void, isDestructive?: boolean) => void;
}

export default function InventoryView({
  items,
  warehouses,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onQuickAdjust,
  categoriesList = ["Farmacêuticos", "Sistemas de Segurança", "Cablagem e Conectores", "Redes e Telecomunicações", "Deteção de Incêndio"],
  unitsList = ["UN", "KG", "LITRO", "BOBINA", "CAIXA"],
  skuMode = "automatico",
  defaultMinStock = 15,
  onShowConfirm
}: InventoryViewProps) {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedWarehouse, setSelectedWarehouse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // UI Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  // Form states
  const [newItem, setNewItem] = useState({
    name: "",
    sku: "",
    barcode: "",
    category: categoriesList[0] || "Farmacêuticos",
    currentStock: 100,
    minStock: defaultMinStock,
    maxStock: 500,
    unit: unitsList[0] || "UN",
    price: 1500,
    location: "Prateleira A1",
    warehouse: warehouses[0]?.name || "Armazém Central (Talatona)",
    lot: "L260001",
    expiryDate: "2027-12-31"
  });

  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [adjustingItem, setAdjustingItem] = useState<StockItem | null>(null);
  const [adjustQty, setAdjustQty] = useState(10);
  const [adjustType, setAdjustType] = useState<"entrada" | "saida">("entrada");
  const [adjustNote, setAdjustNote] = useState("Reposição manual de stock");

  // Get unique categories dynamically
  const categories = categoriesList;

  // Filter logic
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode.includes(searchTerm) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesWarehouse = selectedWarehouse === "all" || item.warehouse === selectedWarehouse;
    
    let matchesStatus = true;
    if (selectedStatus === "critico") {
      matchesStatus = item.currentStock <= item.minStock && item.currentStock > 0;
    } else if (selectedStatus === "sem-stock") {
      matchesStatus = item.currentStock === 0;
    } else if (selectedStatus === "normal") {
      matchesStatus = item.currentStock > item.minStock;
    }

    return matchesSearch && matchesCategory && matchesWarehouse && matchesStatus;
  });

  const handleSubmitNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalSku = newItem.sku.trim();
    if (skuMode === "automatico" || !finalSku) {
      finalSku = "SKU-" + Math.floor(100000 + Math.random() * 900000);
    }

    if (!newItem.name) {
      alert("Por favor, introduza o Nome do Artigo.");
      return;
    }

    onAddItem({
      ...newItem,
      sku: finalSku
    });
    setIsAddModalOpen(false);
    
    // Reset form
    setNewItem({
      name: "",
      sku: "",
      barcode: "",
      category: categoriesList[0] || "Farmacêuticos",
      currentStock: 100,
      minStock: defaultMinStock,
      maxStock: 500,
      unit: unitsList[0] || "UN",
      price: 1500,
      location: "Prateleira A1",
      warehouse: warehouses[0]?.name || "Armazém Central (Talatona)",
      lot: "L" + Math.floor(10000 + Math.random() * 90000),
      expiryDate: "2027-12-31"
    });
  };

  const handleOpenEdit = (item: StockItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleSubmitEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    onUpdateItem(editingItem);
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleOpenAdjust = (item: StockItem) => {
    setAdjustingItem(item);
    setAdjustQty(item.minStock || 10);
    setAdjustType("entrada");
    setAdjustNote("Ajuste manual de inventário");
    setIsAdjustModalOpen(true);
  };

  const handleSubmitAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem) return;
    onQuickAdjust(adjustingItem.id, adjustQty, adjustType, adjustNote);
    setIsAdjustModalOpen(false);
    setAdjustingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-white">
            Controlo de Inventário & Artigos
          </h2>
          <p className="text-xs text-slate-500">
            Adicione, edite e efetue ajustes rápidos de stock com rastreabilidade total de lotes.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center justify-center space-x-2 shadow-xs transition-all hover:scale-105"
          id="btn-add-product"
        >
          <Plus size={16} />
          <span>Registar Novo Artigo</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-slate-200 dark:border-dark-border shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative md:col-span-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Nome, SKU, Lote, Prateleira..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-white placeholder-slate-400"
              id="input-search-items"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-brand-500"
              id="select-filter-category"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Warehouse Filter */}
          <div className="relative">
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-brand-500"
              id="select-filter-warehouse"
            >
              <option value="all">Todos os Armazéns</option>
              {warehouses.map(wh => (
                <option key={wh.id} value={wh.name}>{wh.name.split(" (")[0]}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-brand-500"
              id="select-filter-status"
            >
              <option value="all">Todos os Estados</option>
              <option value="normal">Stock Saudável</option>
              <option value="critico">Reserva Crítica</option>
              <option value="sem-stock">Rotura de Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table Desktop / Grid Mobile */}
      <div className="bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="table-products">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4">Artigo / Código SKU</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Armazém / Localização</th>
                <th className="py-3 px-4 text-right">Qtd Disponível</th>
                <th className="py-3 px-4 text-right">Preço Unitário</th>
                <th className="py-3 px-4">Lote / Validade</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-xs text-slate-700 dark:text-slate-300">
              {filteredItems.map(item => {
                const isLow = item.currentStock <= item.minStock && item.currentStock > 0;
                const isOut = item.currentStock === 0;
                
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    {/* Item and SKU */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-950 dark:text-white">{item.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>SKU: {item.sku}</span>
                        {item.barcode && <span>• EAN: {item.barcode}</span>}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-medium text-[10px]">
                        {item.category}
                      </span>
                    </td>

                    {/* Warehouse & Location */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" />
                        <span>{item.warehouse.split(" (")[0]}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 ml-3.5">
                        {item.location}
                      </div>
                    </td>

                    {/* Stock levels */}
                    <td className="py-3 px-4 text-right font-mono">
                      <div className={`font-bold ${isOut ? "text-red-500" : isLow ? "text-amber-500" : "text-slate-900 dark:text-slate-100"}`}>
                        {item.currentStock.toLocaleString()} {item.unit}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">
                        Mín: {item.minStock} / Máx: {item.maxStock}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 text-right font-mono font-medium">
                      {item.price.toLocaleString()} AOA
                    </td>

                    {/* Lot / Expiry */}
                    <td className="py-3 px-4">
                      <div className="font-mono text-[10px] text-slate-600 dark:text-slate-300">Lot: {item.lot}</div>
                      {item.expiryDate && (
                        <div className="text-[9px] font-mono text-slate-400 mt-0.5">Val: {item.expiryDate}</div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${
                        isOut 
                          ? "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400" 
                          : isLow 
                          ? "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400" 
                          : "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"
                      }`}>
                        {isOut ? "Sem Stock" : isLow ? "Crítico" : "Saudável"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        {/* Quick stock adjustment */}
                        <button
                          onClick={() => handleOpenAdjust(item)}
                          title="Ajuste Rápido de Stock"
                          className="p-1 text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                        >
                          <Layers size={14} />
                        </button>
                        
                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Editar Artigo"
                          className="p-1 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            if (onShowConfirm) {
                              onShowConfirm(
                                "Eliminar Artigo",
                                `Tem a certeza de que deseja eliminar definitivamente o produto "${item.name}"? Esta ação removerá o artigo de todos os armazéns e inventários.`,
                                () => onDeleteItem(item.id),
                                true
                              );
                            } else if (confirm(`Tem a certeza que deseja eliminar o produto ${item.name}?`)) {
                              onDeleteItem(item.id);
                            }
                          }}
                          title="Eliminar Artigo"
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Package size={36} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">Nenhum artigo encontrado com os filtros selecionados.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD ARTIGO MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-dark-border shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <h3 className="text-sm font-display font-bold">Registar Novo Artigo Logístico</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitNewItem} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Nome do Artigo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Paracetamol 500mg"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* SKU */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Código SKU (Referência) *</label>
                  <input
                    type="text"
                    required={skuMode === "manual"}
                    disabled={skuMode === "automatico"}
                    placeholder={skuMode === "automatico" ? "Gerado Automaticamente" : "Ex: PRD-00045"}
                    value={skuMode === "automatico" ? "Gerado Automaticamente" : newItem.sku}
                    onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 disabled:opacity-60 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-850 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Barcode */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Código de Barras (EAN)</label>
                  <input
                    type="text"
                    placeholder="Ex: 5601234567890"
                    value={newItem.barcode}
                    onChange={(e) => setNewItem({ ...newItem, barcode: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Categoria</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 cursor-pointer"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Logistics Unit */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Unidade Logística</label>
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 cursor-pointer"
                  >
                    {unitsList.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                {/* Warehouse */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Armazém de Entrada</label>
                  <select
                    value={newItem.warehouse}
                    onChange={(e) => setNewItem({ ...newItem, warehouse: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500"
                  >
                    {warehouses.map(wh => (
                      <option key={wh.id} value={wh.name}>{wh.name}</option>
                    ))}
                  </select>
                </div>

                {/* Location Inside Warehouse */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Localização Específica</label>
                  <input
                    type="text"
                    placeholder="Ex: Corredor A - Prateleira 2"
                    value={newItem.location}
                    onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Current stock qty & min/max */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Stock Inicial (Disponível)</label>
                  <input
                    type="number"
                    value={newItem.currentStock}
                    onChange={(e) => setNewItem({ ...newItem, currentStock: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Min Stock level */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Nível Mínimo de Alerta</label>
                  <input
                    type="number"
                    value={newItem.minStock}
                    onChange={(e) => setNewItem({ ...newItem, minStock: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Max Stock level */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Capacidade Máxima</label>
                  <input
                    type="number"
                    value={newItem.maxStock}
                    onChange={(e) => setNewItem({ ...newItem, maxStock: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Price in Kwanza */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Preço Unitário (AOA)</label>
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Lot Number */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Número do Lote</label>
                  <input
                    type="text"
                    placeholder="Ex: L260012"
                    value={newItem.lot}
                    onChange={(e) => setNewItem({ ...newItem, lot: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Expiry Date */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Data de Validade (Opcional)</label>
                  <input
                    type="date"
                    value={newItem.expiryDate}
                    onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                >
                  Confirmar Artigo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ARTIGO MODAL */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-dark-border shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <h3 className="text-sm font-display font-bold">Editar Artigo: {editingItem.name}</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitEditItem} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Nome do Artigo *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* SKU */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Referência SKU *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.sku}
                    onChange={(e) => setEditingItem({ ...editingItem, sku: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500"
                    disabled
                  />
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Preço Unitário (AOA)</label>
                  <input
                    type="number"
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-880 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Localização Específica</label>
                  <input
                    type="text"
                    value={editingItem.location}
                    onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Categoria</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 cursor-pointer"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Logistics Unit */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Unidade Logística</label>
                  <select
                    value={editingItem.unit}
                    onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 cursor-pointer"
                  >
                    {unitsList.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                {/* Min Stock */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Nível Mínimo</label>
                  <input
                    type="number"
                    value={editingItem.minStock}
                    onChange={(e) => setEditingItem({ ...editingItem, minStock: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Max Stock */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Nível Máximo</label>
                  <input
                    type="number"
                    value={editingItem.maxStock}
                    onChange={(e) => setEditingItem({ ...editingItem, maxStock: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Lot */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Número de Lote</label>
                  <input
                    type="text"
                    value={editingItem.lot}
                    onChange={(e) => setEditingItem({ ...editingItem, lot: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Expiry Date */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Data de Validade</label>
                  <input
                    type="date"
                    value={editingItem.expiryDate || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, expiryDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                >
                  Guardar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK STOCK ADJUSTMENT MODAL */}
      {isAdjustModalOpen && adjustingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-dark-border shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <h3 className="text-sm font-display font-bold flex items-center gap-1">
                <Layers size={16} /> Ajuste de Stock: {adjustingItem.name}
              </h3>
              <button 
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitAdjustment} className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg text-xs space-y-1 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Stock Atual:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{adjustingItem.currentStock} {adjustingItem.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Armazém:</span>
                  <span className="font-semibold">{adjustingItem.warehouse}</span>
                </div>
                <div className="flex justify-between">
                  <span>Preço:</span>
                  <span className="font-semibold">{adjustingItem.price.toLocaleString()} AOA</span>
                </div>
              </div>

              {/* Adjustment type Selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Tipo de Movimentação</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType("entrada")}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                      adjustType === "entrada"
                        ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                        : "border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    <ArrowUpRight size={14} />
                    <span>Entrada (+)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType("saida")}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                      adjustType === "saida"
                        ? "bg-red-50 dark:bg-red-950/20 border-red-500 text-red-700 dark:text-red-400"
                        : "border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    <ArrowDownLeft size={14} />
                    <span>Saída (-)</span>
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Quantidade a Ajustar ({adjustingItem.unit})</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>

              {/* Justification note */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Justificação / Nota de Auditoria</label>
                <input
                  type="text"
                  required
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="Ex: Regularização de inventário mensal"
                  className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                    adjustType === "entrada" 
                      ? "bg-emerald-600 hover:bg-emerald-700" 
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  Registrar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
