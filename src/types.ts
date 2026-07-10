/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StockItem {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  price: number; // Preço médio ou preço de custo em Kwanza (AOA)
  location: string; // ex: "Prateleira A3"
  warehouse: string; // ex: "Armazém Central", "Armazém Luanda"
  lot: string; // Número de Lote
  serialNumber?: string; // Número de série se aplicável
  expiryDate?: string; // Data de validade (YYYY-MM-DD)
  status: "normal" | "critico" | "sem-stock";
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  manager: string;
  contact: string;
}

export interface StockMovement {
  id: string;
  type: "entrada" | "saida" | "transferencia";
  itemId: string;
  itemName: string;
  sku: string;
  fromWarehouse?: string;
  toWarehouse?: string;
  quantity: number;
  date: string; // YYYY-MM-DD HH:mm
  user: string;
  reference: string; // Número da fatura, guia de transporte, etc.
  lot?: string;
  notes?: string;
  voided?: boolean;
}

export interface SAFTInvoiceSim {
  id: string;
  invoiceNo: string;
  customerName: string;
  customerNif: string;
  date: string;
  amount: number;
  taxAmount: number;
  itemsCount: number;
  status: "emitida" | "anulada";
}

export interface AIAnalysisResult {
  text: string;
  loading: boolean;
  error: string | null;
}

export interface UserRole {
  username: string;
  name: string;
  role: "admin" | "operador";
  assignedStore?: string; // Name of assigned store, e.g. "Loja Luanda (Maianga)"
  email: string;
  avatar: string;
}

