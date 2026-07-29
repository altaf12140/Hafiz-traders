import React, { useState, useMemo } from 'react';
import {
  Clock,
  Search,
  FileText,
  Printer,
  Download,
  Eye,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Sale, StoreSettings } from '../types';
import { formatCurrency, formatDateTime, exportToCSV } from '../utils/formatters';

interface SalesProps {
  sales: Sale[];
  settings: StoreSettings;
  onViewInvoice: (sale: Sale) => void;
}

export const Sales: React.FC<SalesProps> = ({ sales, settings, onViewInvoice }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const matchesSearch =
        s.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.customerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPayment = paymentFilter === 'all' || s.paymentMethod === paymentFilter;

      return matchesSearch && matchesPayment;
    });
  }, [sales, searchQuery, paymentFilter]);

  const totalSalesRevenue = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + s.grandTotal, 0);
  }, [filteredSales]);

  const handleExportCSV = () => {
    const rows = sales.map(s => ({
      'Invoice No': s.invoiceNo,
      'Customer': s.customerName,
      'Customer Phone': s.customerPhone || '',
      'Date': s.date,
      'Items Count': s.items.length,
      'Subtotal': s.subtotal,
      'Discount': s.discountAmount,
      'Grand Total': s.grandTotal,
      'Paid Amount': s.paidAmount,
      'Balance Due (Khata)': s.balanceDue,
      'Payment Method': s.paymentMethod,
    }));
    exportToCSV(`Hafiz_Traders_Sales_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner KPI */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold tracking-tight">Sales & Billing History</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Browse past customer invoices, check payment statuses, and reprint receipts.
          </p>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-5 py-3 text-right">
          <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold block">
            Filtered Sales Total
          </span>
          <span className="text-2xl font-black text-emerald-300">
            {formatCurrency(totalSalesRevenue, settings.currencySymbol)}
          </span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search invoice # or customer name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <select
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Payment Modes</option>
            <option value="cash">Cash Only</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="credit">Khata / Credit</option>
            <option value="split">Split</option>
          </select>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-200"
        >
          <Download className="w-3.5 h-3.5" /> Export Sales CSV
        </button>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3 font-semibold">Invoice #</th>
                <th className="p-3 font-semibold">Date & Time</th>
                <th className="p-3 font-semibold">Customer</th>
                <th className="p-3 font-semibold text-center">Payment Mode</th>
                <th className="p-3 font-semibold text-right">Grand Total</th>
                <th className="p-3 font-semibold text-right">Paid</th>
                <th className="p-3 font-semibold text-right">Khata Due</th>
                <th className="p-3 font-semibold text-center">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No sales invoices match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSales.map(s => {
                  const hasDue = s.balanceDue > 0;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">{s.invoiceNo}</td>
                      <td className="p-3 text-slate-500">{formatDateTime(s.date)}</td>
                      <td className="p-3 font-semibold text-slate-800">
                        {s.customerName}
                        {s.customerPhone && <span className="text-[10px] text-slate-400 block font-normal">{s.customerPhone}</span>}
                      </td>

                      <td className="p-3 text-center">
                        <span className="bg-slate-100 text-slate-700 font-semibold text-[10px] px-2 py-0.5 rounded capitalize">
                          {s.paymentMethod.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="p-3 text-right font-black text-slate-900 text-sm">
                        {formatCurrency(s.grandTotal, settings.currencySymbol)}
                      </td>

                      <td className="p-3 text-right font-semibold text-emerald-700">
                        {formatCurrency(s.paidAmount, settings.currencySymbol)}
                      </td>

                      <td className="p-3 text-right">
                        {hasDue ? (
                          <span className="font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                            {formatCurrency(s.balanceDue, settings.currencySymbol)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>

                      <td className="p-3 text-center">
                        <button
                          onClick={() => onViewInvoice(s)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg text-[11px] inline-flex items-center gap-1 border border-emerald-200"
                        >
                          <Eye className="w-3.5 h-3.5" /> View / Print
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
