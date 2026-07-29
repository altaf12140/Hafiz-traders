import {
  Product,
  Customer,
  Supplier,
  Sale,
  Purchase,
  Expense,
  StoreSettings,
  CustomerPayment,
  SupplierPayment,
  StockAdjustment,
  CustomerFeedback
} from '../types';
import {
  initialStoreSettings,
  initialProducts,
  initialCustomers,
  initialSuppliers,
  initialSales,
  initialPurchases,
  initialExpenses,
  initialCustomerPayments,
  initialSupplierPayments,
  initialFeedbacks
} from '../data/seedData';

const STORAGE_KEYS = {
  SETTINGS: 'hafiz_traders_settings_v1',
  PRODUCTS: 'hafiz_traders_products_v1',
  CUSTOMERS: 'hafiz_traders_customers_v1',
  SUPPLIERS: 'hafiz_traders_suppliers_v1',
  SALES: 'hafiz_traders_sales_v1',
  PURCHASES: 'hafiz_traders_purchases_v1',
  EXPENSES: 'hafiz_traders_expenses_v1',
  CUSTOMER_PAYMENTS: 'hafiz_traders_cust_payments_v1',
  SUPPLIER_PAYMENTS: 'hafiz_traders_sup_payments_v1',
  STOCK_ADJUSTMENTS: 'hafiz_traders_stock_logs_v1',
  FEEDBACKS: 'hafiz_traders_feedbacks_v1',
};

export const loadState = () => {
  try {
    const settings: StoreSettings = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SETTINGS) || JSON.stringify(initialStoreSettings)
    );
    const products: Product[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.PRODUCTS) || JSON.stringify(initialProducts)
    );
    const customers: Customer[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || JSON.stringify(initialCustomers)
    );
    const suppliers: Supplier[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SUPPLIERS) || JSON.stringify(initialSuppliers)
    );
    const sales: Sale[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SALES) || JSON.stringify(initialSales)
    );
    const purchases: Purchase[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.PURCHASES) || JSON.stringify(initialPurchases)
    );
    const expenses: Expense[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.EXPENSES) || JSON.stringify(initialExpenses)
    );
    const customerPayments: CustomerPayment[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CUSTOMER_PAYMENTS) || JSON.stringify(initialCustomerPayments)
    );
    const supplierPayments: SupplierPayment[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SUPPLIER_PAYMENTS) || JSON.stringify(initialSupplierPayments)
    );
    const stockAdjustments: StockAdjustment[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.STOCK_ADJUSTMENTS) || '[]'
    );
    const feedbacks: CustomerFeedback[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.FEEDBACKS) || JSON.stringify(initialFeedbacks)
    );

    return {
      settings,
      products,
      customers,
      suppliers,
      sales,
      purchases,
      expenses,
      customerPayments,
      supplierPayments,
      stockAdjustments,
      feedbacks,
    };
  } catch (err) {
    console.error("Failed to load state from localStorage, using initial defaults:", err);
    return {
      settings: initialStoreSettings,
      products: initialProducts,
      customers: initialCustomers,
      suppliers: initialSuppliers,
      sales: initialSales,
      purchases: initialPurchases,
      expenses: initialExpenses,
      customerPayments: initialCustomerPayments,
      supplierPayments: initialSupplierPayments,
      stockAdjustments: [],
      feedbacks: initialFeedbacks,
    };
  }
};

export const saveState = (data: {
  settings?: StoreSettings;
  products?: Product[];
  customers?: Customer[];
  suppliers?: Supplier[];
  sales?: Sale[];
  purchases?: Purchase[];
  expenses?: Expense[];
  customerPayments?: CustomerPayment[];
  supplierPayments?: SupplierPayment[];
  stockAdjustments?: StockAdjustment[];
  feedbacks?: CustomerFeedback[];
}) => {
  try {
    if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    if (data.products) localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data.products));
    if (data.customers) localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(data.customers));
    if (data.suppliers) localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(data.suppliers));
    if (data.sales) localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(data.sales));
    if (data.purchases) localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(data.purchases));
    if (data.expenses) localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(data.expenses));
    if (data.customerPayments) localStorage.setItem(STORAGE_KEYS.CUSTOMER_PAYMENTS, JSON.stringify(data.customerPayments));
    if (data.supplierPayments) localStorage.setItem(STORAGE_KEYS.SUPPLIER_PAYMENTS, JSON.stringify(data.supplierPayments));
    if (data.stockAdjustments) localStorage.setItem(STORAGE_KEYS.STOCK_ADJUSTMENTS, JSON.stringify(data.stockAdjustments));
    if (data.feedbacks) localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(data.feedbacks));
  } catch (err) {
    console.error("Error saving state to localStorage:", err);
  }
};

export const resetToDemoData = () => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialStoreSettings));
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(initialCustomers));
  localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(initialSuppliers));
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(initialSales));
  localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(initialPurchases));
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(initialExpenses));
  localStorage.setItem(STORAGE_KEYS.CUSTOMER_PAYMENTS, JSON.stringify(initialCustomerPayments));
  localStorage.setItem(STORAGE_KEYS.SUPPLIER_PAYMENTS, JSON.stringify(initialSupplierPayments));
  localStorage.setItem(STORAGE_KEYS.STOCK_ADJUSTMENTS, '[]');
  localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(initialFeedbacks));
};
