import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  AlertTriangle,
  TrendingUp,
  Package,
  Users,
  CheckCircle2,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Wallet,
  Store,
  MessageSquare
} from 'lucide-react';
import { Product, Customer, Sale, Expense, Supplier, StoreSettings, CustomerFeedback } from '../types';
import { formatCurrency } from '../utils/formatters';

interface AICopilotProps {
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  expenses: Expense[];
  suppliers: Supplier[];
  settings: StoreSettings;
  onAddFeedback?: (fb: CustomerFeedback) => void;
}

export const AICopilot: React.FC<AICopilotProps> = ({
  products,
  customers,
  sales,
  expenses,
  suppliers,
  settings,
  onAddFeedback,
}) => {
  const [userQuery, setUserQuery] = useState('');
  const [messages, setMessages] = useState<
    { sender: 'user' | 'assistant'; text: string; date: string }[]
  >([
    {
      sender: 'assistant',
      text: `Assalam-o-Alaikum! Main **Pitafi Brothers AI Professional Assistant** hoon for **${settings.storeName}** (Wholesale & Retail General Store).\n\nMain aap ki tamam cheezon mein madad kr sakta hoon:\n• **Easypaisa Bill Payment**: Send payment to **03132356165**\n• **Owner**: Pitafi Brothers | **Phone**: ${settings.phone} | **Email**: ${settings.email}\n• **Location**: ${settings.address}\n• Wholesale vs Retail price lookup, Cash/Credit (Khata) accounts, stock levels, and Customer Feedback collection!\n\nAap Urdu ya English mein jo bhi sawaal bolein, main answer dunga.`,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [loading, setLoading] = useState(false);

  // Quick preset queries
  const handlePresetQuery = (prompt: string) => {
    setUserQuery(prompt);
    processQuery(prompt);
  };

  const processQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: queryText,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setUserQuery('');
    setLoading(true);

    let responseText = '';
    const queryLower = queryText.toLowerCase();

    // 1. Contact / Address / Easypaisa info
    if (
      queryLower.includes('easypaisa') ||
      queryLower.includes('bill pay') ||
      queryLower.includes('payment method') ||
      queryLower.includes('number') ||
      queryLower.includes('phone') ||
      queryLower.includes('contact') ||
      queryLower.includes('location') ||
      queryLower.includes('address') ||
      queryLower.includes('owner') ||
      queryLower.includes('email')
    ) {
      responseText = `📍 **${settings.storeName} Details & Contact:**\n\n` +
        `• **Owner**: Pitafi Brothers\n` +
        `• **Business Type**: Wholesale & Retail General Store\n` +
        `• **Phone / WhatsApp**: **${settings.phone}**\n` +
        `• **Email**: **${settings.email}**\n` +
        `• **Easypaisa Bill Payment Number**: **${settings.easypaisaNumber}**\n` +
        `• **Location / Address**: ${settings.address}, ${settings.city}\n\n` +
        `💡 *Note: Send payment screenshots on WhatsApp ${settings.phone} for instant Khata credit confirmation.*`;
    }
    // 2. Feedback sub-intent
    else if (queryLower.includes('feedback') || queryLower.includes('complaint') || queryLower.includes('review') || queryLower.includes('tareef')) {
      if (onAddFeedback) {
        onAddFeedback({
          id: `fb-${Date.now()}`,
          customerName: 'AI Chatbot Visitor',
          customerPhone: settings.phone,
          rating: 5,
          feedbackType: queryLower.includes('complaint') ? 'complaint' : 'appreciation',
          message: queryText,
          date: new Date().toISOString(),
          status: 'pending',
        });
      }
      responseText = `⭐ **Customer Feedback Registered!**\n\n` +
        `Shukriya! Aap ka feedback/review Pitafi Brothers management team tak pohanch chuka hai.\n` +
        `Hum aap ki behtareen khidmat ke liye hamesha koshish krtay hain.\n\n` +
        `Aap 'Customer Feedback' tab per ja kar tamaam customer reviews aur ratings bhi dekh saktay hain!`;
    }
    // 3. Wholesale vs Retail / Stock / Prices
    else if (queryLower.includes('wholesale') || queryLower.includes('retail') || queryLower.includes('price') || queryLower.includes('rate') || queryLower.includes('stock')) {
      const topProducts = products.slice(0, 6);
      responseText = `🛒 **Wholesale & Retail Product List (${settings.storeName}):**\n\n` +
        topProducts.map(p => `• **${p.name}** [Category: ${p.category}]\n  - Selling Rate: **${formatCurrency(p.sellingPrice, settings.currencySymbol)}** / ${p.unit}\n  - Cost Rate: ${formatCurrency(p.costPrice, settings.currencySymbol)}\n  - Available Stock: **${p.stock} ${p.unit}** ${p.stock <= p.minStockAlert ? '(⚠️ Low Stock)' : '(In Stock)'}`).join('\n\n') +
        `\n\n💡 *Note: For special bulk wholesale discount orders, contact Pitafi Brothers at ${settings.phone}.*`;
    }
    // 4. Low stock
    else if (queryLower.includes('low stock') || queryLower.includes('reorder')) {
      const lowItems = products.filter(p => p.stock <= p.minStockAlert);
      if (lowItems.length === 0) {
        responseText = "✅ **All Stock Healthy!** No items are currently below minimum stock levels.";
      } else {
        responseText = `⚠️ **Low Stock Reorder Alert (${lowItems.length} items):**\n\n` +
          lowItems.map(p => `• **${p.name}**: Stock = **${p.stock} ${p.unit}** (Min Alert: ${p.minStockAlert}) | Cost: ${formatCurrency(p.costPrice, settings.currencySymbol)}`).join('\n') +
          `\n\n💡 *Action Required: Order stock from suppliers.*`;
      }
    }
    // 5. Khata / Credit / Udhaar
    else if (queryLower.includes('khata') || queryLower.includes('udhaar') || queryLower.includes('credit') || queryLower.includes('customer balance')) {
      const dueCustomers = customers
        .filter(c => c.currentBalance > 0)
        .sort((a, b) => b.currentBalance - a.currentBalance);
      const totalReceivables = dueCustomers.reduce((a, c) => a + c.currentBalance, 0);

      responseText = `💳 **Customer Khata & Credit Ledger:**\n\n` +
        `• Total Receivable Udhaar: **${formatCurrency(totalReceivables, settings.currencySymbol)}**\n` +
        `• Total Credit Customers: **${dueCustomers.length}**\n\n` +
        `**Pending Customer Balances:**\n` +
        dueCustomers.map(c => `• **${c.name}**: ${formatCurrency(c.currentBalance, settings.currencySymbol)} (Phone: ${c.phone})`).join('\n') +
        `\n\n💡 *Customers can pay bill via Easypaisa: ${settings.easypaisaNumber}*`;
    }
    // 6. Sales & Financials
    else if (queryLower.includes('sales') || queryLower.includes('today') || queryLower.includes('profit') || queryLower.includes('revenue') || queryLower.includes('cash')) {
      const totalRev = sales.reduce((a, s) => a + s.grandTotal, 0);
      let cogs = 0;
      sales.forEach(s => s.items.forEach(i => (cogs += i.costPrice * i.quantity)));
      const grossProfit = totalRev - cogs;
      const totalExp = expenses.reduce((a, e) => a + e.amount, 0);
      const netProfit = grossProfit - totalExp;

      responseText = `📊 **Financial & Cash Flow Summary:**\n\n` +
        `• Total Invoice Count: **${sales.length}**\n` +
        `• Total Gross Revenue: **${formatCurrency(totalRev, settings.currencySymbol)}**\n` +
        `• Cost of Goods Sold (COGS): **${formatCurrency(cogs, settings.currencySymbol)}**\n` +
        `• Total Expenses: **${formatCurrency(totalExp, settings.currencySymbol)}**\n` +
        `• **Net Operating Profit**: **${formatCurrency(netProfit, settings.currencySymbol)}**`;
    }
    // 7. General fallback
    else {
      responseText = `🤖 **Pitafi Brothers Professional AI Assistant Response:**\n\n` +
        `Aap ke sawaal *" ${queryText} "* ke bare mein:\n\n` +
        `• **Store**: ${settings.storeName} (Wholesale & Retail)\n` +
        `• **Contact Phone**: ${settings.phone} | **Email**: ${settings.email}\n` +
        `• **Easypaisa Payment**: ${settings.easypaisaNumber}\n` +
        `• **Location**: ${settings.address}\n` +
        `• **Total Products**: ${products.length} items | **Khata Receivables**: ${formatCurrency(customers.reduce((a, c) => a + (c.currentBalance > 0 ? c.currentBalance : 0), 0), settings.currencySymbol)}\n\n` +
        `Aap inventory, wholesale rates, Easypaisa bill payment, customer feedback, ya khata balances ke bare mein mazeed pooch saktay hain!`;
    }

    // Server API Proxy call if server available
    try {
      const apiRes = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText }),
      });
      if (apiRes.ok) {
        const json = await apiRes.json();
        if (json.reply) responseText = json.reply;
      }
    } catch {
      // client fallback
    }

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: responseText,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">Pitafi Brothers AI Professional Assistant</h2>
              <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
                AI Customer & POS Assistant
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Wholesale & Retail General Store • Credit (Khata), Cash, Easypaisa Bill Pay & Feedback Handling
            </p>
          </div>
        </div>

        <div className="bg-slate-800/80 px-3 py-2 rounded-xl text-xs text-slate-300 border border-slate-700 flex flex-col gap-1">
          <span className="flex items-center gap-1 font-semibold text-emerald-400">
            <Wallet className="w-3.5 h-3.5" /> Easypaisa: {settings.easypaisaNumber}
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <Phone className="w-3.5 h-3.5 text-indigo-400" /> Phone: {settings.phone}
          </span>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => handlePresetQuery("Store Location & Easypaisa Bill Payment Details")}
          className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-500 text-slate-700 font-semibold rounded-lg whitespace-nowrap shadow-xs flex items-center gap-1.5"
        >
          <Wallet className="w-3.5 h-3.5 text-emerald-600" /> Location & Easypaisa
        </button>

        <button
          onClick={() => handlePresetQuery("Wholesale and Retail product rates & stock")}
          className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-500 text-slate-700 font-semibold rounded-lg whitespace-nowrap shadow-xs flex items-center gap-1.5"
        >
          <Store className="w-3.5 h-3.5 text-indigo-600" /> Wholesale Rates & Stock
        </button>

        <button
          onClick={() => handlePresetQuery("Customer Khata credit balance and cash details")}
          className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-500 text-slate-700 font-semibold rounded-lg whitespace-nowrap shadow-xs flex items-center gap-1.5"
        >
          <Users className="w-3.5 h-3.5 text-blue-600" /> Credit / Khata Ledgers
        </button>

        <button
          onClick={() => handlePresetQuery("Low stock reorder items")}
          className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-500 text-slate-700 font-semibold rounded-lg whitespace-nowrap shadow-xs flex items-center gap-1.5"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Low Stock Alert
        </button>
      </div>

      {/* Messages Thread Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 h-[440px] flex flex-col justify-between">
        <div className="overflow-y-auto space-y-3 pr-2 flex-1">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                    : 'bg-slate-50 text-slate-900 border border-slate-200 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">
                  {msg.text.split('\n').map((line, lIdx) => (
                    <p key={lIdx} className="mb-1 last:mb-0">
                      {line}
                    </p>
                  ))}
                </div>
                <div
                  className={`text-[9px] mt-1 text-right ${
                    msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  {msg.date}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 p-3 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                <span>AI processing request for Pitafi Brothers General Store...</span>
              </div>
            </div>
          )}
        </div>

        {/* Query Input Form */}
        <form
          onSubmit={e => {
            e.preventDefault();
            processQuery(userQuery);
          }}
          className="mt-3 pt-3 border-t border-slate-200 flex gap-2"
        >
          <input
            type="text"
            placeholder="Poochein (Ask AI about prices, Easypaisa, Khata, Location)..."
            value={userQuery}
            onChange={e => setUserQuery(e.target.value)}
            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="submit"
            disabled={loading || !userQuery.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" /> Send
          </button>
        </form>
      </div>

    </div>
  );
};
