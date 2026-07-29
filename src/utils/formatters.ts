export const formatCurrency = (amount: number, symbol: string = "Rs."): string => {
  const formatted = new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount || 0);
  
  return `${symbol} ${formatted}`;
};

export const formatDate = (isoString?: string): string => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (isoString?: string): string => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const generateInvoiceNo = (existingSalesCount: number): string => {
  const nextNum = existingSalesCount + 1001;
  return `HT-INV-${nextNum}`;
};

export const generatePurchaseNo = (existingPurchasesCount: number): string => {
  const nextNum = existingPurchasesCount + 501;
  return `HT-PO-${nextNum}`;
};

export const generateSKU = (name: string, category: string): string => {
  const catPrefix = category.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'GEN');
  const nameClean = name.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, 'ITEM');
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `HT-${catPrefix}-${nameClean}-${randomNum}`;
};

export const exportToCSV = (filename: string, rows: object[]) => {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map(row => {
        return keys
          .map(k => {
            const val = (row as Record<string, unknown>)[k];
            let cellStr = val === null || val === undefined ? '' : typeof val === 'object' ? JSON.stringify(val) : String(val);
            cellStr = cellStr.replace(/"/g, '""');
            if (cellStr.search(/("|,|\n)/g) >= 0) {
              cellStr = `"${cellStr}"`;
            }
            return cellStr;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
