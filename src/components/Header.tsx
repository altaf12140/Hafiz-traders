import React from 'react';
import {
  ShoppingBag,
  Package,
  Users,
  Building2,
  Receipt,
  TrendingUp,
  Settings,
  AlertTriangle,
  Bot,
  PlusCircle,
  Clock,
  Store,
  MessageSquare,
  Wallet,
  Phone
} from 'lucide-react';
import { ActiveTab, StoreSettings } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  settings: StoreSettings;
  lowStockCount: number;
  totalReceivables: number;
  openNewSale: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  settings,
  lowStockCount,
  openNewSale
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'pos', label: 'POS Terminal', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'inventory', label: 'Inventory', icon: <Package className="w-4 h-4" />, badge: lowStockCount },
    { id: 'sales', label: 'Sales & Invoices', icon: <Clock className="w-4 h-4" /> },
    { id: 'customers', label: 'Customer Khata', icon: <Users className="w-4 h-4" /> },
    { id: 'suppliers', label: 'Suppliers & PO', icon: <Building2 className="w-4 h-4" /> },
    { id: 'expenses', label: 'Expenses', icon: <Receipt className="w-4 h-4" /> },
    { id: 'reports', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'feedback', label: 'Customer Feedback', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'copilot', label: 'AI Assistant', icon: <Bot className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30 border-b border-slate-800">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-950">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">{settings.storeName}</h1>
              <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full font-semibold border border-indigo-500/30">
                Pitafi Brothers
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {settings.tagline} • Phone: <strong className="text-slate-200">{settings.phone}</strong> • Easypaisa: <strong className="text-emerald-400">{settings.easypaisaNumber}</strong>
            </p>
          </div>
        </div>

        {/* Right Actions & Status Badges */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {lowStockCount > 0 && (
            <button
              onClick={() => setActiveTab('inventory')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold rounded-lg border border-amber-500/30 transition-colors"
              title="Items below min stock level"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{lowStockCount} Low Stock</span>
            </button>
          )}

          <button
            onClick={openNewSale}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs md:text-sm font-semibold rounded-lg shadow-sm hover:shadow-indigo-600/30 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Sale (POS)</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none">
        <nav className="flex space-x-1 py-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs md:text-sm font-medium transition-colors whitespace-nowrap relative ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center ${
                    isActive ? 'bg-amber-400 text-slate-950' : 'bg-amber-500 text-slate-950'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
