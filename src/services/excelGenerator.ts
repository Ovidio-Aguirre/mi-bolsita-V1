// src/services/excelGenerator.ts
import * as XLSX from 'xlsx';
import { type Product, type Transaction, type Category, type Debt } from './firestoreService';

const currencyFormat = '"$"#,##0.00';

export const generateInventoryExcel = (products: Product[]): XLSX.WorkBook => {
  // ... (código de construcción del Excel sin cambios) ...
  const headers = ["Producto", "Stock Actual", "Precio Costo", "Precio Venta", "Valor Total (Costo)"];
  const data = products.map(p => ({ name: p.name, stock: p.stock, costPrice: p.costPrice, salePrice: p.salePrice, totalValue: p.stock * p.costPrice }));
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });
  data.forEach((_, index) => {
    const rowIndex = index + 2;
    if(ws[`C${rowIndex}`]) ws[`C${rowIndex}`].z = currencyFormat;
    if(ws[`D${rowIndex}`]) ws[`D${rowIndex}`].z = currencyFormat;
    if(ws[`E${rowIndex}`]) ws[`E${rowIndex}`].z = currencyFormat;
  });
  ws['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inventario");
  return wb;
};

export const generateStatementExcel = (transactions: Transaction[], categories: Category[]): XLSX.WorkBook => {
  // ... (código de construcción del Excel sin cambios) ...
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  const headers = ["Fecha", "Tipo", "Categoría", "Concepto", "Monto"];
  const data = transactions.map(t => [ t.createdAt.toDate(), t.type === 'income' ? 'Ingreso' : 'Gasto', categoryMap.get(t.categoryId || '') || 'N/A', t.concept, t.amount ]);
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  data.forEach((_, index) => {
    const rowIndex = index + 2;
    if(ws[`A${rowIndex}`]) ws[`A${rowIndex}`].z = 'dd/mm/yyyy';
    if(ws[`E${rowIndex}`]) ws[`E${rowIndex}`].z = currencyFormat;
  });
  ws['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 30 }, { wch: 15 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Movimientos");
  return wb;
};

export const generateSalesReportExcel = (transactions: Transaction[], products: Product[]): XLSX.WorkBook => {
  // ... (código de construcción del Excel sin cambios) ...
  const productMap = new Map(products.map(p => [p.id, p]));
  const salesData: { [key: string]: { name: string, quantity: number, revenue: number, cost: number } } = {};
  transactions.filter(t => t.type === 'income' && t.productId && t.quantity).forEach(sale => {
    const product = productMap.get(sale.productId!);
    if (product) {
      if (!salesData[product.id]) { salesData[product.id] = { name: product.name, quantity: 0, revenue: 0, cost: 0 }; }
      salesData[product.id].quantity += sale.quantity!;
      salesData[product.id].revenue += sale.amount;
      salesData[product.id].cost += product.costPrice * sale.quantity!;
    }
  });
  const headers = ["Producto", "Cantidad Vendida", "Ingresos Totales", "Costo de Venta", "Ganancia Bruta"];
  const data = Object.values(salesData).map(d => ({ name: d.name, quantity: d.quantity, revenue: d.revenue, cost: d.cost, profit: d.revenue - d.cost }));
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });
  data.forEach((_, index) => {
    const rowIndex = index + 2;
    if(ws[`C${rowIndex}`]) ws[`C${rowIndex}`].z = currencyFormat;
    if(ws[`D${rowIndex}`]) ws[`D${rowIndex}`].z = currencyFormat;
    if(ws[`E${rowIndex}`]) ws[`E${rowIndex}`].z = currencyFormat;
  });
  ws['!cols'] = [{ wch: 30 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ventas");
  return wb;
};

export const generateDebtsReportExcel = (debts: Debt[]): XLSX.WorkBook => {
  // ... (código de construcción del Excel sin cambios) ...
  const receivables = debts.filter(d => d.type === 'receivable');
  const payables = debts.filter(d => d.type === 'payable');
  const headers = ["Persona", "Concepto", "Saldo Pendiente"];
  const receivablesData = receivables.map(d => [d.personName, d.concept, d.currentBalance]);
  const payablesData = payables.map(d => [d.personName, d.concept, d.currentBalance]);
  const ws_receivables = XLSX.utils.aoa_to_sheet([headers, ...receivablesData]);
  const ws_payables = XLSX.utils.aoa_to_sheet([headers, ...payablesData]);
  [ws_receivables, ws_payables].forEach(ws => {
    Object.keys(ws).forEach(cellAddress => { if (cellAddress[0] === 'C' && cellAddress !== 'C1') { ws[cellAddress].z = currencyFormat; } });
    ws['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 20 }];
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws_receivables, "Cuentas por Cobrar");
  XLSX.utils.book_append_sheet(wb, ws_payables, "Cuentas por Pagar");
  return wb;
};