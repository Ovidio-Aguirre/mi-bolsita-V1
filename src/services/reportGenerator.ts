// src/services/reportGenerator.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type Transaction, type Category, type Product, type Debt } from './firestoreService';

// Creamos una interfaz extendida para que TypeScript conozca la propiedad 'lastAutoTable'
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

// --- REPORTE DE ESTADO DE RESULTADOS ---
export const generateStatementPDF = (
  transactions: Transaction[], categories: Category[], startDate: string, endDate: string
) => {
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
  // CORRECCIÓN: Definimos un tipo estricto para las filas
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
  doc.save(`Reporte_Financiero_${new Date().toISOString().slice(0, 10)}.pdf`);
};

// --- REPORTE DE VENTAS ---
export const generateSalesReportPDF = (
  transactions: Transaction[], products: Product[], startDate: string, endDate: string
) => {
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
  const tableRows: (string | number)[][] = []; // CORRECCIÓN
  Object.values(salesData).forEach(data => {
    const grossProfit = data.revenue - data.cost;
    tableRows.push([
      data.name, data.quantity, `$${data.revenue.toFixed(2)}`,
      `$${data.cost.toFixed(2)}`, `$${grossProfit.toFixed(2)}`
    ]);
  });

  autoTable(doc, { head: [tableColumn], body: tableRows, startY: 40 });
  doc.save(`Reporte_Ventas_${new Date().toISOString().slice(0, 10)}.pdf`);
};

// --- REPORTE DE INVENTARIO ---
export const generateInventoryReportPDF = (products: Product[]) => {
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
  const tableRows: (string | number)[][] = []; // CORRECCIÓN
  products.forEach(p => {
    tableRows.push([
      p.name, p.stock, `$${p.costPrice.toFixed(2)}`,
      `$${p.salePrice.toFixed(2)}`, `$${(p.stock * p.costPrice).toFixed(2)}`
    ]);
  });

  autoTable(doc, { head: [tableColumn], body: tableRows, startY: 50 });
  doc.save(`Reporte_Inventario_${new Date().toISOString().slice(0, 10)}.pdf`);
};

// --- REPORTE DE DEUDAS ---
export const generateDebtsReportPDF = (debts: Debt[]) => {
  const doc = new jsPDF() as jsPDFWithAutoTable; // CORRECCIÓN
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
    didDrawPage: (data) => {
      doc.setFontSize(14);
      doc.text('Cuentas por Cobrar (Me Deben)', data.settings.margin.left, 35);
    },
    foot: [[`Total por Cobrar: $${totalReceivables.toFixed(2)}`]],
    footStyles: { fontStyle: 'bold' }
  });

  autoTable(doc, {
    head: [["Persona", "Concepto", "Saldo Pendiente"]],
    body: payables.map(d => [d.personName, d.concept, `$${d.currentBalance.toFixed(2)}`]),
    startY: doc.lastAutoTable.finalY + 15, // CORRECCIÓN
    didDrawPage: (data) => {
      doc.setFontSize(14);
      doc.text('Cuentas por Pagar (Yo Debo)', data.settings.margin.left, doc.lastAutoTable.finalY + 10); // CORRECCIÓN
    },
    foot: [[`Total por Pagar: $${totalPayables.toFixed(2)}`]],
    footStyles: { fontStyle: 'bold' }
  });

  doc.save(`Reporte_Deudas_${new Date().toISOString().slice(0, 10)}.pdf`);
};