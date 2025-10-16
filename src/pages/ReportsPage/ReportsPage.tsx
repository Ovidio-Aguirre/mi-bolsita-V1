// src/pages/ReportsPage/ReportsPage.tsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { useTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import { useDebts } from '../../hooks/useDebts';
import { 
  generateStatementPDF, generateSalesReportPDF, 
  generateInventoryReportPDF, generateDebtsReportPDF 
} from '../../services/reportGenerator';
import { 
  generateInventoryExcel, generateStatementExcel, 
  generateSalesReportExcel, generateDebtsReportExcel 
} from '../../services/excelGenerator';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

export const ReportsPage = () => {
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { products } = useProducts();
  const { debts } = useDebts();
  
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);

  const getFilteredTransactions = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return transactions.filter(t => t.createdAt.toDate() >= start && t.createdAt.toDate() <= end);
  };

  const handleGenerateReport = (reportType: string, format: 'pdf' | 'excel') => {
    const promise = new Promise((resolve, reject) => {
        try {
            let fileName = `Reporte_${reportType}_${new Date().toISOString().slice(0, 10)}`;
            if (reportType.includes('Financiero') || reportType.includes('Ventas')) {
                const filtered = getFilteredTransactions();
                if (filtered.length === 0) { throw new Error("No hay datos en el período seleccionado."); }
                
                if (format === 'pdf') {
                    const doc = reportType.includes('Financiero') ? generateStatementPDF(filtered, categories, startDate, endDate) : generateSalesReportPDF(filtered, products, startDate, endDate);
                    doc.save(`${fileName}.pdf`);
                } else {
                    const wb = reportType.includes('Financiero') ? generateStatementExcel(filtered, categories) : generateSalesReportExcel(filtered, products);
                    XLSX.writeFile(wb, `${fileName}.xlsx`);
                }
            } else { // Reportes sin filtro de fecha
                if (format === 'pdf') {
                    const doc = reportType.includes('Inventario') ? generateInventoryReportPDF(products) : generateDebtsReportPDF(debts);
                    doc.save(`${fileName}.pdf`);
                } else {
                    const wb = reportType.includes('Inventario') ? generateInventoryExcel(products) : generateDebtsReportExcel(debts);
                    XLSX.writeFile(wb, `${fileName}.xlsx`);
                }
            }
            resolve('¡Reporte generado!');
        } catch (error: any) {
            reject(error.message || 'Error al generar el reporte.');
        }
    });

    toast.promise(promise, {
      loading: 'Generando reporte...',
      success: '¡Reporte descargado!',
      error: (err) => err,
    });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>Generar Reportes</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Reportes por Período</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2, mb: 2, flexWrap: 'wrap' }}>
              <TextField label="Fecha de Inicio" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField label="Fecha de Fin" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button variant="contained" onClick={() => handleGenerateReport('Financiero', 'pdf')}>Financiero (PDF)</Button>
              <Button variant="outlined" color="success" onClick={() => handleGenerateReport('Financiero', 'excel')}>Financiero (Excel)</Button>
              <Button variant="contained" color="success" onClick={() => handleGenerateReport('Ventas', 'pdf')}>Ventas (PDF)</Button>
              <Button variant="outlined" color="primary" onClick={() => handleGenerateReport('Ventas', 'excel')}>Ventas (Excel)</Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Reporte de Inventario</Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button variant="contained" onClick={() => handleGenerateReport('Inventario', 'pdf')}>Inventario (PDF)</Button>
              <Button variant="outlined" color="success" onClick={() => handleGenerateReport('Inventario', 'excel')}>Inventario (Excel)</Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Reporte de Deudas</Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button variant="contained" onClick={() => handleGenerateReport('Deudas', 'pdf')}>Deudas (PDF)</Button>
              <Button variant="outlined" color="success" onClick={() => handleGenerateReport('Deudas', 'excel')}>Deudas (Excel)</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};