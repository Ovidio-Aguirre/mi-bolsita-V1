// src/pages/HomePage/components/BalanceSummary.tsx
import { useTransactions } from '../../../hooks/useTransactions';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';

export const BalanceSummary = () => {
  const { transactions, loading } = useTransactions();

  const totalIncome = (transactions || []).filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = (transactions || []).filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpense;

  if (loading) {
    return <Skeleton variant="rectangular" width="100%" height={118} />;
  }

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Grid container spacing={2} textAlign="center">
          <Grid xs={4}>
            <Typography color="text.secondary" gutterBottom>Ingresos</Typography>
            <Typography variant="h5" component="div" color="green">${totalIncome.toFixed(2)}</Typography>
          </Grid>
          <Grid xs={4}>
            <Typography color="text.secondary" gutterBottom>Gastos</Typography>
            <Typography variant="h5" component="div" color="red">${totalExpense.toFixed(2)}</Typography>
          </Grid>
          <Grid xs={4}>
            <Typography color="text.secondary" gutterBottom>Ganancia Neta</Typography>
            <Typography variant="h5" component="div">${netProfit.toFixed(2)}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};