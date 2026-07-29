import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Edit2,
  Trash2,
  Download,
  CheckCircle2,
  RefreshCw,
  X,
  TrendingUp,
  Box
} from 'lucide-react';
import { Product, Supplier, ProductUnit, StoreSettings, StockAdjustment } from '../types';
import { formatCurrency, generateSKU, exportToCSV } from '../utils/formatters';

interface InventoryProps {
  products: Product[];
  suppliers: Supplier[];
  settings: StoreSettings;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onStockAdjustment: (adjustment: StockAdjustment) => void;
}

export const Inventory: React.FC<InventoryProps> = ({
  products,
  suppliers,
  settings,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onStockAdjustment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedStockProduct, setSelectedStockProduct] = useState<Product | null>(null);
  const [newStockQty, setNewStockQty] = useState<number>(0);
  const [stockAdjustmentReason, setStockAdjustmentReason] = useState<StockAdjustment['reason']>('restock');
  const [stockAdjustmentNotes, setStockAdjustmentNotes] = useState('');

  // Form State for Product Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: 'Grains & Foodstuff',
    unit: 'pcs' as ProductUnit,
    costPrice: 0,
    sellingPrice: 0,
    stock: 0,
    minStockAlert: 5,
    supplierId: '',
    description: '',
  });

  // Extract categories
  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(products.map(p => p.category)))];
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery);

      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;

      let matchesStock = true;
      if (stockFilter === 'low') matchesStock = p.stock > 0 && p.stock <= p.minStockAlert;
      if (stockFilter === 'out') matchesStock = p.stock <= 0;

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  // Inventory Valuation Metrics
  const metrics = useMemo(() => {
    const totalItems = products.length;
    const totalCostValue = products.reduce((acc, p) => acc + p.costPrice * p.stock, 0);
    const totalRetailValue = products.reduce((acc, p) => acc + p.sellingPrice * p.stock, 0);
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= p.minStockAlert).length;
    const outOfStockCount = products.filter(p => p.stock <= 0).length;

    return { totalItems, totalCostValue, totalRetailValue, lowStockCount, outOfStockCount };
  }, [products]);

  // Handle open Product Modal
  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: generateSKU('New', 'Item'),
      barcode: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
      category: categories[1] || 'Grains & Foodstuff',
      unit: 'pcs',
      costPrice: 0,
      sellingPrice: 0,
      stock: 0,
      minStockAlert: 5,
      supplierId: suppliers[0]?.id || '',
      description: '',
    });
    setIsProductModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      category: p.category,
      unit: p.unit,
      costPrice: p.costPrice,
      sellingPrice: p.sellingPrice,
      stock: p.stock,
      minStockAlert: p.minStockAlert,
      supplierId: p.supplierId || '',
      description: p.description || '',
    });
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        ...formData,
        updatedAt: new Date().toISOString(),
      };
      onUpdateProduct(updated);
    } else {
      const created: Product = {
        id: `prod-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onAddProduct(created);
    }

    setIsProductModalOpen(false);
  };

  // Stock Adjustment Submission
  const openStockModal = (p: Product) => {
    setSelectedStockProduct(p);
    setNewStockQty(p.stock);
    setStockAdjustmentReason('restock');
    setStockAdjustmentNotes('');
    setIsStockModalOpen(true);
  };

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStockProduct) return;

    const diff = newStockQty - selectedStockProduct.stock;
    const adjustment: StockAdjustment = {
      id: `adj-${Date.now()}`,
      productId: selectedStockProduct.id,
      productName: selectedStockProduct.name,
      previousStock: selectedStockProduct.stock,
      newStock: newStockQty,
      quantityChange: diff,
      reason: stockAdjustmentReason,
      notes: stockAdjustmentNotes,
      date: new Date().toISOString(),
    };

    onStockAdjustment(adjustment);
    setIsStockModalOpen(false);
  };

  const handleExportCSV = () => {
    const data = products.map(p => ({
      'SKU': p.sku,
      'Barcode': p.barcode,
      'Item Name': p.name,
      'Category': p.category,
      'Unit': p.unit,
      'Cost Price': p.costPrice,
      'Selling Price': p.sellingPrice,
      'Current Stock': p.stock,
      'Min Alert Level': p.minStockAlert,
      'Total Cost Value': p.costPrice * p.stock,
      'Total Retail Value': p.sellingPrice * p.stock,
    }));
    exportToCSV(`Hafiz_Traders_Inventory_${new Date().toISOString().slice(0, 10)}.csv`, data);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Catalog Items</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{metrics.totalItems}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Stock Valuation (At Cost)</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              {formatCurrency(metrics.totalCostValue, settings.currencySymbol)}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Box className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Potential Retail Revenue</p>
            <h3 className="text-xl font-bold text-emerald-700 mt-0.5">
              {formatCurrency(metrics.totalRetailValue, settings.currencySymbol)}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Stock Health</p>
            <div className="flex gap-2 text-xs font-bold mt-1">
              <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {metrics.lowStockCount} Low
              </span>
              <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                {metrics.outOfStockCount} Out
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Action & Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-3 justify-between items-center">
        
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, SKU, or barcode..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                stockFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStockFilter('low')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                stockFilter === 'low' ? 'bg-amber-500 text-white font-semibold' : 'text-slate-500'
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setStockFilter('out')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                stockFilter === 'out' ? 'bg-red-600 text-white font-semibold' : 'text-slate-500'
              }`}
            >
              Out of Stock
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-200"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" /> Add New Item
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3 font-semibold">SKU / Barcode</th>
                <th className="p-3 font-semibold">Item Name</th>
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold text-right">Cost Price</th>
                <th className="p-3 font-semibold text-right">Selling Price</th>
                <th className="p-3 font-semibold text-right">Margin %</th>
                <th className="p-3 font-semibold text-center">Stock Level</th>
                <th className="p-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No matching items found in inventory.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const isLow = p.stock > 0 && p.stock <= p.minStockAlert;
                  const isOut = p.stock <= 0;
                  const marginPercent = p.sellingPrice > 0 
                    ? (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(1) 
                    : '0';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-medium text-slate-600">
                        <div>{p.sku}</div>
                        <div className="text-[10px] text-slate-400">{p.barcode}</div>
                      </td>

                      <td className="p-3">
                        <span className="font-bold text-slate-900 block text-sm">{p.name}</span>
                        {p.description && <span className="text-[10px] text-slate-400 line-clamp-1">{p.description}</span>}
                      </td>

                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-full text-[10px]">
                          {p.category}
                        </span>
                      </td>

                      <td className="p-3 text-right font-medium text-slate-600">
                        {formatCurrency(p.costPrice, settings.currencySymbol)}
                      </td>

                      <td className="p-3 text-right font-bold text-slate-900">
                        {formatCurrency(p.sellingPrice, settings.currencySymbol)}
                      </td>

                      <td className="p-3 text-right">
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                          +{marginPercent}%
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            className={`font-black text-xs px-2.5 py-1 rounded-md ${
                              isOut
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : isLow
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {p.stock} {p.unit}
                          </span>
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openStockModal(p)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Adjust Stock Qty"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete item "${p.name}"?`)) onDeleteProduct(p.id);
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingProduct ? 'Edit Inventory Item' : 'Add New Inventory Item'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Item Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Super Kernel Basmati Rice (50kg Bag)"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grains, Electronics, Hardware"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unit of Measure</label>
                  <select
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value as ProductUnit })}
                    className="w-full px-3 py-2 border rounded-lg text-xs font-semibold"
                  >
                    <option value="pcs">pcs (Pieces)</option>
                    <option value="kg">kg (Kilograms)</option>
                    <option value="bag">bag (Bags)</option>
                    <option value="box">box (Boxes/Tins)</option>
                    <option value="meter">meter (Meters)</option>
                    <option value="liter">liter (Liters)</option>
                    <option value="pack">pack (Packs)</option>
                    <option value="dozen">dozen (Dozens)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Cost Price ({settings.currencySymbol}) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.costPrice}
                    onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Selling Price ({settings.currencySymbol}) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.sellingPrice}
                    onChange={e => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg text-xs font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Current Stock Qty</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min Stock Alert Level</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.minStockAlert}
                    onChange={e => setFormData({ ...formData, minStockAlert: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Barcode Number</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Preferred Supplier</label>
                <select
                  value={formData.supplierId}
                  onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                >
                  <option value="">-- None Selected --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.companyName}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow"
                >
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {isStockModalOpen && selectedStockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Adjust Stock Level</h3>
                <p className="text-xs text-slate-500">{selectedStockProduct.name}</p>
              </div>
              <button onClick={() => setIsStockModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockSubmit} className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center border">
                <span className="text-slate-600">Current Stock:</span>
                <span className="font-bold text-sm text-slate-900">
                  {selectedStockProduct.stock} {selectedStockProduct.unit}
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">New Updated Stock Quantity</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={newStockQty}
                  onChange={e => setNewStockQty(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reason for Adjustment</label>
                <select
                  value={stockAdjustmentReason}
                  onChange={e => setStockAdjustmentReason(e.target.value as StockAdjustment['reason'])}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                >
                  <option value="restock">Restock / Fresh Inventory</option>
                  <option value="audit_correction">Physical Audit Correction</option>
                  <option value="damaged">Damaged / Expired Goods</option>
                  <option value="return">Customer Return</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notes / Reference</label>
                <input
                  type="text"
                  placeholder="Optional details..."
                  value={stockAdjustmentNotes}
                  onChange={e => setStockAdjustmentNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
