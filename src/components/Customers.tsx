import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  DollarSign,
  Phone,
  MessageSquare,
  History,
  CheckCircle2,
  X,
  Send,
  Download,
  FileText
} from 'lucide-react';
import { Customer, CustomerPayment, Sale, StoreSettings } from '../types';
import { formatCurrency, formatDateTime, exportToCSV } from '../utils/formatters';

interface CustomersProps {
  customers: Customer[];
  sales: Sale[];
  customerPayments: CustomerPayment[];
  settings: StoreSettings;
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onRecordPayment: (payment: CustomerPayment) => void;
  onViewInvoice: (sale: Sale) => void;
}

export const Customers: React.FC<CustomersProps> = ({
  customers,
  sales,
  customerPayments,
  settings,
  onAddCustomer,
  onUpdateCustomer,
  onRecordPayment,
  onViewInvoice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [balanceFilter, setBalanceFilter] = useState<'all' | 'due' | 'clear'>('all');

  // Selected customer for Ledger Modal
  const [selectedLedgerCustomer, setSelectedLedgerCustomer] = useState<Customer | null>(null);

  // Modal States
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentCustomer, setPaymentCustomer] = useState<Customer | null>(null);

  // WhatsApp reminder modal state
  const [whatsappCustomer, setWhatsappCustomer] = useState<Customer | null>(null);

  // Customer Add Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    creditLimit: 100000,
    notes: '',
  });

  // Payment Form State
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMethod: 'cash' as CustomerPayment['paymentMethod'],
    referenceNo: '',
    notes: '',
  });

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery);

      let matchesBalance = true;
      if (balanceFilter === 'due') matchesBalance = c.currentBalance > 0;
      if (balanceFilter === 'clear') matchesBalance = c.currentBalance <= 0;

      return matchesSearch && matchesBalance;
    });
  }, [customers, searchQuery, balanceFilter]);

  // Total Receivables
  const totalReceivables = useMemo(() => {
    return customers.reduce((acc, c) => acc + (c.currentBalance > 0 ? c.currentBalance : 0), 0);
  }, [customers]);

  // Open Add Customer
  const openAddModal = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      creditLimit: 100000,
      notes: '',
    });
    setIsAddCustomerOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      address: formData.address || undefined,
      creditLimit: formData.creditLimit,
      currentBalance: 0,
      notes: formData.notes || undefined,
      createdAt: new Date().toISOString(),
    };

    onAddCustomer(newCust);
    setIsAddCustomerOpen(false);
  };

  // Open Payment Modal
  const openPaymentModal = (c: Customer) => {
    setPaymentCustomer(c);
    setPaymentData({
      amount: c.currentBalance,
      paymentMethod: 'cash',
      referenceNo: '',
      notes: `Khata payment received from ${c.name}`,
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentCustomer || paymentData.amount <= 0) return;

    const paymentRecord: CustomerPayment = {
      id: `cpay-${Date.now()}`,
      customerId: paymentCustomer.id,
      customerName: paymentCustomer.name,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      referenceNo: paymentData.referenceNo || undefined,
      date: new Date().toISOString(),
      notes: paymentData.notes || undefined,
    };

    onRecordPayment(paymentRecord);
    setIsPaymentModalOpen(false);
  };

  // Generate WhatsApp text link
  const generateWhatsAppLink = (c: Customer) => {
    const cleanPhone = c.phone.replace(/[^0-9]/g, '');
    const message = `Assalam-o-Alaikum ${c.name},\n\nThis is a polite reminder from *${settings.storeName}* (${settings.phone}).\nYour current outstanding Khata ledger balance is *${formatCurrency(c.currentBalance, settings.currencySymbol)}*.\n\nKindly clear your pending balance at your earliest convenience.\nThank you for your business!`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const handleExportCSV = () => {
    const rows = customers.map(c => ({
      'Customer ID': c.id,
      'Customer Name': c.name,
      'Phone Number': c.phone,
      'Address': c.address || '',
      'Credit Limit': c.creditLimit,
      'Outstanding Balance (Udhaar)': c.currentBalance,
      'Created Date': c.createdAt,
    }));
    exportToCSV(`Hafiz_Traders_Customer_Khata_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner KPI */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold tracking-tight">Customer Khata Ledger (Udhaar)</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Track customer accounts, record payments, and send automatic payment reminders.
          </p>
        </div>

        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl px-5 py-3 text-right">
          <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-bold block">
            Total Khata Receivables
          </span>
          <span className="text-2xl font-black text-indigo-200">
            {formatCurrency(totalReceivables, settings.currencySymbol)}
          </span>
        </div>
      </div>

      {/* Action & Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto flex-1">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by customer name or phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setBalanceFilter('all')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                balanceFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500'
              }`}
            >
              All ({customers.length})
            </button>
            <button
              onClick={() => setBalanceFilter('due')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                balanceFilter === 'due' ? 'bg-red-600 text-white font-semibold' : 'text-slate-500'
              }`}
            >
              Balance Due ({customers.filter(c => c.currentBalance > 0).length})
            </button>
            <button
              onClick={() => setBalanceFilter('clear')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                balanceFilter === 'clear' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-500'
              }`}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-200"
          >
            <Download className="w-3.5 h-3.5" /> Export Khata CSV
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm shadow-indigo-600/20"
          >
            <UserPlus className="w-4 h-4" /> Add New Customer
          </button>
        </div>
      </div>

      {/* Customer List Cards / Table Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map(c => {
          const hasBalance = c.currentBalance > 0;

          return (
            <div
              key={c.id}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-full ${
                      hasBalance
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {hasBalance ? 'UDHAAR DUE' : 'CLEAR'}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{c.phone}</span>
                  </div>
                  {c.address && (
                    <p className="text-[11px] text-slate-500 line-clamp-1">{c.address}</p>
                  )}
                </div>

                {/* Balance Display Box */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Current Khata Balance
                    </span>
                    <span className={`text-lg font-black ${hasBalance ? 'text-red-600' : 'text-emerald-700'}`}>
                      {formatCurrency(c.currentBalance, settings.currencySymbol)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Credit Limit</span>
                    <span className="text-xs font-semibold text-slate-700">
                      {formatCurrency(c.creditLimit, settings.currencySymbol)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedLedgerCustomer(c)}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                  title="View Transaction History"
                >
                  <History className="w-3.5 h-3.5 text-slate-500" /> Ledger
                </button>

                <button
                  onClick={() => openPaymentModal(c)}
                  disabled={c.currentBalance <= 0}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 ${
                    c.currentBalance <= 0
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" /> Pay Cash
                </button>

                {hasBalance ? (
                  <a
                    href={generateWhatsAppLink(c)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border border-emerald-200 text-center"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                ) : (
                  <button
                    disabled
                    className="px-2 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-xs font-medium text-center"
                  >
                    No Due
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD CUSTOMER MODAL */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add New Customer</h3>
              <button onClick={() => setIsAddCustomerOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Customer / Store Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Mahmood General Store"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+92 300 1234567"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Credit Limit ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.creditLimit}
                    onChange={e => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Shop / Residential Address</label>
                <input
                  type="text"
                  placeholder="Main Bazaar, City..."
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Payment terms, special notes..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {isPaymentModalOpen && paymentCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Collect Khata Payment</h3>
                <p className="text-xs text-slate-500">{paymentCustomer.name}</p>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-3 text-xs">
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex justify-between items-center text-red-900">
                <span>Total Pending Udhaar:</span>
                <span className="font-black text-base text-red-600">
                  {formatCurrency(paymentCustomer.currentBalance, settings.currencySymbol)}
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Received Payment Amount ({settings.currencySymbol}) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={paymentCustomer.currentBalance}
                  value={paymentData.amount || ''}
                  onChange={e => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg font-black text-slate-900 text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Payment Mode</label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={e => setPaymentData({ ...paymentData, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg font-semibold"
                  >
                    <option value="cash">Cash Received</option>
                    <option value="bank_transfer">Bank / Online Transfer</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Reference / Cheque #</label>
                  <input
                    type="text"
                    placeholder="Optional..."
                    value={paymentData.referenceNo}
                    onChange={e => setPaymentData({ ...paymentData, referenceNo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Receipt Note</label>
                <input
                  type="text"
                  value={paymentData.notes}
                  onChange={e => setPaymentData({ ...paymentData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                >
                  Save & Print Payment Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMER LEDGER HISTORY MODAL */}
      {selectedLedgerCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{selectedLedgerCustomer.name} - Statement Ledger</h3>
                <p className="text-xs text-slate-500">Phone: {selectedLedgerCustomer.phone}</p>
              </div>
              <button onClick={() => setSelectedLedgerCustomer(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Account Summary Strip */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center text-xs">
              <div>
                <span className="text-slate-500 block">Credit Limit</span>
                <span className="font-bold text-slate-800">
                  {formatCurrency(selectedLedgerCustomer.creditLimit, settings.currencySymbol)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Current Balance</span>
                <span className="font-black text-red-600 text-sm">
                  {formatCurrency(selectedLedgerCustomer.currentBalance, settings.currencySymbol)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Status</span>
                <span className="font-bold text-emerald-700">Active</span>
              </div>
            </div>

            {/* Unified Activity Log (Sales + Payments) */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Transaction Activity History</h4>
              
              {(() => {
                const customerSales = sales.filter(s => s.customerId === selectedLedgerCustomer.id);
                const customerPays = customerPayments.filter(p => p.customerId === selectedLedgerCustomer.id);
                
                const timeline = [
                  ...customerSales.map(s => ({ type: 'sale' as const, date: s.date, data: s })),
                  ...customerPays.map(p => ({ type: 'payment' as const, date: p.date, data: p }))
                ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                if (timeline.length === 0) {
                  return (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No transactions logged for this customer yet.
                    </div>
                  );
                }

                return timeline.map((item, idx) => {
                  if (item.type === 'sale') {
                    const s = item.data as Sale;
                    return (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{s.invoiceNo}</span>
                            <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded font-semibold">
                              Sale Bill
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">{formatDateTime(s.date)}</span>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-slate-900 block">
                            {formatCurrency(s.grandTotal, settings.currencySymbol)}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Paid: {formatCurrency(s.paidAmount, settings.currencySymbol)} | Due: {formatCurrency(s.balanceDue, settings.currencySymbol)}
                          </span>
                        </div>

                        <button
                          onClick={() => onViewInvoice(s)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="View Receipt"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  } else {
                    const p = item.data as CustomerPayment;
                    return (
                      <div key={idx} className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-200 flex justify-between items-center text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-900">Payment Voucher</span>
                            <span className="bg-emerald-200 text-emerald-900 text-[10px] px-2 py-0.5 rounded font-semibold capitalize">
                              {p.paymentMethod}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">{formatDateTime(p.date)}</span>
                        </div>

                        <div className="text-right">
                          <span className="font-black text-emerald-700 text-sm">
                            -{formatCurrency(p.amount, settings.currencySymbol)}
                          </span>
                          {p.referenceNo && <span className="text-[10px] text-slate-500 block">Ref: {p.referenceNo}</span>}
                        </div>
                      </div>
                    );
                  }
                });
              })()}
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                onClick={() => setSelectedLedgerCustomer(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg text-xs"
              >
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
