// src/pages/HomePage/components/DailyClosingModal.tsx
import toast from 'react-hot-toast';
import { type Transaction, type Product } from '../../../services/firestoreService';
import { useProducts } from '../../../hooks/useProducts';
import { generateDailyClosingPDF } from '../../../services/reportGenerator';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

interface DailyClosingModalProps {
  transactions: Transaction[]; // Solo las transacciones de HOY
  onClose: () => void;
}

export const DailyClosingModal = ({ transactions, onClose }: DailyClosingModalProps) => {
  const { products } = useProducts(); // Obtener la lista de todos los productos

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const today = new Date();
  const formattedDate = today.toLocaleDateString('es-SV', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const simpleDate = today.toISOString().slice(0, 10);

  const handleExportPDF = () => {
    const promise = new Promise<void>((resolve, reject) => {
        try {
            if (transactions.length === 0) {
                throw new Error("No hay transacciones hoy para generar un reporte.");
            }
            const doc = generateDailyClosingPDF(transactions, products);
            doc.save(`Cierre_Caja_${simpleDate}.pdf`);
            resolve();
        } catch (error: any) { // Capturar el error para mostrarlo
            reject(error.message || 'Error al generar el PDF.');
        }
    });

    toast.promise(promise, {
      loading: 'Generando PDF...',
      success: '¡PDF de Cierre de Caja descargado!',
      error: (err) => err, // Mostrar el mensaje de error específico
    });
  };

  return (
    <Paper sx={{ p: 3, minWidth: { xs: '90vw', sm: '500px' } }}> {/* Hacer el ancho adaptable */}
      <Typography variant="h5" component="h2" gutterBottom>Cierre de Caja Diario</Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>{formattedDate}</Typography>
      <Divider sx={{ my: 2 }} />
      <Grid container spacing={2} sx={{ my: 2 }}>
        <Grid item xs={6}><Typography variant="body1">Total Ingresos:</Typography></Grid> {/* Ajustar tamaño de fuente */}
        <Grid item xs={6} sx={{ textAlign: 'right' }}><Typography variant="body1" color="green" fontWeight="bold">+${totalIncome.toFixed(2)}</Typography></Grid>
        <Grid item xs={6}><Typography variant="body1">Total Gastos:</Typography></Grid>
        <Grid item xs={6} sx={{ textAlign: 'right' }}><Typography variant="body1" color="red" fontWeight="bold">-${totalExpense.toFixed(2)}</Typography></Grid>
        <Grid item xs={12}><Divider /></Grid>
        <Grid item xs={6}><Typography variant="h6">Ganancia Neta:</Typography></Grid> {/* Ajustar tamaño de fuente */}
        <Grid item xs={6} sx={{ textAlign: 'right' }}><Typography variant="h6" fontWeight="bold">${netProfit.toFixed(2)}</Typography></Grid>
      </Grid>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={handleExportPDF} variant="outlined">
          Exportar Resumen a PDF
        </Button>
        <Button onClick={onClose} variant="contained">Cerrar</Button>
      </Box>
    </Paper>
  );
};