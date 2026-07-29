import React, { useState } from 'react';
import { Printer, X, Download, CheckCircle2, Share2 } from 'lucide-react';
import { Sale, CustomerPayment, StoreSettings } from '../types';
import { formatCurrency, formatDateTime } from '../utils/formatters';

interface ReceiptModalProps {
  sale?: Sale | null;
  customerPayment?: CustomerPayment | null;
  settings: StoreSettings;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  sale,
  customerPayment,
  settings,
  onClose,
}) => {
  const [receiptType, setReceiptType] = useState<'thermal' | 'a4'>(settings.receiptType || 'thermal');

  if (!sale && !customerPayment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        
        {/* Header toolbar (Hidden in Print) */}
        <div className="print:hidden bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-lg">
              {sale ? `Invoice #${sale.invoiceNo}` : `Payment Receipt`}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {sale && (
              <div className="bg-slate-800 p-1 rounded-lg flex gap-1 text-xs">
                <button
                  onClick={() => setReceiptType('thermal')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    receiptType === 'thermal'
                      ? 'bg-emerald-600 text-white font-medium'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  80mm Thermal
                </button>
                <button
                  onClick={() => setReceiptType('a4')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    receiptType === 'a4'
                      ? 'bg-emerald-600 text-white font-medium'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  A4 Tax Invoice
                </button>
              </div>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Content Printable Area */}
        <div className="p-6 overflow-y-auto bg-slate-50 flex-1 flex justify-center">
          {sale ? (
            receiptType === 'thermal' ? (
              /* 80mm Thermal Receipt Layout */
              <div className="printable-area bg-white text-slate-900 font-mono text-xs p-5 shadow-sm border border-slate-200 w-[320px] rounded-lg">
                {/* Header */}
                <div className="text-center pb-3 border-b border-dashed border-slate-300">
                  <h2 className="font-extrabold text-base tracking-tight">{settings.storeName}</h2>
                  <p className="text-[11px] text-slate-600 font-sans mt-0.5">{settings.tagline}</p>
                  <p className="text-[10px] text-slate-500 font-sans mt-1">{settings.address}, {settings.city}</p>
                  <p className="text-[10px] text-slate-500 font-sans">Tel: {settings.phone}</p>
                  {settings.taxRegistrationNo && (
                    <p className="text-[10px] text-slate-600 font-bold font-sans mt-0.5">{settings.taxRegistrationNo}</p>
                  )}
                </div>

                {/* Metadata */}
                <div className="py-2 border-b border-dashed border-slate-300 text-[11px]">
                  <div className="flex justify-between">
                    <span>Invoice #:</span>
                    <span className="font-bold">{sale.invoiceNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{formatDateTime(sale.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span className="font-medium truncate max-w-[150px]">{sale.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment:</span>
                    <span className="uppercase font-semibold text-[10px] bg-slate-100 px-1 rounded">{sale.paymentMethod}</span>
                  </div>
                </div>

                {/* Items Table */}
                <div className="py-2 border-b border-dashed border-slate-300">
                  <div className="flex font-bold pb-1 border-b border-slate-200 text-[11px]">
                    <span className="flex-1">Item</span>
                    <span className="w-8 text-center">Qty</span>
                    <span className="w-14 text-right">Rate</span>
                    <span className="w-16 text-right">Total</span>
                  </div>

                  {sale.items.map((item, index) => (
                    <div key={index} className="py-1 border-b border-slate-100 text-[11px]">
                      <div className="font-semibold text-slate-800">{item.productName}</div>
                      <div className="flex text-slate-600">
                        <span className="flex-1 text-[10px] text-slate-400">SKU: {item.sku}</span>
                        <span className="w-8 text-center">{item.quantity} {item.unit}</span>
                        <span className="w-14 text-right">{item.unitPrice}</span>
                        <span className="w-16 text-right font-medium">{item.total}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="py-2 border-b border-dashed border-slate-300 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(sale.subtotal, settings.currencySymbol)}</span>
                  </div>
                  {sale.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount:</span>
                      <span>-{formatCurrency(sale.discountAmount, settings.currencySymbol)}</span>
                    </div>
                  )}
                  {sale.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({settings.defaultTaxRate}%):</span>
                      <span>{formatCurrency(sale.taxAmount, settings.currencySymbol)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-slate-300">
                    <span>GRAND TOTAL:</span>
                    <span>{formatCurrency(sale.grandTotal, settings.currencySymbol)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 pt-0.5">
                    <span>Paid Amount:</span>
                    <span>{formatCurrency(sale.paidAmount, settings.currencySymbol)}</span>
                  </div>
                  {sale.balanceDue > 0 && (
                    <div className="flex justify-between text-red-600 font-bold bg-red-50 p-1 rounded">
                      <span>Khata Balance Due:</span>
                      <span>{formatCurrency(sale.balanceDue, settings.currencySymbol)}</span>
                    </div>
                  )}
                </div>

                {/* Barcode representation */}
                <div className="text-center pt-3 pb-2">
                  <div className="inline-block tracking-widest font-mono text-base font-bold bg-slate-100 px-3 py-1 rounded border border-slate-200">
                    |||| | ||||| ||| |||
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1">{sale.invoiceNo}</p>
                </div>

                {/* Footer */}
                <div className="text-center text-[10px] text-slate-500 font-sans border-t border-dashed border-slate-300 pt-2">
                  <p>{settings.receiptFooterNote}</p>
                  <p className="mt-1 font-semibold text-slate-700">Software: Hafiz Traders ERP</p>
                </div>
              </div>
            ) : (
              /* Full A4 Tax Invoice Layout */
              <div className="printable-area bg-white text-slate-900 font-sans p-8 shadow-md border border-slate-200 w-full rounded-xl">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5 mb-6">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{settings.storeName}</h1>
                    <p className="text-xs text-slate-600 font-medium">{settings.tagline}</p>
                    <p className="text-xs text-slate-500 mt-1">{settings.address}, {settings.city}</p>
                    <p className="text-xs text-slate-500">Phone: {settings.phone} | {settings.secondaryPhone}</p>
                    {settings.taxRegistrationNo && (
                      <p className="text-xs font-semibold text-slate-700 mt-1">{settings.taxRegistrationNo}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="bg-slate-900 text-white font-bold text-xs px-3 py-1 rounded uppercase tracking-wider">
                      Tax Invoice
                    </span>
                    <h2 className="text-lg font-bold text-emerald-700 mt-2">{sale.invoiceNo}</h2>
                    <p className="text-xs text-slate-500">Date: {formatDateTime(sale.date)}</p>
                    <p className="text-xs text-slate-500 capitalize">Payment: {sale.paymentMethod}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 flex justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-400">Billed To:</span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">{sale.customerName}</h4>
                    {sale.customerPhone && <p className="text-xs text-slate-600">Tel: {sale.customerPhone}</p>}
                  </div>
                  {sale.notes && (
                    <div className="max-w-xs text-right">
                      <span className="text-[11px] font-bold uppercase text-slate-400">Invoice Notes:</span>
                      <p className="text-xs text-slate-600 italic mt-0.5">{sale.notes}</p>
                    </div>
                  )}
                </div>

                {/* Items Table */}
                <table className="w-full text-xs text-left mb-6 border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                      <th className="p-2.5 rounded-l">#</th>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5">SKU</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Unit Price</th>
                      <th className="p-2.5 text-right">Discount</th>
                      <th className="p-2.5 text-right rounded-r">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {sale.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 text-slate-400">{idx + 1}</td>
                        <td className="p-2.5 font-semibold text-slate-800">{item.productName}</td>
                        <td className="p-2.5 text-slate-500 font-mono text-[11px]">{item.sku}</td>
                        <td className="p-2.5 text-center font-medium">{item.quantity} {item.unit}</td>
                        <td className="p-2.5 text-right">{formatCurrency(item.unitPrice, settings.currencySymbol)}</td>
                        <td className="p-2.5 text-right text-emerald-600">
                          {item.discount > 0 ? `-${formatCurrency(item.discount, settings.currencySymbol)}` : '-'}
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-900">{formatCurrency(item.total, settings.currencySymbol)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals Summary */}
                <div className="flex justify-end mb-8">
                  <div className="w-64 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Subtotal:</span>
                      <span className="font-semibold">{formatCurrency(sale.subtotal, settings.currencySymbol)}</span>
                    </div>
                    {sale.discountAmount > 0 && (
                      <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700">
                        <span>Extra Discount:</span>
                        <span>-{formatCurrency(sale.discountAmount, settings.currencySymbol)}</span>
                      </div>
                    )}
                    {sale.taxAmount > 0 && (
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-600">Tax ({settings.defaultTaxRate}%):</span>
                        <span>{formatCurrency(sale.taxAmount, settings.currencySymbol)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-t-2 border-slate-900 font-bold text-sm text-slate-900">
                      <span>Grand Total:</span>
                      <span className="text-emerald-700">{formatCurrency(sale.grandTotal, settings.currencySymbol)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Amount Paid:</span>
                      <span>{formatCurrency(sale.paidAmount, settings.currencySymbol)}</span>
                    </div>
                    {sale.balanceDue > 0 && (
                      <div className="flex justify-between py-1.5 bg-red-50 text-red-700 font-bold px-2 rounded">
                        <span>Balance Due (Khata):</span>
                        <span>{formatCurrency(sale.balanceDue, settings.currencySymbol)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Notes & Signatures */}
                <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <h5 className="font-bold text-slate-800 text-[11px]">Terms & Conditions:</h5>
                    <p className="text-slate-500 text-[10px] mt-1">{settings.receiptFooterNote}</p>
                  </div>
                  <div className="text-right flex flex-col justify-end items-end">
                    <div className="w-36 border-b border-slate-400 mb-1"></div>
                    <p className="text-[10px] text-slate-500 font-semibold">Authorized Stamp & Signature</p>
                    <p className="text-[9px] text-slate-400 mt-1">Hafiz Traders Management</p>
                  </div>
                </div>
              </div>
            )
          ) : (
            /* Customer Payment Voucher Receipt */
            <div className="printable-area bg-white text-slate-900 font-sans p-6 shadow-md border border-slate-200 w-[420px] rounded-xl">
              <div className="text-center pb-4 border-b border-slate-200">
                <h2 className="font-extrabold text-xl text-emerald-800">{settings.storeName}</h2>
                <p className="text-xs text-slate-500">{settings.tagline}</p>
                <div className="mt-2 inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                  Payment Collection Voucher
                </div>
              </div>

              {customerPayment && (
                <div className="py-4 space-y-3 text-xs">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-slate-500">Voucher Ref:</span>
                    <span className="font-mono font-bold text-slate-800">{customerPayment.id}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-slate-500">Date & Time:</span>
                    <span>{formatDateTime(customerPayment.date)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-slate-500">Customer Name:</span>
                    <span className="font-bold text-slate-900">{customerPayment.customerName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-slate-500">Payment Mode:</span>
                    <span className="capitalize font-semibold">{customerPayment.paymentMethod.replace('_', ' ')}</span>
                  </div>
                  {customerPayment.referenceNo && (
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-500">Ref / Cheque #:</span>
                      <span className="font-mono">{customerPayment.referenceNo}</span>
                    </div>
                  )}

                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center mt-3">
                    <span className="text-[11px] text-emerald-700 font-medium">AMOUNT RECEIVED</span>
                    <div className="text-2xl font-black text-emerald-900 mt-0.5">
                      {formatCurrency(customerPayment.amount, settings.currencySymbol)}
                    </div>
                  </div>

                  {customerPayment.notes && (
                    <p className="text-[11px] text-slate-500 italic text-center mt-2">
                      Note: {customerPayment.notes}
                    </p>
                  )}
                </div>
              )}

              <div className="text-center text-[10px] text-slate-400 border-t pt-3 mt-2">
                Received with thanks. Hafiz Traders • Khata Management
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
