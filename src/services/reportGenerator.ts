// src/services/reportGenerator.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type Transaction, type Category, type Product, type Debt } from './firestoreService';

interface jsPDFWithAutoTable extends jsPDF { lastAutoTable: { finalY: number; }; }

// --- REPORTE DE ESTADO DE RESULTADOS ---
export const generateStatementPDF = (
  transactions: Transaction[], categories: Category[], startDate: string, endDate: string
): jsPDF => {
  const doc = new jsPDF();
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  doc.setFontSize(18);
  doc.text('Reporte de Estado de Resultados', 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Período: ${startDate} al ${endDate}`, 14, 29);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpense;

  doc.setFontSize(12);
  doc.text('Resumen General', 14, 45);
  doc.setFontSize(10);
  doc.text(`Total Ingresos: $${totalIncome.toFixed(2)}`, 14, 52);
  doc.text(`Total Gastos: $${totalExpense.toFixed(2)}`, 14, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Ganancia Neta: $${netProfit.toFixed(2)}`, 14, 68);
  doc.setFont('helvetica', 'normal');

  const tableColumn = ["Fecha", "Tipo", "Categoría", "Concepto", "Monto"];
  const tableRows: (string | number)[][] = [];
  transactions.forEach(t => {
    const transactionData = [
      t.createdAt.toDate().toLocaleDateString('es-SV'),
      t.type === 'income' ? 'Ingreso' : 'Gasto',
      categoryMap.get(t.categoryId || '') || 'N/A',
      t.concept,
      `$${t.amount.toFixed(2)}`
    ];
    tableRows.push(transactionData);
  });

  autoTable(doc, { head: [tableColumn], body: tableRows, startY: 75 });
  return doc; // Devuelve el doc
};

// --- REPORTE DE VENTAS ---
export const generateSalesReportPDF = (
  transactions: Transaction[], products: Product[], startDate: string, endDate: string
): jsPDF => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Reporte de Ventas por Producto', 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Período: ${startDate} al ${endDate}`, 14, 29);

  const salesData: { [key: string]: { name: string, quantity: number, revenue: number, cost: number } } = {};
  const productMap = new Map(products.map(p => [p.id, p]));

  transactions.filter(t => t.type === 'income' && t.productId && t.quantity).forEach(sale => {
    const product = productMap.get(sale.productId!);
    if (product) {
      if (!salesData[product.id]) {
        salesData[product.id] = { name: product.name, quantity: 0, revenue: 0, cost: 0 };
      }
      salesData[product.id].quantity += sale.quantity!;
      salesData[product.id].revenue += sale.amount;
      salesData[product.id].cost += product.costPrice * sale.quantity!;
    }
  });

  const tableColumn = ["Producto", "Cantidad Vendida", "Ingresos Totales", "Costo de Venta", "Ganancia Bruta"];
  const tableRows: (string | number)[][] = [];
  Object.values(salesData).forEach(data => {
    const grossProfit = data.revenue - data.cost;
    tableRows.push([
      data.name, data.quantity, `$${data.revenue.toFixed(2)}`,
      `$${data.cost.toFixed(2)}`, `$${grossProfit.toFixed(2)}`
    ]);
  });

  autoTable(doc, { head: [tableColumn], body: tableRows, startY: 40 });
  return doc; // Devuelve el doc
};

// --- REPORTE DE INVENTARIO ---
export const generateInventoryReportPDF = (products: Product[]): jsPDF => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Reporte de Inventario Actual', 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generado el: ${new Date().toLocaleDateString('es-SV')}`, 14, 29);

  const totalValue = products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);
  doc.setFontSize(12);
  doc.text(`Valor Total del Inventario (a costo): $${totalValue.toFixed(2)}`, 14, 40);

  const tableColumn = ["Producto", "Stock Actual", "Precio Costo", "Precio Venta", "Valor Total"];
  const tableRows: (string | number)[][] = [];
  products.forEach(p => {
    tableRows.push([
      p.name, p.stock, `$${p.costPrice.toFixed(2)}`,
      `$${p.salePrice.toFixed(2)}`, `$${(p.stock * p.costPrice).toFixed(2)}`
    ]);
  });

  autoTable(doc, { head: [tableColumn], body: tableRows, startY: 50 });
  return doc; // Devuelve el doc
};

// --- REPORTE DE DEUDAS ---
export const generateDebtsReportPDF = (debts: Debt[]): jsPDF => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  doc.setFontSize(18);
  doc.text('Reporte de Deudas Pendientes', 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generado el: ${new Date().toLocaleDateString('es-SV')}`, 14, 29);

  const receivables = debts.filter(d => d.type === 'receivable');
  const payables = debts.filter(d => d.type === 'payable');
  const totalReceivables = receivables.reduce((sum, d) => sum + d.currentBalance, 0);
  const totalPayables = payables.reduce((sum, d) => sum + d.currentBalance, 0);

  autoTable(doc, {
    head: [["Persona", "Concepto", "Saldo Pendiente"]],
    body: receivables.map(d => [d.personName, d.concept, `$${d.currentBalance.toFixed(2)}`]),
    startY: 40,
    didDrawPage: (data) => { doc.setFontSize(14); doc.text('Cuentas por Cobrar (Me Deben)', data.settings.margin.left, 35); },
    foot: [[`Total por Cobrar: $${totalReceivables.toFixed(2)}`]],
    footStyles: { fontStyle: 'bold' }
  });

  autoTable(doc, {
    head: [["Persona", "Concepto", "Saldo Pendiente"]],
    body: payables.map(d => [d.personName, d.concept, `$${d.currentBalance.toFixed(2)}`]),
    startY: doc.lastAutoTable.finalY + 15,
    didDrawPage: (data) => { doc.setFontSize(14); doc.text('Cuentas por Pagar (Yo Debo)', data.settings.margin.left, doc.lastAutoTable.finalY + 10); },
    foot: [[`Total por Pagar: $${totalPayables.toFixed(2)}`]],
    footStyles: { fontStyle: 'bold' }
  });

  return doc; // Devuelve el doc
};

// --- FUNCIÓN ACTUALIZADA: CIERRE DE CAJA DIARIO ---
export const generateDailyClosingPDF = (
  dailyTransactions: Transaction[],
  allProducts: Product[]
): jsPDF => {
  const doc = new jsPDF() as jsPDFWithAutoTable; // Usar la interfaz extendida
  const today = new Date();
  const formattedDate = today.toLocaleDateString('es-SV', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const productMap = new Map(allProducts.map(p => [p.id, p]));

  doc.setFontSize(18);
  doc.text('Cierre de Caja Diario', 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(formattedDate, 14, 29);

  // --- Sección 1: Resumen de Ventas de Productos del Día ---
  const salesSummary: { [productId: string]: { name: string; quantity: number; total: number; unitPrice: number } } = {};
  let totalProductSales = 0;

  dailyTransactions.forEach(t => {
    if (t.type === 'income' && t.items && t.items.length > 0) { // Venta multi-item
      t.items.forEach(item => {
        if (!salesSummary[item.productId]) {
          salesSummary[item.productId] = { name: item.productName, quantity: 0, total: 0, unitPrice: item.salePrice };
        }
        salesSummary[item.productId].quantity += item.quantity;
        salesSummary[item.productId].total += item.salePrice * item.quantity;
        totalProductSales += item.salePrice * item.quantity;
      });
    } else if (t.type === 'income' && t.productId && t.quantity) { // Venta simple
        const product = productMap.get(t.productId);
        if(product){
             if (!salesSummary[t.productId]) {
                salesSummary[t.productId] = { name: product.name, quantity: 0, total: 0, unitPrice: product.salePrice };
            }
            salesSummary[t.productId].quantity += t.quantity;
            salesSummary[t.productId].total += t.amount;
            totalProductSales += t.amount;
        }
    }
  });

  const salesTableColumn = ["Producto", "Cant.", "Precio Unit.", "Total Venta"];
  const salesTableRows = Object.values(salesSummary).map(s => [
    s.name, s.quantity, `$${s.unitPrice.toFixed(2)}`, `$${s.total.toFixed(2)}`
  ]);

  autoTable(doc, {
    head: [salesTableColumn],
    body: salesTableRows,
    startY: 40,
    didDrawPage: (data) => { doc.setFontSize(14); doc.text('Resumen de Ventas de Productos', data.settings.margin.left, 35); },
    foot: [[{content: `Total Venta Productos: $${totalProductSales.toFixed(2)}`, colSpan: 4, styles: { halign: 'right' }}]], // Ajuste para que ocupe toda la fila
    footStyles: { fontStyle: 'bold' }
  });

  let currentY = doc.lastAutoTable.finalY + 10;

  // --- Sección 2: Estado de Inventario (Solo Productos Vendidos Hoy) ---
  const soldProductIds = Object.keys(salesSummary);
  const inventoryTableColumn = ["Producto", "Stock Restante"];
  const inventoryTableRows = soldProductIds.map(id => {
    const product = productMap.get(id);
    return [product?.name || 'Desconocido', product?.stock || 0];
  });

  if (soldProductIds.length > 0) {
    autoTable(doc, {
      head: [inventoryTableColumn],
      body: inventoryTableRows,
      startY: currentY + 5,
      didDrawPage: (data) => { doc.setFontSize(14); doc.text('Estado de Inventario (Productos Vendidos)', data.settings.margin.left, currentY); },
    });
    currentY = doc.lastAutoTable.finalY + 10;
  }

  // --- Sección 3: Resumen Financiero General del Día ---
  const totalIncome = dailyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = dailyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpense;

  doc.setFontSize(14);
  doc.text('Resumen Financiero del Día', 14, currentY);
  currentY += 7;
  doc.setFontSize(10);
  doc.text(`Total Ingresos (Todas las fuentes): $${totalIncome.toFixed(2)}`, 14, currentY);
  currentY += 7;
  doc.text(`Total Gastos: $${totalExpense.toFixed(2)}`, 14, currentY);
  currentY += 9;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Ganancia Neta del Día: $${netProfit.toFixed(2)}`, 14, currentY);

  return doc; // Devuelve el doc
};