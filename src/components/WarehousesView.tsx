import React, { useState } from "react";
import { 
  Building, 
  MapPin, 
  User, 
  Phone, 
  Package, 
  Coins, 
  Plus, 
  X, 
  UserPlus, 
  Shield, 
  Trash2, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  Mail, 
  UserCheck,
  Pencil 
} from "lucide-react";
import { Warehouse, StockItem, UserRole } from "../types";

interface WarehousesViewProps {
  warehouses: Warehouse[];
  items: StockItem[];
  setWarehouses?: React.Dispatch<React.SetStateAction<Warehouse[]>>;
  users?: UserRole[];
  setUsers?: React.Dispatch<React.SetStateAction<UserRole[]>>;
  currentUser?: UserRole | null;
  onShowConfirm?: (title: string, message: string, onConfirm: () => void, isDestructive?: boolean) => void;
}

export default function WarehousesView({ 
  warehouses, 
  items, 
  setWarehouses, 
  users = [], 
  setUsers, 
  currentUser,
  onShowConfirm
}: WarehousesViewProps) {
  const [expandedWarehouse, setExpandedWarehouse] = useState<string | null>(null);
  const [showAddWarehouseModal, setShowAddWarehouseModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [expandedOperators, setExpandedOperators] = useState<{[key: string]: boolean}>({});
  const [expandedStock, setExpandedStock] = useState<{[key: string]: boolean}>({});

  const toggleOperators = (id: string) => {
    setExpandedOperators(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStock = (id: string) => {
    setExpandedStock(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Form states for new Warehouse
  const [whId, setWhId] = useState("");
  const [whName, setWhName] = useState("");
  const [whLocation, setWhLocation] = useState("Luanda");
  const [whManager, setWhManager] = useState("");
  const [whContact, setWhContact] = useState("");
  const [whError, setWhError] = useState("");

  // Form states for editing Warehouse
  const [showEditWarehouseModal, setShowEditWarehouseModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [editWhName, setEditWhName] = useState("");
  const [editWhLocation, setEditWhLocation] = useState("Luanda");
  const [editWhManager, setEditWhManager] = useState("");
  const [editWhContact, setEditWhContact] = useState("");
  const [editWhError, setEditWhError] = useState("");

  const handleStartEditWarehouse = (wh: Warehouse, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingWarehouse(wh);
    setEditWhName(wh.name);
    setEditWhLocation(wh.location);
    setEditWhManager(wh.manager);
    setEditWhContact(wh.contact);
    setEditWhError("");
    setShowEditWarehouseModal(true);
  };

  const handleEditWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    setEditWhError("");

    if (!editWhName.trim() || !editWhManager.trim() || !editWhContact.trim()) {
      setEditWhError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (setWarehouses && editingWarehouse) {
      setWarehouses(prev => prev.map(w => {
        if (w.id === editingWarehouse.id) {
          return {
            ...w,
            name: editWhName.trim(),
            location: editWhLocation,
            manager: editWhManager.trim(),
            contact: editWhContact.trim()
          };
        }
        return w;
      }));
      setShowEditWarehouseModal(false);
      setEditingWarehouse(null);
    }
  };

  const handleDeleteWarehouse = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Verify if there are items associated with this warehouse
    const whItems = items.filter(
      item => item.warehouse.toLowerCase().includes(name.split(" (")[0].toLowerCase())
    );
    if (whItems.length > 0) {
      alert(`Não é possível eliminar a filial "${name}" porque existem ${whItems.length} artigos associados a ela no inventário. Remova ou transfira os artigos primeiro.`);
      return;
    }

    const performDelete = () => {
      if (setWarehouses) {
        setWarehouses(prev => prev.filter(w => w.id !== id));
      }
    };

    if (onShowConfirm) {
      onShowConfirm(
        "Eliminar Filial",
        `Tem a certeza absoluta de que deseja eliminar a filial "${name}"? Esta ação removerá permanentemente o armazém do sistema de logística.`,
        performDelete,
        true
      );
    } else if (confirm(`Tem a certeza absoluta que deseja eliminar a filial "${name}"?`)) {
      performDelete();
    }
  };

  // Form states for new Operator
  const [usrUsername, setUsrUsername] = useState("");
  const [usrName, setUsrName] = useState("");
  const [usrEmail, setUsrEmail] = useState("");
  const [usrStore, setUsrStore] = useState("");
  const [usrError, setUsrError] = useState("");

  const toggleExpand = (id: string) => {
    setExpandedWarehouse(prev => prev === id ? null : id);
  };

  const isAdmin = currentUser?.role === "admin";

  // Handle adding new store/location
  const handleAddWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    setWhError("");

    if (!whId.trim() || !whName.trim() || !whManager.trim() || !whContact.trim()) {
      setWhError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const cleanId = whId.trim().toUpperCase();
    if (warehouses.some(w => w.id === cleanId)) {
      setWhError("Já existe uma filial com este ID/Código.");
      return;
    }

    const newWh: Warehouse = {
      id: cleanId,
      name: whName.trim(),
      location: whLocation,
      manager: whManager.trim(),
      contact: whContact.trim()
    };

    if (setWarehouses) {
      setWarehouses(prev => [...prev, newWh]);
    }

    // Reset and close
    setWhId("");
    setWhName("");
    setWhLocation("Luanda");
    setWhManager("");
    setWhContact("");
    setShowAddWarehouseModal(false);
  };

  // Handle adding new operator/user
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUsrError("");

    if (!usrUsername.trim() || !usrName.trim() || !usrEmail.trim()) {
      setUsrError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const cleanUsername = usrUsername.trim().toLowerCase();
    if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
      setUsrError("Este nome de utilizador já se encontra registado.");
      return;
    }

    // Extract initials for avatar
    const nameParts = usrName.trim().split(" ");
    const initials = nameParts.length > 1 
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : nameParts[0].substring(0, 2).toUpperCase();

    const newUser: UserRole = {
      username: cleanUsername,
      name: usrName.trim(),
      role: "operador",
      email: usrEmail.trim().toLowerCase(),
      avatar: initials,
      assignedStore: usrStore || undefined
    };

    if (setUsers) {
      setUsers(prev => [...prev, newUser]);
    }

    // Reset and close
    setUsrUsername("");
    setUsrName("");
    setUsrEmail("");
    setUsrStore("");
    setShowAddUserModal(false);
  };

  // Change user assignment
  const handleAssignUser = (username: string, storeName: string | undefined) => {
    if (setUsers) {
      setUsers(prev => prev.map(u => {
        if (u.username === username) {
          return { ...u, assignedStore: storeName };
        }
        return u;
      }));
    }
  };

  // Delete/Remove operator
  const handleDeleteUser = (username: string) => {
    if (username === "admin") return; // Keep master admin safe
    if (setUsers) {
      setUsers(prev => prev.filter(u => u.username !== username));
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-white">
            Rede Integrada de Lojas & Filiais AMADJE
          </h2>
          <p className="text-xs text-slate-500">
            Supervisione múltiplas localizações no território angolano, responsáveis locais e atribuição de operadores por estabelecimento.
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowAddWarehouseModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              <Plus size={14} />
              <span>Registar Filial</span>
            </button>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all border border-slate-700 shadow-xs"
            >
              <UserPlus size={14} />
              <span>Criar Operador</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid of Warehouses */}
      <div className="grid grid-cols-1 gap-4">
        {warehouses.map(wh => {
          // Filter items belonging to this warehouse
          const whItems = items.filter(
            item => item.warehouse.toLowerCase().includes(wh.name.split(" (")[0].toLowerCase())
          );

          // Get operators assigned to this warehouse
          const assignedOperators = users.filter(
            u => u.assignedStore === wh.name || (u.assignedStore && u.assignedStore.toLowerCase().includes(wh.name.toLowerCase()))
          );

          const totalUnits = whItems.reduce((sum, item) => sum + item.currentStock, 0);
          const totalValue = whItems.reduce((sum, item) => sum + (item.currentStock * item.price), 0);
          const criticalItemsCount = whItems.filter(item => item.currentStock <= item.minStock).length;
          
          const maxCapacity = 5000;
          const capacityPercentage = Math.min(Math.round((totalUnits / maxCapacity) * 100), 100);
          const isExpanded = expandedWarehouse === wh.id;

          return (
            <div 
              key={wh.id} 
              className="bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border shadow-xs overflow-hidden transition-all duration-200"
              id={`warehouse-${wh.id.toLowerCase()}`}
            >
              {/* Warehouse Header Bar */}
              <div 
                onClick={() => toggleExpand(wh.id)}
                className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/40 dark:hover:bg-slate-800/20 select-none"
              >
                {/* Logo & Basic details */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 rounded-xl flex-shrink-0">
                    <Building size={24} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm md:text-base">
                        {wh.name}
                      </h3>
                      <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">
                        {wh.id}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <MapPin size={13} className="text-slate-400" />
                      <span>{wh.location}</span>
                    </div>
                  </div>
                </div>

                {/* Performance indicators */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 flex-1 lg:ml-8">
                  {/* Stock metrics */}
                  <div className="space-y-0.5">
                    <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                      <Package size={10} />
                      <span>Stock Total</span>
                    </div>
                    <div className="font-mono text-xs md:text-sm font-bold text-slate-800 dark:text-white">
                      {totalUnits.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">UN</span>
                    </div>
                  </div>

                  {/* Stock value */}
                  <div className="space-y-0.5">
                    <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                      <Coins size={10} />
                      <span>Valor Líquido</span>
                    </div>
                    <div className="font-mono text-xs md:text-sm font-bold text-slate-800 dark:text-white">
                      {totalValue.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">AOA</span>
                    </div>
                  </div>

                  {/* Operator Count */}
                  <div className="space-y-0.5">
                    <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                      <User size={10} />
                      <span>Operadores</span>
                    </div>
                    <div className="font-mono text-xs md:text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <span>{assignedOperators.length}</span>
                      <span className="text-[9px] bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 px-1.5 py-0.2 rounded font-sans font-semibold">Ativos</span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="col-span-2 md:col-span-1 space-y-1">
                    <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Ocupação</span>
                      <span className="font-mono font-semibold text-[10px]">{capacityPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          capacityPercentage > 85 ? "bg-red-500" : capacityPercentage > 60 ? "bg-amber-500" : "bg-brand-500"
                        }`} 
                        style={{ width: `${capacityPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Admin actions (Edit & Delete) */}
                {isAdmin && (
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleStartEditWarehouse(wh, e)}
                      className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Editar Filial"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteWarehouse(wh.id, wh.name, e)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar Filial"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}

                {/* Expand toggler button */}
                <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>

              {/* Collapsible expanded detail panel */}
              {isExpanded && (
                <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/10 p-5 space-y-6 animate-in slide-in-from-top-1 duration-150">
                  
                  {/* Row 1: Warehouse Details & Contacts */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-200 dark:border-slate-850 pb-4">
                    <div className="flex items-center space-x-2 text-xs">
                      <User size={14} className="text-slate-400 shrink-0" />
                      <span className="text-slate-500">Diretor / Responsável:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{wh.manager}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <Phone size={14} className="text-slate-400 shrink-0" />
                      <span className="text-slate-500">Contacto Interno:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">{wh.contact}</span>
                    </div>
                    {criticalItemsCount > 0 && (
                      <div className="flex items-center space-x-2 text-xs text-amber-600 dark:text-amber-400">
                        <ShieldAlert size={14} className="shrink-0" />
                        <span className="font-semibold">{criticalItemsCount} artigos em nível crítico</span>
                      </div>
                    )}
                  </div>

                  {/* Accordion buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Toggle Button for Operators */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleOperators(wh.id); }}
                      className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-all text-left text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <UserCheck size={16} className="text-brand-500" />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">Operadores da Filial</p>
                          <p className="text-[10px] text-slate-400 font-normal">{assignedOperators.length} operadores ativos</p>
                        </div>
                      </div>
                      <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${expandedOperators[wh.id] ? "rotate-180" : ""}`} />
                    </button>

                    {/* Toggle Button for Stock List */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleStock(wh.id); }}
                      className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-all text-left text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Package size={16} className="text-emerald-500" />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">Inventário Alocado no Local</p>
                          <p className="text-[10px] text-slate-400 font-normal">{whItems.length} referências de stock</p>
                        </div>
                      </div>
                      <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${expandedStock[wh.id] ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  {/* Sub-Collapsible Content: Operator Management Block */}
                  {expandedOperators[wh.id] && (
                    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-150 dark:border-slate-850 space-y-4 animate-in slide-in-from-top-1 duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserCheck size={16} className="text-brand-500" />
                          <h4 className="text-xs font-display font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                            Operadores Associados a esta Filial
                          </h4>
                        </div>
                        
                        {isAdmin && (
                          <div className="text-[10px] text-slate-500">
                            Utilize o botão "Criar Operador" no topo para adicionar novos
                          </div>
                        )}
                      </div>

                      {assignedOperators.length === 0 ? (
                        <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                          <User size={24} className="mx-auto text-slate-400 mb-2 opacity-60" />
                          <p className="text-xs text-slate-500">Nenhum operador exclusivo atribuído a esta filial.</p>
                          {isAdmin && (
                            <p className="text-[10px] text-slate-400 mt-1">Os administradores globais gerem todo o stock.</p>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {assignedOperators.map(op => (
                            <div 
                              key={op.username}
                              className="bg-white dark:bg-dark-surface p-3 rounded-lg border border-slate-200 dark:border-dark-border flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center shrink-0 border border-slate-700 uppercase">
                                  {op.avatar}
                                </div>
                                <div className="overflow-hidden">
                                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate leading-snug">{op.name}</p>
                                  <p className="text-[9px] text-slate-400 font-mono truncate">{op.email}</p>
                                </div>
                              </div>

                              {isAdmin && (
                                <button
                                  onClick={() => handleAssignUser(op.username, undefined)}
                                  title="Desassociar desta filial"
                                  className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors shrink-0"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Quick Assignment Dropdown */}
                      {isAdmin && users.filter(u => u.role === "operador" && !u.assignedStore).length > 0 && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                          <span className="text-[11px] text-slate-500">Atribuir operador disponível a esta filial:</span>
                          <div className="flex gap-2">
                            <select
                              id={`assign-select-${wh.id}`}
                              className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg text-xs px-2.5 py-1.5 focus:outline-hidden text-slate-700 dark:text-slate-300"
                              defaultValue=""
                              onChange={(e) => {
                                const selectedVal = e.target.value;
                                if (selectedVal) {
                                  handleAssignUser(selectedVal, wh.name);
                                  e.target.value = "";
                                }
                              }}
                            >
                              <option value="" disabled>Seleccionar operador...</option>
                              {users
                                .filter(u => u.role === "operador" && !u.assignedStore)
                                .map(u => (
                                  <option key={u.username} value={u.username}>
                                    {u.name} ({u.username})
                                  </option>
                                ))
                              }
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-Collapsible Content: Stock list inside this Warehouse */}
                  {expandedStock[wh.id] && (
                    <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-slate-200 dark:border-dark-border space-y-4 animate-in slide-in-from-top-1 duration-200">
                      <h4 className="text-xs font-display font-bold text-slate-800 dark:text-slate-300 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                        <Package size={14} className="text-slate-400" />
                        <span>Inventário Alocado no Local ({wh.name})</span>
                      </h4>
                      {whItems.length === 0 ? (
                        <p className="text-xs text-slate-400 py-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                          Nenhum artigo registado neste estabelecimento de momento.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {whItems.map(item => {
                            const isLow = item.currentStock <= item.minStock && item.currentStock > 0;
                            const isOut = item.currentStock === 0;

                            return (
                              <div 
                                key={item.id} 
                                className={`bg-white dark:bg-dark-surface p-3 rounded-lg border text-xs flex justify-between items-center ${
                                  isOut 
                                    ? "border-red-200 dark:border-red-950/40 bg-red-50/20" 
                                    : isLow 
                                    ? "border-amber-200 dark:border-amber-950/40 bg-amber-50/20" 
                                    : "border-slate-100 dark:border-dark-border"
                                }`}
                              >
                                <div className="space-y-1">
                                  <div className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</div>
                                  <div className="text-[10px] font-mono text-slate-400">SKU: {item.sku}</div>
                                  <div className="text-[10px] text-slate-500">Prat: {item.location}</div>
                                </div>
                                <div className="text-right space-y-1">
                                  <div className={`font-mono font-bold ${
                                    isOut ? "text-red-500" : isLow ? "text-amber-500" : "text-slate-700 dark:text-slate-300"
                                  }`}>
                                    {item.currentStock} {item.unit}
                                  </div>
                                  <div className="text-[9px] font-mono text-slate-400">
                                    {item.price.toLocaleString()} AOA
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL 1: REGISTER NEW WAREHOUSE / FILIAL */}
      {showAddWarehouseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-left animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Building size={18} className="text-brand-500" />
                <span>Registar Nova Filial</span>
              </h3>
              <button 
                onClick={() => setShowAddWarehouseModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddWarehouse} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Código / ID</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: WH-CABINDA"
                    value={whId}
                    onChange={(e) => setWhId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Localização (Província)</label>
                  <select
                    value={whLocation}
                    onChange={(e) => setWhLocation(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-brand-500"
                  >
                    <option value="Luanda">Luanda</option>
                    <option value="Benguela">Benguela</option>
                    <option value="Lobito">Lobito</option>
                    <option value="Cabinda">Cabinda</option>
                    <option value="Huambo">Huambo</option>
                    <option value="Lubango">Lubango</option>
                    <option value="Namibe">Namibe</option>
                    <option value="Malanje">Malanje</option>
                    <option value="Soyo">Soyo</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nome Oficial da Filial</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Loja Cabinda Centro"
                  value={whName}
                  onChange={(e) => setWhName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Responsável local</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Amílcar Neto"
                    value={whManager}
                    onChange={(e) => setWhManager(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contacto telefónico</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: +244 923 000 000"
                    value={whContact}
                    onChange={(e) => setWhContact(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-brand-500"
                  />
                </div>
              </div>

              {whError && (
                <p className="text-[11px] text-red-500">{whError}</p>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddWarehouseModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-bold transition-all"
                >
                  Gravar Filial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTER NEW OPERATOR */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-left animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <UserPlus size={18} className="text-brand-500" />
                <span>Criar Novo Operador de Stock</span>
              </h3>
              <button 
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Utilizador (Username para login)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: joao.silva"
                  value={usrUsername}
                  onChange={(e) => setUsrUsername(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-brand-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João Silva"
                  value={usrName}
                  onChange={(e) => setUsrName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Correio Eletrónico (E-mail)</label>
                <input
                  type="email"
                  required
                  placeholder="Ex: joao@vbsp.ao"
                  value={usrEmail}
                  onChange={(e) => setUsrEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Atribuir a Filial / Loja AMADJE</label>
                <select
                  value={usrStore}
                  onChange={(e) => setUsrStore(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-brand-500"
                >
                  <option value="">Nenhuma (Ficará disponível na lista)</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.name}>{w.name}</option>
                  ))}
                </select>
                <p className="text-[9px] text-slate-400 mt-0.5">O operador poderá fazer login e gerir stock unicamente desta filial atribuída.</p>
              </div>

              {usrError && (
                <p className="text-[11px] text-red-500">{usrError}</p>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-bold transition-all"
                >
                  Criar Operador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT WAREHOUSE / FILIAL */}
      {showEditWarehouseModal && editingWarehouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-left animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Building size={18} className="text-brand-500" />
                <span>Editar Filial ({editingWarehouse.id})</span>
              </h3>
              <button 
                onClick={() => { setShowEditWarehouseModal(false); setEditingWarehouse(null); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditWarehouse} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Localização (Província)</label>
                <select
                  value={editWhLocation}
                  onChange={(e) => setEditWhLocation(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-brand-500"
                >
                  <option value="Luanda">Luanda</option>
                  <option value="Benguela">Benguela</option>
                  <option value="Lobito">Lobito</option>
                  <option value="Cabinda">Cabinda</option>
                  <option value="Huambo">Huambo</option>
                  <option value="Lubango">Lubango</option>
                  <option value="Namibe">Namibe</option>
                  <option value="Malanje">Malanje</option>
                  <option value="Soyo">Soyo</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nome Oficial da Filial</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Loja Cabinda Centro"
                  value={editWhName}
                  onChange={(e) => setEditWhName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Responsável local</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Amílcar Neto"
                    value={editWhManager}
                    onChange={(e) => setEditWhManager(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contacto telefónico</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: +244 923 000 000"
                    value={editWhContact}
                    onChange={(e) => setEditWhContact(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-brand-500"
                  />
                </div>
              </div>

              {editWhError && (
                <p className="text-[11px] text-red-500">{editWhError}</p>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => { setShowEditWarehouseModal(false); setEditingWarehouse(null); }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-bold transition-all animate-pulse"
                >
                  Gravar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
