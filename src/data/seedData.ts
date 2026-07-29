import { Product, Customer, Supplier, Sale, Purchase, Expense, StoreSettings, CustomerPayment, SupplierPayment } from '../types';

export const initialStoreSettings: StoreSettings = {
  storeName: "Pitafi Brothers - Wholesale & Retail General Store",
  tagline: "Wholesale & Retail General Store",
  phone: "03058247545",
  secondaryPhone: "03132356165",
  email: "altafpitafi17@gmail.com",
  easypaisaNumber: "03132356165",
  address: "Master Allana Hassan Panhwer Goth, Near KIA Showroom & Kasim Textile Industry, Quaidabad, Malir",
  city: "Karachi, Pakistan",
  taxRegistrationNo: "NTN: 8492041-7",
  currencySymbol: "Rs.",
  currencyCode: "PKR",
  defaultTaxRate: 0,
  receiptFooterNote: "Thank you for shopping with Pitafi Brothers General Store! Location: Quaidabad, Malir, Karachi. Easypaisa Bill Payment: 03132356165 | Phone: 03058247545 / 03132356165.",
  receiptType: "thermal",
  enableLowStockAlerts: true,
};

export const initialProducts: Product[] = [
  {
    id: "prod-1",
    name: "Super Kernel Basmati Rice (50kg Bag)",
    sku: "HT-RICE-50",
    barcode: "896400010101",
    category: "Grains & Foodstuff",
    unit: "bag",
    costPrice: 13500,
    sellingPrice: 15200,
    stock: 45,
    minStockAlert: 10,
    supplierId: "sup-1",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80",
    description: "Premium long grain aromatic Basmati rice 50kg export grade",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-2",
    name: "Refined Cooking Oil (16 Liter Tin)",
    sku: "HT-OIL-16L",
    barcode: "896400010102",
    category: "Edible Oils",
    unit: "box",
    costPrice: 7800,
    sellingPrice: 8650,
    stock: 28,
    minStockAlert: 8,
    supplierId: "sup-2",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80",
    description: "First grade refined palm oil tin for wholesale & commercial use",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-3",
    name: "Refined White Sugar (50kg Bag)",
    sku: "HT-SUGAR-50",
    barcode: "896400010103",
    category: "Grains & Foodstuff",
    unit: "bag",
    costPrice: 6200,
    sellingPrice: 6850,
    stock: 12, // low stock alert trigger demo
    minStockAlert: 15,
    supplierId: "sup-1",
    description: "Pure white crystal refined sugar bag",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-4",
    name: "OPC Cement Bag (50kg)",
    sku: "HT-CEM-50",
    barcode: "896400010201",
    category: "Building Materials",
    unit: "bag",
    costPrice: 1220,
    sellingPrice: 1380,
    stock: 250,
    minStockAlert: 50,
    supplierId: "sup-3",
    description: "High strength Ordinary Portland Cement 50kg bag",
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-5",
    name: "Deformed Steel Rebar 60-Grade (1 Ton)",
    sku: "HT-STL-1T",
    barcode: "896400010202",
    category: "Building Materials",
    unit: "pcs",
    costPrice: 245000,
    sellingPrice: 265000,
    stock: 8,
    minStockAlert: 3,
    supplierId: "sup-3",
    description: "High yield structural grade steel bars for construction",
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-6",
    name: "Electric Water Pump (1.5 HP Copper Binding)",
    sku: "HT-PUMP-1.5",
    barcode: "896400010301",
    category: "Hardware & Tools",
    unit: "pcs",
    costPrice: 14500,
    sellingPrice: 17800,
    stock: 14,
    minStockAlert: 4,
    supplierId: "sup-4",
    description: "Heavy duty domestic water suction motor 1.5 HP",
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-7",
    name: "PVC Flexible Pipe 1 Inch (100 Meter Roll)",
    sku: "HT-PVC-1IN",
    barcode: "896400010302",
    category: "Hardware & Tools",
    unit: "box",
    costPrice: 3200,
    sellingPrice: 4100,
    stock: 4, // low stock
    minStockAlert: 5,
    supplierId: "sup-4",
    description: "Reinforced transparent PVC water garden hose coil",
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-8",
    name: "Solar Inverter 5.5kW Hybrid",
    sku: "HT-SOLAR-55K",
    barcode: "896400010401",
    category: "Electronics",
    unit: "pcs",
    costPrice: 185000,
    sellingPrice: 215000,
    stock: 6,
    minStockAlert: 2,
    supplierId: "sup-5",
    description: "5.5kW Pure Sine Wave hybrid solar inverter with MPPT charger",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-9",
    name: "Solar Panel 580W N-Type Mono PERC",
    sku: "HT-SOLAR-580W",
    barcode: "896400010402",
    category: "Electronics",
    unit: "pcs",
    costPrice: 21500,
    sellingPrice: 25800,
    stock: 35,
    minStockAlert: 10,
    supplierId: "sup-5",
    description: "Tier-1 high efficiency solar photovoltaic panel module",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-10",
    name: "Wheat Flour / Chakki Atta (20kg Bag)",
    sku: "HT-ATTA-20",
    barcode: "896400010104",
    category: "Grains & Foodstuff",
    unit: "bag",
    costPrice: 2400,
    sellingPrice: 2750,
    stock: 80,
    minStockAlert: 20,
    supplierId: "sup-1",
    description: "Whole wheat stone-ground nutritious flour 20kg",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const initialCustomers: Customer[] = [
  {
    id: "cust-1",
    name: "Tariq Mahmood General Store",
    phone: "+92 301 9876543",
    email: "tariq.store@gmail.com",
    address: "Shop #12, Saddar Bazaar, Multan",
    creditLimit: 150000,
    currentBalance: 42500, // owes Hafiz Traders 42,500
    notes: "Regular wholesale customer, pays on 15-day credit cycle.",
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
  },
  {
    id: "cust-2",
    name: "Chaudhry Builders & Contractors",
    phone: "+92 333 4567890",
    email: "chaudhry.constructions@yahoo.com",
    address: "Bosan Road, Near University Square, Multan",
    creditLimit: 500000,
    currentBalance: 185000, // owes 185,000
    notes: "Purchases cement, steel rebar & PVC hardware in bulk.",
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString()
  },
  {
    id: "cust-3",
    name: "Malik Solar Energy Solutions",
    phone: "+92 312 3334455",
    email: "malik.solar@outlook.com",
    address: "Auto Market, Vehari Road, Multan",
    creditLimit: 400000,
    currentBalance: 0, // fully clear balance
    notes: "Timely payments via online bank transfer.",
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString()
  },
  {
    id: "cust-4",
    name: "Haji Muhammad Yaqoob & Sons",
    phone: "+92 300 8877665",
    address: "Grain Market, Shop #5, Khanewal",
    creditLimit: 200000,
    currentBalance: 64200, // owes 64,200
    notes: "Buys rice bags & cooking oil tins.",
    createdAt: new Date(Date.now() - 100 * 86400000).toISOString()
  }
];

export const initialSuppliers: Supplier[] = [
  {
    id: "sup-1",
    companyName: "Al-Baraka Rice & Grain Mills",
    contactPerson: "Sheikh Bilal Ahmed",
    phone: "+92 321 1122334",
    email: "sales@albarakagrains.com",
    address: "Industrial Estate Zone-2, Kamoke",
    currentBalance: 85000, // We owe them
    notes: "Supplier for premium Basmati Rice, Sugar, and Wheat Flour",
    createdAt: new Date(Date.now() - 120 * 86400000).toISOString()
  },
  {
    id: "sup-2",
    companyName: "Kashmir Edible Oils Pvt Ltd",
    contactPerson: "Kamran Shah",
    phone: "+92 302 4455667",
    email: "orders@kashmiroil.com.pk",
    address: "Plot 88, Port Qasim, Karachi",
    currentBalance: 0,
    notes: "Edible Oil & Ghee bulk supplier",
    createdAt: new Date(Date.now() - 120 * 86400000).toISOString()
  },
  {
    id: "sup-3",
    companyName: "Mughal Steel & Cement Corporation",
    contactPerson: "Rana Zulfiqar",
    phone: "+92 300 7788990",
    email: "supply@mughalsteel.com",
    address: "GT Road, Lahore",
    currentBalance: 320000, // We owe them for steel shipment
    notes: "Steel rebar 60-grade and OPC Cement direct manufacturer distributor",
    createdAt: new Date(Date.now() - 150 * 86400000).toISOString()
  },
  {
    id: "sup-4",
    companyName: "National Hardware & Electric Store",
    contactPerson: "Imran Khan",
    phone: "+92 313 9988776",
    address: "Brandreth Road, Lahore",
    currentBalance: 14500,
    notes: "Water pumps, PVC pipes, electric motors, and general hardware",
    createdAt: new Date(Date.now() - 100 * 86400000).toISOString()
  },
  {
    id: "sup-5",
    companyName: "Apex Solar Imports Pakistan",
    contactPerson: "Faisal Latif",
    phone: "+92 334 5544332",
    email: "import@apexsolar.pk",
    address: "Blue Area, Islamabad",
    currentBalance: 120000,
    notes: "Importer for Tier-1 Solar Panels & Inverters",
    createdAt: new Date(Date.now() - 80 * 86400000).toISOString()
  }
];

export const initialSales: Sale[] = [
  {
    id: "sale-1001",
    invoiceNo: "HT-INV-1001",
    customerId: "cust-1",
    customerName: "Tariq Mahmood General Store",
    customerPhone: "+92 301 9876543",
    items: [
      {
        productId: "prod-1",
        productName: "Super Kernel Basmati Rice (50kg Bag)",
        sku: "HT-RICE-50",
        unit: "bag",
        quantity: 5,
        costPrice: 13500,
        unitPrice: 15200,
        discount: 0,
        total: 76000
      },
      {
        productId: "prod-2",
        productName: "Refined Cooking Oil (16 Liter Tin)",
        sku: "HT-OIL-16L",
        unit: "box",
        quantity: 2,
        costPrice: 7800,
        unitPrice: 8650,
        discount: 150,
        total: 17000
      }
    ],
    subtotal: 93000,
    taxAmount: 0,
    discountAmount: 500,
    grandTotal: 92500,
    paidAmount: 50000,
    balanceDue: 42500, // Udhaar sale
    paymentMethod: "split",
    notes: "Paid Rs. 50,000 cash, balance Rs. 42,500 added to Khata balance.",
    date: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: "sale-1002",
    invoiceNo: "HT-INV-1002",
    customerId: "cust-3",
    customerName: "Malik Solar Energy Solutions",
    customerPhone: "+92 312 3334455",
    items: [
      {
        productId: "prod-8",
        productName: "Solar Inverter 5.5kW Hybrid",
        sku: "HT-SOLAR-55K",
        unit: "pcs",
        quantity: 1,
        costPrice: 185000,
        unitPrice: 215000,
        discount: 0,
        total: 215000
      },
      {
        productId: "prod-9",
        productName: "Solar Panel 580W N-Type Mono PERC",
        sku: "HT-SOLAR-580W",
        unit: "pcs",
        quantity: 10,
        costPrice: 21500,
        unitPrice: 25800,
        discount: 300,
        total: 255000
      }
    ],
    subtotal: 470000,
    taxAmount: 0,
    discountAmount: 0,
    grandTotal: 470000,
    paidAmount: 470000,
    balanceDue: 0,
    paymentMethod: "bank_transfer",
    notes: "Full payment via Bank Allied transfer Ref #49281.",
    date: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: "sale-1003",
    invoiceNo: "HT-INV-1003",
    customerName: "Walk-in Cash Customer",
    items: [
      {
        productId: "prod-10",
        productName: "Wheat Flour / Chakki Atta (20kg Bag)",
        sku: "HT-ATTA-20",
        unit: "bag",
        quantity: 2,
        costPrice: 2400,
        unitPrice: 2750,
        discount: 0,
        total: 5500
      }
    ],
    subtotal: 5500,
    taxAmount: 0,
    discountAmount: 0,
    grandTotal: 5500,
    paidAmount: 5500,
    balanceDue: 0,
    paymentMethod: "cash",
    date: new Date().toISOString()
  }
];

export const initialPurchases: Purchase[] = [
  {
    id: "pur-1",
    purchaseNo: "HT-PO-501",
    supplierId: "sup-3",
    supplierName: "Mughal Steel & Cement Corporation",
    items: [
      {
        productId: "prod-5",
        productName: "Deformed Steel Rebar 60-Grade (1 Ton)",
        sku: "HT-STL-1T",
        unit: "pcs",
        quantity: 2,
        costPrice: 245000,
        total: 490000
      }
    ],
    totalAmount: 490000,
    paidAmount: 170000,
    balanceDue: 320000,
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    referenceInvoiceNo: "MS-BILL-9921",
    notes: "Partial payment paid at unloading time. Remaining due in 30 days."
  }
];

export const initialExpenses: Expense[] = [
  {
    id: "exp-1",
    category: "rent",
    title: "Main Shop Monthly Rent (July)",
    amount: 65000,
    paymentMethod: "bank_transfer",
    date: new Date(Date.now() - 10 * 86400000).toISOString(),
    notes: "Transferred to landlord Mr. Aslam"
  },
  {
    id: "exp-2",
    category: "electricity",
    title: "MEPCO Shop Electricity Bill",
    amount: 18450,
    paymentMethod: "bank_transfer",
    date: new Date(Date.now() - 7 * 86400000).toISOString(),
    notes: "Commercial meter tariff July bill"
  },
  {
    id: "exp-3",
    category: "transport",
    title: "Goods Carriage / Freight Charges (Multan Grain Market)",
    amount: 4500,
    paymentMethod: "cash",
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    notes: "Mazda truck rent for rice bag unloading"
  },
  {
    id: "exp-4",
    category: "tea_snacks",
    title: "Weekly Staff Tea & Refreshments",
    amount: 2300,
    paymentMethod: "cash",
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    notes: "Local tea shop bill"
  }
];

export const initialCustomerPayments: CustomerPayment[] = [
  {
    id: "cpay-1",
    customerId: "cust-1",
    customerName: "Tariq Mahmood General Store",
    amount: 20000,
    paymentMethod: "cash",
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    notes: "Cash payment received against invoice HT-INV-1001"
  }
];

export const initialSupplierPayments: SupplierPayment[] = [
  {
    id: "spay-1",
    supplierId: "sup-3",
    supplierName: "Mughal Steel & Cement Corporation",
    amount: 50000,
    paymentMethod: "bank_transfer",
    referenceNo: "MNET-883920",
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    notes: "Advance bank payment against steel shipment"
  }
];

export const initialFeedbacks = [
  {
    id: "fb-1",
    customerName: "Muhammad Ali",
    customerPhone: "03001234567",
    rating: 5,
    feedbackType: "appreciation",
    message: "Great wholesale prices and very quick service at Master Allana Hassan Panhwer Goth shop. Easypaisa bill payment option is very convenient!",
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: "resolved"
  },
  {
    id: "fb-2",
    customerName: "Rashid Minhas",
    customerPhone: "03129876543",
    rating: 4,
    feedbackType: "suggestion",
    message: "Kindly add more cooking oil varieties in wholesale bulk boxes.",
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    status: "pending"
  }
];
