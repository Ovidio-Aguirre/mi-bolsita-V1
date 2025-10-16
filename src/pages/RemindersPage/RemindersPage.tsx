// src/pages/RemindersPage/RemindersPage.tsx
import { useProducts } from '../../hooks/useProducts';
import { useDebts } from '../../hooks/useDebts';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import WarningIcon from '@mui/icons-material/Warning';
import ListItemIcon from '@mui/material/ListItemIcon';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';

const LOW_STOCK_THRESHOLD = 5;

export const RemindersPage = () => {
  const { products, loading: productsLoading } = useProducts();
  const { debts, loading: debtsLoading } = useDebts();

  // --- Lógica para Alertas de Stock Bajo ---
  const lowStockProducts = products.filter(p => p.stock <= LOW_STOCK_THRESHOLD);

  // --- Lógica CORREGIDA para Alertas de Deudas ---
  // Establecemos 'hoy' al inicio del día (medianoche) para una comparación justa.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Establecemos el límite a 7 días en el futuro
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(today.getDate() + 7);
  sevenDaysFromNow.setHours(23, 59, 59, 999); // Final del séptimo día

  const upcomingDebts = debts.filter(debt => {
    if (!debt.dueDate) return false;
    const dueDate = debt.dueDate.toDate();
    // Ahora la comparación funciona para deudas que vencen hoy.
    return dueDate >= today && dueDate <= sevenDaysFromNow;
  });

  const loading = productsLoading || debtsLoading;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Centro de Recordatorios
      </Typography>

      {/* Sección de Stock Bajo */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Alertas de Stock Bajo</Typography>
        {loading ? <CircularProgress size={24} /> : (
          <List>
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map(product => (
                <ListItem key={`prod-${product.id}`} divider>
                  <ListItemIcon><WarningIcon color="warning" /></ListItemIcon>
                  <ListItemText primary={product.name} secondary={`Quedan solo ${product.stock} unidades.`} />
                </ListItem>
              ))
            ) : <Typography sx={{ p: 2, color: 'text.secondary' }}>No hay productos con bajo stock.</Typography>}
          </List>
        )}
      </Paper>

      {/* Sección de Deudas por Vencer */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Deudas por Vencer (Próximos 7 días)</Typography>
        {loading ? <CircularProgress size={24} /> : (
          <List>
            {upcomingDebts.length > 0 ? (
              upcomingDebts.map(debt => (
                <ListItem key={`debt-${debt.id}`} divider>
                  <ListItemIcon><RequestQuoteIcon color={debt.type === 'receivable' ? 'success' : 'error'} /></ListItemIcon>
                  <ListItemText
                    primary={`${debt.type === 'receivable' ? 'Cobrar a' : 'Pagar a'}: ${debt.personName}`}
                    secondary={`Vence el ${debt.dueDate?.toDate().toLocaleDateString('es-SV')} - Saldo: $${debt.currentBalance.toFixed(2)}`}
                  />
                </ListItem>
              ))
            ) : <Typography sx={{ p: 2, color: 'text.secondary' }}>No hay deudas próximas a vencer.</Typography>}
          </List>
        )}
      </Paper>
    </Box>
  );
};