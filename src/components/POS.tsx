import React, { useState, useMemo } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  User,
  Check,
  Percent,
  Barcode,
  ArrowRight,
  UserPlus
} from 'lucide-react';
import { Product, Customer, SaleItem, Sale, PaymentMethod, StoreSettings } from '../types';
import { formatCurrency, generateInvoiceNo } from '../utils/formatters';

interface POSProps {
  products: Product[];
  customers: Customer[];
  settings: StoreSettings;
  existingSalesCount: number;
  onCompleteSale: (sale: Sale) => void;
  onAddNewCustomer: () => void;
}

export const POS: React.FC<POSProps> = ({
  products,
  customers,
  settings,
  existingSalesCount,
  onCompleteSale,
  onAddNewCustomer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [billDiscount, setBillDiscount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(settings.defaultTaxRate || 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paidAmountInput, setPaidAmountInput] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [barcodeScanInput, setBarcodeScanInput] = useState<string>('');

  // Extract categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)));
    return ['All', ...cats];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery);
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  // Selected customer
  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  // Cart calculation
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.total, 0);
  }, [cartItems]);

  const taxAmount = useMemo(() => {
    const taxableSubtotal = Math.max(0, subtotal - billDiscount);
    return (taxableSubtotal * taxRate) / 100;
  }, [subtotal, billDiscount, taxRate]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - billDiscount + taxAmount);
  }, [subtotal, billDiscount, taxAmount]);

  // Default paid amount based on payment method
  const numericPaidAmount = useMemo(() => {
    if (paidAmountInput === '') {
      if (paymentMethod === 'credit') return 0;
      return grandTotal;
    }
    return parseFloat(paidAmountInput) || 0;
  }, [paidAmountInput, paymentMethod, grandTotal]);

  const balanceDue = useMemo(() => {
    return Math.max(0, grandTotal - numericPaidAmount);
  }, [grandTotal, numericPaidAmount]);

  const changeReturn = useMemo(() => {
    return Math.max(0, numericPaidAmount - grandTotal);
  }, [grandTotal, numericPaidAmount]);

  // Add to cart helper
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => item.productId === product.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        const currentQty = updated[existingIdx].quantity;
        if (currentQty >= product.stock) {
          return prev; // cannot exceed stock
        }
        const newQty = currentQty + 1;
        const total = (updated[existingIdx].unitPrice - updated[existingIdx].discount) * newQty;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          total,
        };
        return updated;
      } else {
        const newItem: SaleItem = {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          unit: product.unit,
          quantity: 1,
          costPrice: product.costPrice,
          unitPrice: product.sellingPrice,
          discount: 0,
          total: product.sellingPrice,
        };
        return [...prev, newItem];
      }
    });
  };

  // Update item quantity
  const updateQuantity = (productId: string, newQty: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQty > product.stock) {
      newQty = product.stock; // cap at available stock
    }

    setCartItems(prev =>
      prev.map(item => {
        if (item.productId === productId) {
          const total = (item.unitPrice - item.discount) * newQty;
          return { ...item, quantity: newQty, total };
        }
        return item;
      })
    );
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  // Handle barcode simulation scan submit
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeScanInput.trim()) return;
    const foundProduct = products.find(
      p => p.barcode === barcodeScanInput.trim() || p.sku.toLowerCase() === barcodeScanInput.trim().toLowerCase()
    );
    if (foundProduct) {
      addToCart(foundProduct);
      setBarcodeScanInput('');
    }
  };

  // Complete checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    if (paymentMethod === 'credit' && !selectedCustomerId) {
      alert("Please select a customer for Khata / Credit sale.");
      return;
    }

    const sale: Sale = {
      id: `sale-${Date.now()}`,
      invoiceNo: generateInvoiceNo(existingSalesCount),
      customerId: selectedCustomerId || undefined,
      customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Customer',
      customerPhone: selectedCustomer ? selectedCustomer.phone : undefined,
      items: cartItems,
      subtotal,
      taxAmount,
      discountAmount: billDiscount,
      grandTotal,
      paidAmount: Math.min(numericPaidAmount, grandTotal),
      balanceDue,
      paymentMethod,
      notes,
      date: new Date().toISOString(),
    };

    onCompleteSale(sale);

    // Reset cart & inputs
    setCartItems([]);
    setBillDiscount(0);
    setPaidAmountInput('');
    setNotes('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      
      {/* Pitafi Brothers Store Banner & Highlights */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-white">{settings.storeName}</h2>
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
              Wholesale & Retail
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Owned by <strong className="text-indigo-300">Pitafi Brothers</strong> • Master Allana Hassan Panhwer Goth, Near KIA Showroom & Kasim Textile Industry, Quaidabad, Malir, Karachi
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-2">
            <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 font-medium text-slate-200">
              📞 Phone: <strong>03058247545</strong> / <strong>03132356165</strong>
            </span>
            <span className="bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/80 font-bold text-emerald-300">
              💸 Easypaisa Bill Pay: <strong>03132356165</strong>
            </span>
            <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 text-indigo-300">
              📧 altafpitafi17@gmail.com
            </span>
          </div>
        </div>

        {/* Store Highlights / Shorts Thumbnails */}
        <div className="flex items-center gap-2 shrink-0 overflow-x-auto max-w-full">
          {[
            { title: "General Store", img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=120&q=80" },
            { title: "Edible Oils", img: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=120&q=80" },
            { title: "Hardware", img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=120&q=80" },
            { title: "Solar Systems", img: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=120&q=80" },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center group cursor-pointer">
              <div className="w-12 h-12 rounded-xl ring-2 ring-indigo-500/50 p-0.5 overflow-hidden bg-slate-800 group-hover:scale-105 transition-transform shadow">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover rounded-lg" />
              </div>
              <span className="text-[9px] text-slate-300 font-medium mt-1 whitespace-nowrap">{item.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: Items Catalog (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Search & Barcode Input */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search items by name, SKU..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <form onSubmit={handleBarcodeSubmit} className="relative w-full sm:w-56">
              <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Scan / Type Barcode"
                value={barcodeScanInput}
                onChange={e => setBarcodeScanInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </form>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredProducts.map(product => {
              const isLowStock = product.stock <= product.minStockAlert;
              const isOutOfStock = product.stock <= 0;
              const inCartItem = cartItems.find(i => i.productId === product.id);

              return (
                <div
                  key={product.id}
                  onClick={() => !isOutOfStock && addToCart(product)}
                  className={`bg-white rounded-xl p-3.5 border transition-all flex flex-col justify-between cursor-pointer select-none relative group ${
                    isOutOfStock
                      ? 'opacity-50 border-slate-200 cursor-not-allowed bg-slate-50'
                      : inCartItem
                      ? 'border-indigo-500 ring-2 ring-indigo-500/10 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  {inCartItem && (
                    <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center shadow">
                      {inCartItem.quantity}
                    </span>
                  )}

                  <div>
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        {product.sku}
                      </span>
                      {isOutOfStock ? (
                        <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Low Stock
                        </span>
                      ) : null}
                    </div>

                    {product.image && (
                      <div className="w-full h-24 mb-2 rounded-lg overflow-hidden bg-slate-100 border border-slate-100">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                    )}

                    <h4 className="font-semibold text-slate-800 text-xs line-clamp-2 leading-snug mb-1 group-hover:text-indigo-600 transition-colors">
                      {product.name}
                    </h4>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {formatCurrency(product.sellingPrice, settings.currencySymbol)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Per {product.unit} • {product.stock} in stock
                      </span>
                    </div>

                    <button
                      disabled={isOutOfStock}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isOutOfStock
                          ? 'bg-slate-200 text-slate-400'
                          : 'bg-indigo-50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL: Cart & Checkout (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between overflow-hidden">
          
          {/* Cart Header & Customer Selector */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Current Sale</h3>
                <span className="text-xs bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
                  {cartItems.length} items
                </span>
              </div>
              {cartItems.length > 0 && (
                <button
                  onClick={() => setCartItems([])}
                  className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Cart
                </button>
              )}
            </div>

            {/* Customer Picker */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                >
                  <option value="">Walk-in Cash Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.currentBalance > 0 ? `(Khata: ${formatCurrency(c.currentBalance, settings.currencySymbol)})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={onAddNewCustomer}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-200"
                title="Add New Customer"
              >
                <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
              </button>
            </div>

            {selectedCustomer && selectedCustomer.currentBalance > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs flex justify-between items-center text-amber-900">
                <span>Existing Khata Balance:</span>
                <span className="font-bold text-amber-700">
                  {formatCurrency(selectedCustomer.currentBalance, settings.currencySymbol)}
                </span>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-slate-100 max-h-[320px]">
            {cartItems.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <ShoppingCart className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
                <p className="text-sm font-medium">Cart is empty</p>
                <p className="text-xs text-slate-400">Click items on the left to add to sale</p>
              </div>
            ) : (
              cartItems.map(item => (
                <div key={item.productId} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-slate-800 text-xs truncate">{item.productName}</h5>
                    <div className="text-[11px] text-slate-500">
                      {formatCurrency(item.unitPrice, settings.currencySymbol)} / {item.unit}
                    </div>
                  </div>

                  {/* Quantity Counter */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1 hover:bg-white text-slate-600 rounded"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={e => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                      className="w-10 text-center text-xs font-bold bg-transparent border-none focus:outline-none"
                      min={1}
                    />
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1 hover:bg-white text-slate-600 rounded"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Total */}
                  <div className="text-right w-20">
                    <span className="font-bold text-xs text-slate-900 block">
                      {formatCurrency(item.total, settings.currencySymbol)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-[10px] text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bill Summary & Payment Controls */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
            
            {/* Discount & Tax controls */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-slate-500 font-medium block mb-1">Extra Discount</label>
                <div className="relative">
                  <input
                    type="number"
                    value={billDiscount || ''}
                    onChange={e => setBillDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-semibold"
                  />
                  <span className="absolute right-2 top-1.5 text-slate-400 text-[11px] font-bold">
                    {settings.currencySymbol}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-slate-500 font-medium block mb-1">Tax Rate (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={taxRate}
                    onChange={e => setTaxRate(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-semibold"
                  />
                  <Percent className="w-3 h-3 text-slate-400 absolute right-2 top-2" />
                </div>
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-1 text-xs pt-1 border-t border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal, settings.currencySymbol)}</span>
              </div>
              {billDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span>-{formatCurrency(billDiscount, settings.currencySymbol)}</span>
                </div>
              )}
              {taxAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax ({taxRate}%):</span>
                  <span>+{formatCurrency(taxAmount, settings.currencySymbol)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-slate-900 text-base pt-1">
                <span>Grand Total:</span>
                <span className="text-emerald-700">{formatCurrency(grandTotal, settings.currencySymbol)}</span>
              </div>
            </div>

            {/* Payment Mode */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 block">Payment Method</label>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Easypaisa: {settings.easypaisaNumber}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-[11px]">
                {[
                  { id: 'cash', label: 'Cash' },
                  { id: 'bank_transfer', label: 'Bank / Easypaisa' },
                  { id: 'credit', label: 'Khata / Credit' },
                  { id: 'split', label: 'Split' },
                ].map(pm => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                    className={`py-1.5 px-1 rounded-md font-semibold text-center transition-all ${
                      paymentMethod === pm.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Paid Amount Input & Change/Balance Calculation */}
            {paymentMethod !== 'credit' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">Paid Amount</label>
                  {paymentMethod === 'cash' && (
                    <div className="flex gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setPaidAmountInput(grandTotal.toString())}
                        className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-bold hover:bg-slate-300"
                      >
                        Exact
                      </button>
                    </div>
                  )}
                </div>
                <input
                  type="number"
                  placeholder={grandTotal.toString()}
                  value={paidAmountInput}
                  onChange={e => setPaidAmountInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />

                {changeReturn > 0 && (
                  <div className="flex justify-between items-center text-xs text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg mt-1 border border-emerald-200">
                    <span>Return Change:</span>
                    <span>{formatCurrency(changeReturn, settings.currencySymbol)}</span>
                  </div>
                )}
              </div>
            )}

            {balanceDue > 0 && (
              <div className="flex justify-between items-center text-xs text-red-700 font-bold bg-red-50 p-2 rounded-lg border border-red-200">
                <span>Khata Balance Remaining:</span>
                <span>{formatCurrency(balanceDue, settings.currencySymbol)}</span>
              </div>
            )}

            {/* Complete Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                cartItems.length === 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 active:scale-98'
              }`}
            >
              <span>Complete Sale & Print Bill</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
