import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  Phone,
  DollarSign,
  PackageCheck,
  X,
  PlusCircle,
  Trash2,
  Download,
  Calendar
} from 'lucide-react';
import { Supplier, Product, Purchase, SupplierPayment, StoreSettings, PurchaseItem } from '../types';
import { formatCurrency, formatDateTime, generatePurchaseNo, exportToCSV } from '../utils/formatters';

interface SuppliersProps {
  suppliers: Supplier[];
  products: Product[];
  purchases: Purchase[];
  supplierPayments: SupplierPayment[];
  settings: StoreSettings;
  onAddSupplier: (supplier: Supplier) => void;
  onRecordPurchase: (purchase: Purchase) => void;
  onRecordSupplierPayment: (payment: SupplierPayment) => void;
}

export const Suppliers: React.FC<SuppliersProps> = ({
  suppliers,
  products,
  purchases,
  supplierPayments,
  settings,
  onAddSupplier,
  onRecordPurchase,
  onRecordSupplierPayment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isNewPurchaseOpen, setIsNewPurchaseOpen] = useState(false);
  const [isPaySupplierOpen, setIsPaySupplierOpen] = useState(false);
  const [selectedSupplierForPayment, setSelectedSupplierForPayment] = useState<Supplier | null>(null);

  // Form State for Supplier
  const [supplierFormData, setSupplierFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  // Purchase Order Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [paidAmountInput, setPaidAmountInput] = useState('');
  const [referenceInvoiceNo, setReferenceInvoiceNo] = useState('');
  const [purchaseNotes, setPurchaseNotes] = useState('');

  // Supplier Payment Form State
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<SupplierPayment['paymentMethod']>('bank_transfer');
  const [paymentRefNo, setPaymentRefNo] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Total Payables
  const totalPayables = useMemo(() => {
    return suppliers.reduce((acc, s) => acc + (s.currentBalance > 0 ? s.currentBalance : 0), 0);
  }, [suppliers]);

  // Filtered Suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s =>
      s.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery)
    );
  }, [suppliers, searchQuery]);

  // Handle Add Supplier
  const handleAddSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierFormData.companyName.trim()) return;

    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      companyName: supplierFormData.companyName,
      contactPerson: supplierFormData.contactPerson,
      phone: supplierFormData.phone,
      email: supplierFormData.email || undefined,
      address: supplierFormData.address || undefined,
      currentBalance: 0,
      notes: supplierFormData.notes || undefined,
      createdAt: new Date().toISOString(),
    };

    onAddSupplier(newSup);
    setIsAddSupplierOpen(false);
  };

  // Add Item to Purchase Order Cart
  const addProductToPurchase = (product: Product) => {
    setPurchaseItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.costPrice }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          unit: product.unit,
          quantity: 1,
          costPrice: product.costPrice,
          total: product.costPrice,
        },
      ];
    });
  };

  const updatePurchaseItemQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setPurchaseItems(prev => prev.filter(i => i.productId !== productId));
      return;
    }
    setPurchaseItems(prev =>
      prev.map(i => (i.productId === productId ? { ...i, quantity: qty, total: qty * i.costPrice } : i))
    );
  };

  const updatePurchaseItemCost = (productId: string, cost: number) => {
    setPurchaseItems(prev =>
      prev.map(i => (i.productId === productId ? { ...i, costPrice: cost, total: i.quantity * cost } : i))
    );
  };

  const totalPurchaseAmount = useMemo(() => {
    return purchaseItems.reduce((acc, i) => acc + i.total, 0);
  }, [purchaseItems]);

  // Submit Purchase Order
  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || purchaseItems.length === 0) return;

    const supplier = suppliers.find(s => s.id === selectedSupplierId);
    if (!supplier) return;

    const paid = parseFloat(paidAmountInput) || 0;
    const balanceDue = Math.max(0, totalPurchaseAmount - paid);

    const purchase: Purchase = {
      id: `pur-${Date.now()}`,
      purchaseNo: generatePurchaseNo(purchases.length),
      supplierId: supplier.id,
      supplierName: supplier.companyName,
      items: purchaseItems,
      totalAmount: totalPurchaseAmount,
      paidAmount: paid,
      balanceDue,
      date: new Date().toISOString(),
      referenceInvoiceNo: referenceInvoiceNo || undefined,
      notes: purchaseNotes || undefined,
    };

    onRecordPurchase(purchase);
    setIsNewPurchaseOpen(false);
    setPurchaseItems([]);
    setPaidAmountInput('');
    setReferenceInvoiceNo('');
    setPurchaseNotes('');
  };

  // Submit Payment to Supplier
  const handlePaySupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierForPayment || paymentAmount <= 0) return;

    const payment: SupplierPayment = {
      id: `spay-${Date.now()}`,
      supplierId: selectedSupplierForPayment.id,
      supplierName: selectedSupplierForPayment.companyName,
      amount: paymentAmount,
      paymentMethod,
      referenceNo: paymentRefNo || undefined,
      date: new Date().toISOString(),
      notes: paymentNotes || undefined,
    };

    onRecordSupplierPayment(payment);
    setIsPaySupplierOpen(false);
  };

  const handleExportCSV = () => {
    const rows = suppliers.map(s => ({
      'Supplier ID': s.id,
      'Company Name': s.companyName,
      'Contact Person': s.contactPerson,
      'Phone': s.phone,
      'Address': s.address || '',
      'Outstanding Balance We Owe': s.currentBalance,
    }));
    exportToCSV(`Hafiz_Traders_Suppliers_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold tracking-tight">Suppliers & Purchase Management</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Manage vendor shipments, restock inventory, and record supplier payments.
          </p>
        </div>

        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl px-5 py-3 text-right">
          <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-bold block">
            Total Supplier Payables (We Owe)
          </span>
          <span className="text-2xl font-black text-indigo-200">
            {formatCurrency(totalPayables, settings.currencySymbol)}
          </span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="relative flex-1 w-full md:w-auto min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search suppliers by name or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 border border-slate-200"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={() => {
              setSupplierFormData({
                companyName: '',
                contactPerson: '',
                phone: '',
                email: '',
                address: '',
                notes: '',
              });
              setIsAddSupplierOpen(true);
            }}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Supplier
          </button>
          <button
            onClick={() => {
              setSelectedSupplierId(suppliers[0]?.id || '');
              setIsNewPurchaseOpen(true);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm shadow-indigo-600/20"
          >
            <PackageCheck className="w-4 h-4" /> New Purchase Order
          </button>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map(s => {
          const hasBalance = s.currentBalance > 0;

          return (
            <div
              key={s.id}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900 text-sm">{s.companyName}</h4>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {s.contactPerson}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{s.phone}</span>
                  </div>
                  {s.address && <p className="text-[11px] text-slate-500 line-clamp-1">{s.address}</p>}
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Payable Balance (We Owe)
                    </span>
                    <span className={`text-lg font-black ${hasBalance ? 'text-blue-700' : 'text-slate-700'}`}>
                      {formatCurrency(s.currentBalance, settings.currencySymbol)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setSelectedSupplierForPayment(s);
                    setPaymentAmount(s.currentBalance);
                    setPaymentMethod('bank_transfer');
                    setPaymentRefNo('');
                    setPaymentNotes(`Payment to ${s.companyName}`);
                    setIsPaySupplierOpen(true);
                  }}
                  disabled={s.currentBalance <= 0}
                  className={`w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${
                    s.currentBalance <= 0
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" /> Pay Supplier Balance
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Purchase Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-bold text-slate-900 text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>Recent Purchase Orders (Inventory Restock Log)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3 font-semibold">PO Number</th>
                <th className="p-3 font-semibold">Supplier Name</th>
                <th className="p-3 font-semibold">Date</th>
                <th className="p-3 font-semibold text-center">Items Count</th>
                <th className="p-3 font-semibold text-right">Total Amount</th>
                <th className="p-3 font-semibold text-right">Paid Amount</th>
                <th className="p-3 font-semibold text-right">Balance Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    No purchase orders recorded yet.
                  </td>
                </tr>
              ) : (
                purchases.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-800">{p.purchaseNo}</td>
                    <td className="p-3 font-semibold text-slate-900">{p.supplierName}</td>
                    <td className="p-3 text-slate-500">{formatDateTime(p.date)}</td>
                    <td className="p-3 text-center font-bold">{p.items.length} items</td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      {formatCurrency(p.totalAmount, settings.currencySymbol)}
                    </td>
                    <td className="p-3 text-right font-medium text-emerald-700">
                      {formatCurrency(p.paidAmount, settings.currencySymbol)}
                    </td>
                    <td className="p-3 text-right font-bold text-blue-700">
                      {formatCurrency(p.balanceDue, settings.currencySymbol)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD SUPPLIER MODAL */}
      {isAddSupplierOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add New Supplier</h3>
              <button onClick={() => setIsAddSupplierOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSupplierSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Company / Mill Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Baraka Rice & Grain Mills"
                  value={supplierFormData.companyName}
                  onChange={e => setSupplierFormData({ ...supplierFormData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Sheikh Bilal"
                    value={supplierFormData.contactPerson}
                    onChange={e => setSupplierFormData({ ...supplierFormData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+92 300 1234567"
                    value={supplierFormData.phone}
                    onChange={e => setSupplierFormData({ ...supplierFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Industrial Area, City..."
                  value={supplierFormData.address}
                  onChange={e => setSupplierFormData({ ...supplierFormData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW PURCHASE ORDER MODAL */}
      {isNewPurchaseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">New Purchase Order (Restock Stock)</h3>
                <p className="text-xs text-slate-500">
                  Select supplier and add items to increase product inventory automatically.
                </p>
              </div>
              <button onClick={() => setIsNewPurchaseOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePurchaseSubmit} className="space-y-4 text-xs flex-1 flex flex-col overflow-hidden">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Supplier *</label>
                  <select
                    required
                    value={selectedSupplierId}
                    onChange={e => setSelectedSupplierId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-bold text-xs"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.companyName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Supplier Bill / Invoice Ref #</label>
                  <input
                    type="text"
                    placeholder="e.g. MILL-BILL-9921"
                    value={referenceInvoiceNo}
                    onChange={e => setReferenceInvoiceNo(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-mono text-xs"
                  />
                </div>
              </div>

              {/* Add Product Selector */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Click item to add to Purchase Order:</label>
                <div className="flex gap-2 overflow-x-auto pb-1 max-h-24">
                  {products.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addProductToPurchase(p)}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left whitespace-nowrap"
                    >
                      <div className="font-bold text-slate-800">{p.name}</div>
                      <div className="text-[10px] text-slate-500">Cost: {p.costPrice} | Stock: {p.stock}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Purchase Items List */}
              <div className="flex-1 overflow-y-auto border rounded-xl p-3 space-y-2 bg-slate-50">
                <h5 className="font-bold text-slate-700 uppercase text-[10px]">Purchase Items List</h5>
                {purchaseItems.length === 0 ? (
                  <p className="text-slate-400 text-center py-6">No items added to purchase order yet.</p>
                ) : (
                  purchaseItems.map(item => (
                    <div key={item.productId} className="bg-white p-2.5 rounded-lg border flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-slate-900 block truncate">{item.productName}</span>
                        <span className="text-[10px] text-slate-400">SKU: {item.sku}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Qty</span>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={e => updatePurchaseItemQty(item.productId, parseInt(e.target.value) || 1)}
                            className="w-14 px-1.5 py-1 border rounded text-xs font-bold text-center"
                          />
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 block">Cost Price</span>
                          <input
                            type="number"
                            min={0}
                            value={item.costPrice}
                            onChange={e => updatePurchaseItemCost(item.productId, parseFloat(e.target.value) || 0)}
                            className="w-20 px-1.5 py-1 border rounded text-xs font-bold text-right"
                          />
                        </div>

                        <div className="text-right w-24">
                          <span className="text-[10px] text-slate-400 block">Total</span>
                          <span className="font-bold text-slate-900">
                            {formatCurrency(item.total, settings.currencySymbol)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => updatePurchaseItemQty(item.productId, 0)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totals & Paid Input */}
              <div className="bg-slate-100 p-3 rounded-xl space-y-2">
                <div className="flex justify-between font-black text-sm text-slate-900">
                  <span>Total Purchase Amount:</span>
                  <span className="text-blue-700">{formatCurrency(totalPurchaseAmount, settings.currencySymbol)}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Paid Amount to Supplier Now</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={paidAmountInput}
                      onChange={e => setPaidAmountInput(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg font-bold text-emerald-700 bg-white"
                    />
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-slate-600 block mb-1">Remaining Due Balance</span>
                    <span className="font-black text-sm text-blue-700 block pt-1.5">
                      {formatCurrency(Math.max(0, totalPurchaseAmount - (parseFloat(paidAmountInput) || 0)), settings.currencySymbol)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewPurchaseOpen(false)}
                  className="px-4 py-2 border rounded-lg font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={purchaseItems.length === 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow"
                >
                  Complete & Restock Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAY SUPPLIER MODAL */}
      {isPaySupplierOpen && selectedSupplierForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Record Supplier Payment</h3>
                <p className="text-xs text-slate-500">{selectedSupplierForPayment.companyName}</p>
              </div>
              <button onClick={() => setIsPaySupplierOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaySupplierSubmit} className="space-y-3 text-xs">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex justify-between items-center text-blue-900">
                <span>Current Payable Balance:</span>
                <span className="font-black text-base text-blue-700">
                  {formatCurrency(selectedSupplierForPayment.currentBalance, settings.currencySymbol)}
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Amount Paid ({settings.currencySymbol}) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={paymentAmount || ''}
                  onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg font-black text-slate-900 text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg font-semibold"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ref / Cheque #</label>
                  <input
                    type="text"
                    placeholder="Optional..."
                    value={paymentRefNo}
                    onChange={e => setPaymentRefNo(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notes</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsPaySupplierOpen(false)}
                  className="px-4 py-2 border rounded-lg font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
