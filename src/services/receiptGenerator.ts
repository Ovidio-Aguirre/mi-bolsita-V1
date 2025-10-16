// src/services/receiptGenerator.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type UserProfile } from './firestoreService';
import { numeroALetras } from './numberToWords';

interface CartItem {
  product: { name: string; salePrice: number; };
  quantity: number;
}

interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

// La función ahora devuelve el objeto PDF en lugar de guardarlo
export const generateReceiptPDF = (
  cart: CartItem[],
  profile: UserProfile,
  receiptNumber: number,
  paymentMethod: string,
  discountAmount: number,
  cashTendered?: number
): jsPDF => { // <-- Se define el tipo de retorno
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 160 + (cart.length * 5)]
  }) as jsPDFWithAutoTable;

  // ... (Todo el código para construir el PDF permanece exactamente igual)
  const centerX = doc.internal.pageSize.getWidth() / 2;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('<< RECIBO DE VENTA INTERNA >>', centerX, 10, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('<< COMPROBANTE NO FISCAL >>', centerX, 14, { align: 'center' });
  doc.text('----------------------------------------------------', centerX, 18, { align: 'center' });
  doc.setFontSize(9);
  doc.text(profile.businessName || 'Nombre no configurado', centerX, 22, { align: 'center' });
  doc.setFontSize(8);
  doc.text(profile.businessAddress || 'Dirección no configurada', centerX, 26, { align: 'center' });
  doc.text(`TEL: ${profile.businessPhone || 'N/A'}`, centerX, 30, { align: 'center' });
  doc.text('----------------------------------------------------', centerX, 34, { align: 'center' });
  const receiptId = receiptNumber.toString().padStart(7, '0');
  const saleDate = new Date();
  doc.text(`RECIBO No. ${receiptId}`, 5, 40);
  doc.text(`FECHA: ${saleDate.toLocaleDateString('es-SV')}`, 5, 44);
  doc.text(`HORA: ${saleDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`, doc.internal.pageSize.getWidth() - 5, 44, { align: 'right' });
  autoTable(doc, {
    head: [['CANT.', 'DESCRIPCIÓN', 'PRECIO']],
    body: cart.map(item => [ item.quantity.toFixed(1), item.product.name, `$${(item.product.salePrice * item.quantity).toFixed(2)}` ]),
    startY: 48, theme: 'plain', headStyles: { halign: 'center', fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 0.5 },
    columnStyles: { 0: { cellWidth: 10, halign: 'center' }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 15, halign: 'right' } }
  });
  let finalY = doc.lastAutoTable.finalY;
  doc.text('----------------------------------------------------', centerX, finalY + 4, { align: 'center' });
  const subtotal = cart.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
  const finalTotal = subtotal - discountAmount;
  doc.setFont('helvetica', 'normal');
  doc.text('SUBTOTAL:', 5, finalY + 10);
  doc.text(`$${subtotal.toFixed(2)}`, doc.internal.pageSize.getWidth() - 5, finalY + 10, { align: 'right' });
  doc.text('(-) Descuento:', 5, finalY + 14);
  doc.text(`$${discountAmount.toFixed(2)}`, doc.internal.pageSize.getWidth() - 5, finalY + 14, { align: 'right' });
  doc.text('----------------------------------------------------', centerX, finalY + 18, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL A PAGAR:', 5, finalY + 22);
  doc.text(`$${finalTotal.toFixed(2)}`, doc.internal.pageSize.getWidth() - 5, finalY + 22, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  if (paymentMethod === 'Efectivo' && cashTendered && cashTendered >= finalTotal) {
    const change = cashTendered - finalTotal;
    doc.text('Efectivo Recibido:', 5, finalY + 26);
    doc.text(`$${cashTendered.toFixed(2)}`, doc.internal.pageSize.getWidth() - 5, finalY + 26, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text('Cambio a Devolver:', 5, finalY + 30);
    doc.text(`$${change.toFixed(2)}`, doc.internal.pageSize.getWidth() - 5, finalY + 30, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    finalY += 12;
  }
  doc.text('----------------------------------------------------', centerX, finalY + 26, { align: 'center' });
  const amountInWords = numeroALetras(finalTotal);
  doc.setFontSize(7);
  doc.text(`VALOR EN LETRAS: ${amountInWords}`, 5, finalY + 32, { maxWidth: 70 });
  doc.text(`FORMA DE PAGO: ${paymentMethod.toUpperCase()}`, 5, finalY + 38);
  doc.text('----------------------------------------------------', centerX, finalY + 42, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('¡ESTE NO ES UN DOCUMENTO FISCAL!', centerX, finalY + 48, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('NO ES VÁLIDO PARA CRÉDITO FISCAL O IVA.', centerX, finalY + 52, { align: 'center' });
  doc.text('----------------------------------------------------', centerX, finalY + 56, { align: 'center' });
  doc.setFontSize(8);
  doc.text('¡GRACIAS POR SU PREFERENCIA!', centerX, finalY + 62, { align: 'center' });
  doc.text('Conserve su recibo para cualquier reclamo.', centerX, finalY + 66, { align: 'center' });

  // Se elimina la línea: doc.save(...)
  return doc;
};