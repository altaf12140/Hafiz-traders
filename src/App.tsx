import React, { useState, useEffect, useMemo } from 'react';
import {
  StoreSettings,
  Product,
  Customer,
  Supplier,
  Sale,
  Purchase,
  Expense,
  CustomerPayment,
  SupplierPayment,
  StockAdjustment,
  CustomerFeedback,
  ActiveTab
} from './types';
import { loadState, saveState, resetToDemoData } from './utils/storage';
import { Header } from './components/Header';
import { POS } from './components/POS';
import { Inventory } from './components/Inventory';
import { Sales } from './components/Sales';
import { Customers } from './components/Customers';
import { Suppliers } from './components/Suppliers';
import { Expenses } from './components/Expenses';
import { Reports } from './components/Reports';
import { Feedback } from './components/Feedback';
import { Settings } from './components/Settings';
import { AICopilot } from './components/AICopilot';
import { ReceiptModal } from './components/ReceiptModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');

  // Loaded state
  const initialState = useMemo(() => loadState(), []);

  const [settings, setSettings] = useState<StoreSettings>(initialState.settings);
  const [products, setProducts] = useState<Product[]>(initialState.products);
  const [customers, setCustomers] = useState<Customer[]>(initialState.customers);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialState.suppliers);
  const [sales, setSales] = useState<Sale[]>(initialState.sales);
  const [purchases, setPurchases] = useState<Purchase[]>(initialState.purchases);
  const [expenses, setExpenses] = useState<Expense[]>(initialState.expenses);
  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>(initialState.customerPayments);
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>(initialState.supplierPayments);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(initialState.stockAdjustments);
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>(initialState.feedbacks || []);

  // Active Receipt Modal
  const [activeReceiptSale, setActiveReceiptSale] = useState<Sale | null>(null);
  const [activeReceiptPayment, setActiveReceiptPayment] = useState<CustomerPayment | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    saveState({
      settings,
      products,
      customers,
      suppliers,
      sales,
      purchases,
      expenses,
      customerPayments,
      supplierPayments,
      stockAdjustments,
      feedbacks,
    });
  }, [
    settings,
    products,
    customers,
    suppliers,
    sales,
    purchases,
    expenses,
    customerPayments,
    supplierPayments,
    stockAdjustments,
    feedbacks,
  ]);

  // Derived low stock items
  const lowStockCount = useMemo(() => {
    return products.filter(p => p.stock <= p.minStockAlert).length;
  }, [products]);

  // Total receivables
  const totalReceivables = useMemo(() => {
    return customers.reduce((acc, c) => acc + (c.currentBalance > 0 ? c.currentBalance : 0), 0);
  }, [customers]);

  // Handlers

  // 1. Complete POS Sale
  const handleCompleteSale = (newSale: Sale) => {
    // Add sale
    setSales(prev => [newSale, ...prev]);

    // Decrease inventory stock
    setProducts(prev =>
      prev.map(p => {
        const soldItem = newSale.items.find(i => i.productId === p.id);
        if (soldItem) {
          return {
            ...p,
            stock: Math.max(0, p.stock - soldItem.quantity),
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );

    // If customer selected and balance due > 0, update customer Khata balance
    if (newSale.customerId && newSale.balanceDue > 0) {
      setCustomers(prev =>
        prev.map(c => {
          if (c.id === newSale.customerId) {
            return {
              ...c,
              currentBalance: c.currentBalance + newSale.balanceDue,
            };
          }
          return c;
        })
      );
    }

    // Trigger printable receipt modal
    setActiveReceiptPayment(null);
    setActiveReceiptSale(newSale);
  };

  // 2. Add / Update / Delete Product
  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p)));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleStockAdjustment = (adj: StockAdjustment) => {
    setStockAdjustments(prev => [adj, ...prev]);
    setProducts(prev =>
      prev.map(p => (p.id === adj.productId ? { ...p, stock: adj.newStock, updatedAt: new Date().toISOString() } : p))
    );
  };

  // 3. Add Customer & Collect Khata Payment
  const handleAddCustomer = (newCust: Customer) => {
    setCustomers(prev => [newCust, ...prev]);
  };

  const handleUpdateCustomer = (updatedCust: Customer) => {
    setCustomers(prev => prev.map(c => (c.id === updatedCust.id ? updatedCust : c)));
  };

  const handleRecordCustomerPayment = (payment: CustomerPayment) => {
    setCustomerPayments(prev => [payment, ...prev]);

    // Decrease Customer Khata currentBalance
    setCustomers(prev =>
      prev.map(c => {
        if (c.id === payment.customerId) {
          return {
            ...c,
            currentBalance: Math.max(0, c.currentBalance - payment.amount),
          };
        }
        return c;
      })
    );

    // Trigger payment receipt voucher
    setActiveReceiptSale(null);
    setActiveReceiptPayment(payment);
  };

  // 4. Supplier & Purchases
  const handleAddSupplier = (newSup: Supplier) => {
    setSuppliers(prev => [newSup, ...prev]);
  };

  const handleRecordPurchase = (newPurchase: Purchase) => {
    setPurchases(prev => [newPurchase, ...prev]);

    // Automatically increase inventory stock for purchased items
    setProducts(prev =>
      prev.map(p => {
        const item = newPurchase.items.find(i => i.productId === p.id);
        if (item) {
          return {
            ...p,
            stock: p.stock + item.quantity,
            costPrice: item.costPrice > 0 ? item.costPrice : p.costPrice, // update cost price if provided
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );

    // Increase supplier balance due if unpaid portion remains
    if (newPurchase.balanceDue > 0) {
      setSuppliers(prev =>
        prev.map(s => {
          if (s.id === newPurchase.supplierId) {
            return {
              ...s,
              currentBalance: s.currentBalance + newPurchase.balanceDue,
            };
          }
          return s;
        })
      );
    }
  };

  const handleRecordSupplierPayment = (payment: SupplierPayment) => {
    setSupplierPayments(prev => [payment, ...prev]);
    setSuppliers(prev =>
      prev.map(s => {
        if (s.id === payment.supplierId) {
          return {
            ...s,
            currentBalance: Math.max(0, s.currentBalance - payment.amount),
          };
        }
        return s;
      })
    );
  };

  // 5. Expenses
  const handleAddExpense = (newExp: Expense) => {
    setExpenses(prev => [newExp, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // 6. Customer Feedback
  const handleAddFeedback = (newFb: CustomerFeedback) => {
    setFeedbacks(prev => [newFb, ...prev]);
  };

  const handleUpdateFeedbackStatus = (id: string, status: 'pending' | 'resolved') => {
    setFeedbacks(prev => prev.map(f => (f.id === id ? { ...f, status } : f)));
  };

  // 7. Settings & Data Backup/Restore
  const handleExportBackup = () => {
    const backupObj = {
      settings,
      products,
      customers,
      suppliers,
      sales,
      purchases,
      expenses,
      customerPayments,
      supplierPayments,
      stockAdjustments,
      exportedAt: new Date().toISOString(),
    };

    const jsonStr = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Hafiz_Traders_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const handleImportBackup = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.settings) setSettings(parsed.settings);
      if (parsed.products) setProducts(parsed.products);
      if (parsed.customers) setCustomers(parsed.customers);
      if (parsed.suppliers) setSuppliers(parsed.suppliers);
      if (parsed.sales) setSales(parsed.sales);
      if (parsed.purchases) setPurchases(parsed.purchases);
      if (parsed.expenses) setExpenses(parsed.expenses);
      if (parsed.customerPayments) setCustomerPayments(parsed.customerPayments);
      if (parsed.supplierPayments) setSupplierPayments(parsed.supplierPayments);
      if (parsed.stockAdjustments) setStockAdjustments(parsed.stockAdjustments);

      alert("Backup restored successfully!");
    } catch (err) {
      alert("Invalid backup file format.");
    }
  };

  const handleResetDemo = () => {
    resetToDemoData();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        lowStockCount={lowStockCount}
        totalReceivables={totalReceivables}
        openNewSale={() => setActiveTab('pos')}
      />

      {/* Main Tab Content */}
      <main className="flex-1">
        {activeTab === 'pos' && (
          <POS
            products={products}
            customers={customers}
            settings={settings}
            existingSalesCount={sales.length}
            onCompleteSale={handleCompleteSale}
            onAddNewCustomer={() => setActiveTab('customers')}
          />
        )}

        {activeTab === 'inventory' && (
          <Inventory
            products={products}
            suppliers={suppliers}
            settings={settings}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onStockAdjustment={handleStockAdjustment}
          />
        )}

        {activeTab === 'sales' && (
          <Sales
            sales={sales}
            settings={settings}
            onViewInvoice={sale => {
              setActiveReceiptPayment(null);
              setActiveReceiptSale(sale);
            }}
          />
        )}

        {activeTab === 'customers' && (
          <Customers
            customers={customers}
            sales={sales}
            customerPayments={customerPayments}
            settings={settings}
            onAddCustomer={handleAddCustomer}
            onUpdateCustomer={handleUpdateCustomer}
            onRecordPayment={handleRecordCustomerPayment}
            onViewInvoice={sale => {
              setActiveReceiptPayment(null);
              setActiveReceiptSale(sale);
            }}
          />
        )}

        {activeTab === 'suppliers' && (
          <Suppliers
            suppliers={suppliers}
            products={products}
            purchases={purchases}
            supplierPayments={supplierPayments}
            settings={settings}
            onAddSupplier={handleAddSupplier}
            onRecordPurchase={handleRecordPurchase}
            onRecordSupplierPayment={handleRecordSupplierPayment}
          />
        )}

        {activeTab === 'expenses' && (
          <Expenses
            expenses={expenses}
            settings={settings}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'reports' && (
          <Reports
            sales={sales}
            expenses={expenses}
            products={products}
            customers={customers}
            suppliers={suppliers}
            settings={settings}
          />
        )}

        {activeTab === 'feedback' && (
          <Feedback
            feedbacks={feedbacks}
            settings={settings}
            onAddFeedback={handleAddFeedback}
            onUpdateFeedbackStatus={handleUpdateFeedbackStatus}
          />
        )}

        {activeTab === 'copilot' && (
          <AICopilot
            products={products}
            customers={customers}
            sales={sales}
            expenses={expenses}
            suppliers={suppliers}
            settings={settings}
            onAddFeedback={handleAddFeedback}
          />
        )}

        {activeTab === 'settings' && (
          <Settings
            settings={settings}
            onUpdateSettings={setSettings}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            onResetDemo={handleResetDemo}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-4 px-6 border-t border-slate-800 text-center text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>
            © {new Date().getFullYear()} <strong className="text-white">{settings.storeName}</strong> • Shop Management System
          </span>
          <span className="text-slate-500">
            Powered by Google AI Studio • Fast POS, Inventory & Khata Ledger
          </span>
        </div>
      </footer>

      {/* Print / View Receipt Modal */}
      {(activeReceiptSale || activeReceiptPayment) && (
        <ReceiptModal
          sale={activeReceiptSale}
          customerPayment={activeReceiptPayment}
          settings={settings}
          onClose={() => {
            setActiveReceiptSale(null);
            setActiveReceiptPayment(null);
          }}
        />
      )}
    </div>
  );
}
