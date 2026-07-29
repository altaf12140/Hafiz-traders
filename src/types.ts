export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'credit' | 'split';

export type ProductUnit = 'pcs' | 'kg' | 'bag' | 'box' | 'meter' | 'liter' | 'pack' | 'dozen';

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  unit: ProductUnit;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStockAlert: number;
  supplierId?: string;
  image?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  unit: ProductUnit;
  quantity: number;
  costPrice: number;
  unitPrice: number;
  discount: number; // Flat discount per item
  total: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number; // Bill-level extra discount
  grandTotal: number;
  paidAmount: number;
  balanceDue: number; // Credit / Khata amount remaining
  paymentMethod: PaymentMethod;
  notes?: string;
  date: string; // ISO String
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  creditLimit: number;
  currentBalance: number; // Outstanding amount customer owes to Hafiz Traders (Positive = Customer owes us)
  notes?: string;
  createdAt: string;
}

export interface CustomerPayment {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque';
  referenceNo?: string;
  date: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  currentBalance: number; // Balance we owe to supplier (Positive = We owe supplier)
  notes?: string;
  createdAt: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  sku: string;
  unit: ProductUnit;
  quantity: number;
  costPrice: number;
  total: number;
}

export interface Purchase {
  id: string;
  purchaseNo: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  date: string;
  referenceInvoiceNo?: string;
  notes?: string;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque';
  referenceNo?: string;
  date: string;
  notes?: string;
}

export interface Expense {
  id: string;
  category: 'rent' | 'electricity' | 'salaries' | 'transport' | 'packaging' | 'maintenance' | 'tea_snacks' | 'marketing' | 'other';
  title: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer';
  date: string;
  notes?: string;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  previousStock: number;
  newStock: number;
  quantityChange: number; // positive or negative
  reason: 'restock' | 'damaged' | 'audit_correction' | 'return' | 'other';
  notes?: string;
  date: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  phone: string;
  secondaryPhone?: string;
  email?: string;
  easypaisaNumber?: string;
  address: string;
  city: string;
  taxRegistrationNo: string; // GST/NTN
  currencySymbol: string;
  currencyCode: string;
  defaultTaxRate: number; // e.g., 0 or 5 or 17
  receiptFooterNote: string;
  receiptType: 'thermal' | 'a4';
  enableLowStockAlerts: boolean;
}

export interface CustomerFeedback {
  id: string;
  customerName: string;
  customerPhone?: string;
  rating: number; // 1 to 5
  feedbackType: 'complaint' | 'suggestion' | 'appreciation' | 'general';
  message: string;
  date: string;
  status: 'pending' | 'resolved';
}

export type ActiveTab = 'pos' | 'inventory' | 'sales' | 'customers' | 'suppliers' | 'expenses' | 'reports' | 'feedback' | 'copilot' | 'settings';
