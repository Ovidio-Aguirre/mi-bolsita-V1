// src/pages/ReportsPage/ReportsPage.tsx
import { useState } from 'react';
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

  const handleGenerateStatement = (format: 'pdf' | 'excel') => {
    const filtered = getFilteredTransactions();
    if (filtered.length === 0) { alert("No hay transacciones en el período seleccionado."); return; }
    if (format === 'pdf') {
      generateStatementPDF(filtered, categories, startDate, endDate);
    } else {
      generateStatementExcel(filtered, categories);
    }
  };

  const handleGenerateSales = (format: 'pdf' | 'excel') => {
    const filtered = getFilteredTransactions().filter(t => t.productId);
    if (filtered.length === 0) { alert("No hay ventas de productos en el período seleccionado."); return; }
    if (format === 'pdf') {
      generateSalesReportPDF(filtered, products, startDate, endDate);
    } else {
      generateSalesReportExcel(filtered, products);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>Generar Reportes</Typography>
      
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Reportes por Período</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2, mb: 2, flexWrap: 'wrap' }}>
              <TextField label="Fecha de Inicio" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField label="Fecha de Fin" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button variant="contained" onClick={() => handleGenerateStatement('pdf')}>Financiero (PDF)</Button>
              <Button variant="outlined" color="success" onClick={() => handleGenerateStatement('excel')}>Financiero (Excel)</Button>
              <Button variant="contained" color="success" onClick={() => handleGenerateSales('pdf')}>Ventas (PDF)</Button>
              <Button variant="outlined" color="primary" onClick={() => handleGenerateSales('excel')}>Ventas (Excel)</Button>
            </Box>
          </Paper>
        </Grid>

        <Grid xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Reporte de Inventario</Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button variant="contained" onClick={() => generateInventoryReportPDF(products)}>Inventario (PDF)</Button>
              <Button variant="outlined" color="success" onClick={() => generateInventoryExcel(products)}>Inventario (Excel)</Button>
            </Box>
          </Paper>
        </Grid>

        <Grid xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Reporte de Deudas</Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button variant="contained" onClick={() => generateDebtsReportPDF(debts)}>Deudas (PDF)</Button>
              <Button variant="outlined" color="success" onClick={() => generateDebtsReportExcel(debts)}>Deudas (Excel)</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};