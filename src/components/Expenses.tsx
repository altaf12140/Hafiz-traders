import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Download,
  Calendar,
  DollarSign,
  Tag,
  X
} from 'lucide-react';
import { Expense, StoreSettings } from '../types';
import { formatCurrency, formatDateTime, exportToCSV } from '../utils/formatters';

interface ExpensesProps {
  expenses: Expense[];
  settings: StoreSettings;
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export const Expenses: React.FC<ExpensesProps> = ({
  expenses,
  settings,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'transport' as Expense['category'],
    amount: 0,
    paymentMethod: 'cash' as Expense['paymentMethod'],
    notes: '',
  });

  const categoriesList: { id: Expense['category']; label: string }[] = [
    { id: 'rent', label: 'Shop Rent' },
    { id: 'electricity', label: 'Electricity / Utilities' },
    { id: 'salaries', label: 'Staff Salaries' },
    { id: 'transport', label: 'Freight & Transportation' },
    { id: 'packaging', label: 'Packaging & Bags' },
    { id: 'tea_snacks', label: 'Tea & Refreshment' },
    { id: 'maintenance', label: 'Repairs & Maintenance' },
    { id: 'marketing', label: 'Marketing & Ads' },
    { id: 'other', label: 'Other Misc Expense' },
  ];

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchesSearch =
        exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exp.notes && exp.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || exp.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [expenses, searchQuery, selectedCategory]);

  const totalExpenseAmount = useMemo(() => {
    return filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  }, [filteredExpenses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.amount <= 0) return;

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      category: formData.category,
      title: formData.title,
      amount: formData.amount,
      paymentMethod: formData.paymentMethod,
      date: new Date().toISOString(),
      notes: formData.notes || undefined,
    };

    onAddExpense(newExpense);
    setIsAddModalOpen(false);
    setFormData({
      title: '',
      category: 'transport',
      amount: 0,
      paymentMethod: 'cash',
      notes: '',
    });
  };

  const handleExportCSV = () => {
    const rows = expenses.map(e => ({
      'Expense ID': e.id,
      'Title': e.title,
      'Category': e.category,
      'Amount': e.amount,
      'Payment Mode': e.paymentMethod,
      'Date': e.date,
      'Notes': e.notes || '',
    }));
    exportToCSV(`Hafiz_Traders_Expenses_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner KPI */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold tracking-tight">Daily Business Expenses</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Track operational costs, rent, electricity bills, staff tea, and freight expenses.
          </p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-5 py-3 text-right">
          <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold block">
            Total Logged Expenses
          </span>
          <span className="text-2xl font-black text-amber-300">
            {formatCurrency(totalExpenseAmount, settings.currencySymbol)}
          </span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search expense title..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categoriesList.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-200"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" /> Log Expense
          </button>
        </div>
      </div>

      {/* Expense List Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3 font-semibold">Date & Time</th>
                <th className="p-3 font-semibold">Expense Title</th>
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold">Payment Mode</th>
                <th className="p-3 font-semibold text-right">Amount</th>
                <th className="p-3 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-500">{formatDateTime(e.date)}</td>
                    <td className="p-3 font-bold text-slate-900">
                      <div>{e.title}</div>
                      {e.notes && <div className="text-[10px] text-slate-400 font-normal">{e.notes}</div>}
                    </td>
                    <td className="p-3">
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                        {e.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 font-medium capitalize text-slate-600">
                      {e.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="p-3 text-right font-black text-slate-900 text-sm">
                      {formatCurrency(e.amount, settings.currencySymbol)}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Delete expense "${e.title}"?`)) onDeleteExpense(e.id);
                        }}
                        className="text-red-500 hover:text-red-700 font-medium text-[11px]"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD EXPENSE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Log New Expense</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Expense Title / Reason *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mazda Truck Freight Charges"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as Expense['category'] })}
                    className="w-full px-3 py-2 border rounded-lg font-semibold"
                  >
                    {categoriesList.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Amount ({settings.currencySymbol}) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.amount || ''}
                    onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg font-black text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Payment Method</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'cash' })}
                    className={`flex-1 py-1.5 rounded-lg font-semibold border text-center ${
                      formData.paymentMethod === 'cash'
                        ? 'bg-slate-900 text-emerald-400 border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Cash Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'bank_transfer' })}
                    className={`flex-1 py-1.5 rounded-lg font-semibold border text-center ${
                      formData.paymentMethod === 'bank_transfer'
                        ? 'bg-slate-900 text-emerald-400 border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Bank Transfer
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Optional details..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border rounded-lg font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
