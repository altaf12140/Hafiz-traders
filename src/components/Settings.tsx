import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Store,
  Printer,
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { StoreSettings } from '../types';

interface SettingsProps {
  settings: StoreSettings;
  onUpdateSettings: (settings: StoreSettings) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonString: string) => void;
  onResetDemo: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onUpdateSettings,
  onExportBackup,
  onImportBackup,
  onResetDemo,
}) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        if (confirm("Restoring a backup will overwrite existing shop data. Continue?")) {
          onImportBackup(content);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400 font-bold">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Shop Configuration & Backup</h2>
            <p className="text-xs text-slate-500">Manage business info, receipt printing presets, and local data backups.</p>
          </div>
        </div>

        {savedSuccess && (
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" /> Settings Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        
        {/* Section 1: Business Branding */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-600" /> Business Profile & Contact Info
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Store / Business Name *</label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={e => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tagline / Subtitle</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-slate-700"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Primary Phone / WhatsApp *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Secondary Phone</label>
              <input
                type="text"
                value={formData.secondaryPhone || ''}
                onChange={e => setFormData({ ...formData, secondaryPhone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-slate-700"
                placeholder="altafpitafi17@gmail.com"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Easypaisa Bill Payment Number</label>
              <input
                type="text"
                value={formData.easypaisaNumber || ''}
                onChange={e => setFormData({ ...formData, easypaisaNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold text-emerald-700"
                placeholder="03132356165"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Shop Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">City / Location</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">NTN / Tax Reg Number</label>
              <input
                type="text"
                value={formData.taxRegistrationNo}
                onChange={e => setFormData({ ...formData, taxRegistrationNo: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Financial & Receipt Defaults */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-600" /> Currency & Receipt Formatting
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Currency Symbol</label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={e => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Currency Code</label>
              <input
                type="text"
                value={formData.currencyCode}
                onChange={e => setFormData({ ...formData, currencyCode: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Default Receipt Style</label>
              <select
                value={formData.receiptType}
                onChange={e => setFormData({ ...formData, receiptType: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg font-semibold"
              >
                <option value="thermal">80mm Thermal Receipt</option>
                <option value="a4">Full A4 Tax Invoice</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="font-semibold text-slate-700 block mb-1">Receipt Footer Note</label>
              <input
                type="text"
                value={formData.receiptFooterNote}
                onChange={e => setFormData({ ...formData, receiptFooterNote: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20"
          >
            Save Configuration Changes
          </button>
        </div>
      </form>

      {/* Section 3: Data Management & Backups */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm pb-2 border-b flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600" /> Database Backup, Restore & Reset
        </h3>

        <p className="text-xs text-slate-500">
          Export your complete shop database (items, customers, Khata ledger, sales invoices, supplier payables) as a backup file.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={onExportBackup}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Export JSON Backup
          </button>

          <label className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow">
            <Upload className="w-4 h-4" /> Restore JSON Backup
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (confirm("Reset store data back to initial Hafiz Traders demo dataset?")) {
                onResetDemo();
              }
            }}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 ml-auto"
          >
            <RotateCcw className="w-4 h-4" /> Reset Demo Data
          </button>
        </div>
      </div>

    </div>
  );
};
