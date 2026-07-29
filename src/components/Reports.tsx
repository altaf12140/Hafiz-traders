import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Award,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { Sale, Expense, Product, Customer, Supplier, StoreSettings } from '../types';
import { formatCurrency, exportToCSV } from '../utils/formatters';

interface ReportsProps {
  sales: Sale[];
  expenses: Expense[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  settings: StoreSettings;
}

export const Reports: React.FC<ReportsProps> = ({
  sales,
  expenses,
  products,
  customers,
  suppliers,
  settings,
}) => {
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'all'>('all');

  // Profit & Loss Financial Summary
  const financialSummary = useMemo(() => {
    // Total Revenue (Grand Total of Sales)
    const totalRevenue = sales.reduce((acc, s) => acc + s.grandTotal, 0);

    // Cost of Goods Sold (COGS)
    let cogs = 0;
    sales.forEach(sale => {
      sale.items.forEach(item => {
        cogs += item.costPrice * item.quantity;
      });
    });

    // Gross Profit = Revenue - COGS
    const grossProfit = totalRevenue - cogs;

    // Total Operating Expenses
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

    // Net Profit = Gross Profit - Expenses
    const netProfit = grossProfit - totalExpenses;

    // Total Receivables (Udhaar)
    const totalReceivables = customers.reduce((acc, c) => acc + (c.currentBalance > 0 ? c.currentBalance : 0), 0);

    // Total Payables
    const totalPayables = suppliers.reduce((acc, s) => acc + (s.currentBalance > 0 ? s.currentBalance : 0), 0);

    return {
      totalRevenue,
      cogs,
      grossProfit,
      totalExpenses,
      netProfit,
      totalReceivables,
      totalPayables,
      marginPercentage: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0',
    };
  }, [sales, expenses, customers, suppliers]);

  // Sales Trend Chart Data (Grouped by Date)
  const salesTrendData = useMemo(() => {
    const map = new Map<string, { date: string; revenue: number; profit: number }>();

    sales.forEach(sale => {
      const dateStr = new Date(sale.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      let saleCogs = 0;
      sale.items.forEach(i => (saleCogs += i.costPrice * i.quantity));
      const profit = sale.grandTotal - saleCogs;

      if (!map.has(dateStr)) {
        map.set(dateStr, { date: dateStr, revenue: 0, profit: 0 });
      }
      const existing = map.get(dateStr)!;
      existing.revenue += sale.grandTotal;
      existing.profit += profit;
    });

    return Array.from(map.values()).reverse().slice(-14);
  }, [sales]);

  // Top Selling Items Chart Data
  const topSellingProductsData = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();

    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!map.has(item.productName)) {
          map.set(item.productName, { name: item.productName.slice(0, 18) + '...', qty: 0, revenue: 0 });
        }
        const current = map.get(item.productName)!;
        current.qty += item.quantity;
        current.revenue += item.total;
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [sales]);

  // Sales by Category Pie Chart Data
  const categoryChartData = useMemo(() => {
    const map = new Map<string, number>();

    sales.forEach(sale => {
      sale.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        const cat = prod ? prod.category : 'General';
        map.set(cat, (map.get(cat) || 0) + item.total);
      });
    });

    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [sales, products]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

  const handleExportPLReport = () => {
    const data = [
      { Metric: 'Total Revenue', Amount: financialSummary.totalRevenue },
      { Metric: 'Cost of Goods Sold (COGS)', Amount: financialSummary.cogs },
      { Metric: 'Gross Profit', Amount: financialSummary.grossProfit },
      { Metric: 'Total Operating Expenses', Amount: financialSummary.totalExpenses },
      { Metric: 'Net Operating Profit', Amount: financialSummary.netProfit },
      { Metric: 'Customer Receivables (Udhaar)', Amount: financialSummary.totalReceivables },
      { Metric: 'Supplier Payables (Owed)', Amount: financialSummary.totalPayables },
    ];
    exportToCSV(`Hafiz_Traders_Financial_Statement_${new Date().toISOString().slice(0, 10)}.csv`, data);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header & Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Financial Reports & Business Analytics</h2>
          <p className="text-xs text-slate-500">
            Real-time profit & loss summary, sales trends, and inventory valuation for {settings.storeName}.
          </p>
        </div>

        <button
          onClick={handleExportPLReport}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow"
        >
          <Download className="w-4 h-4" /> Export P&L Financial Report
        </button>
      </div>

      {/* Financial P&L Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Gross Sales Revenue</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            {formatCurrency(financialSummary.totalRevenue, settings.currencySymbol)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Across {sales.length} invoices
          </p>
        </div>

        {/* Cost of Goods Sold */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Cost of Goods (COGS)</span>
          <h3 className="text-2xl font-black text-slate-800 mt-1">
            {formatCurrency(financialSummary.cogs, settings.currencySymbol)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-2">Cost price of items sold</p>
        </div>

        {/* Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Operating Expenses</span>
          <h3 className="text-2xl font-black text-amber-600 mt-1">
            {formatCurrency(financialSummary.totalExpenses, settings.currencySymbol)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-2">Rent, bills, staff, freight</p>
        </div>

        {/* Net Profit */}
        <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-md border border-slate-800">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Net Operating Profit</span>
          <h3 className="text-2xl font-black text-emerald-300 mt-1">
            {formatCurrency(financialSummary.netProfit, settings.currencySymbol)}
          </h3>
          <p className="text-[11px] text-slate-300 mt-2 flex items-center gap-1">
            <span>Net Profit Margin:</span>
            <span className="font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
              {financialSummary.marginPercentage}%
            </span>
          </p>
        </div>

      </div>

      {/* Receivables vs Payables Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex justify-between items-center text-red-900">
          <div>
            <span className="text-xs font-bold uppercase text-red-700 block">Customer Khata Receivables (Udhaar)</span>
            <p className="text-[11px] text-red-600">Total balance customers owe to {settings.storeName}</p>
          </div>
          <span className="text-2xl font-black text-red-700">
            {formatCurrency(financialSummary.totalReceivables, settings.currencySymbol)}
          </span>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex justify-between items-center text-blue-900">
          <div>
            <span className="text-xs font-bold uppercase text-blue-700 block">Supplier Payables (We Owe)</span>
            <p className="text-[11px] text-blue-600">Total balance owed to wholesale vendors</p>
          </div>
          <span className="text-2xl font-black text-blue-700">
            {formatCurrency(financialSummary.totalPayables, settings.currencySymbol)}
          </span>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sales Trend Line Chart (8 Cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Revenue & Profit History</h4>
              <p className="text-xs text-slate-400">Daily sales performance trajectory</p>
            </div>
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="profit" name="Gross Profit" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Pie Chart (4 Cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Sales by Category</h4>
            <p className="text-xs text-slate-400">Revenue contribution per product category</p>
          </div>

          <div className="h-56 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Top 5 Products Bar Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Top 5 Selling Items by Revenue</h4>
          <p className="text-xs text-slate-400">Most profitable catalog products</p>
        </div>

        <div className="h-60 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topSellingProductsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" stroke="#64748b" />
              <YAxis dataKey="name" type="category" width={130} stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="revenue" name="Total Revenue" fill="#10b981" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
