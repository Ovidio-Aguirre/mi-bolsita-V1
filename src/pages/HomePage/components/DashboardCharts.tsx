// src/pages/HomePage/components/DashboardCharts.tsx
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, PointElement, LineElement, Filler // <-- 1. Importar Filler
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { useTransactions } from '../../../hooks/useTransactions';
import { useCategories } from '../../../hooks/useCategories';
import { type Transaction, type Category } from '../../../services/firestoreService';

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, 
  LinearScale, PointElement, LineElement, Filler // <-- 2. Registrar Filler
);

// ... (El resto del archivo, processPieChartData, processLineChartData, etc., permanece sin cambios)
const processPieChartData = (transactions: Transaction[], categories: Category[]) => {
    const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));
    const expenseData: { [key: string]: number } = {};
    transactions.filter(t => t.type === 'expense' && t.categoryId).forEach(t => {
        const categoryName = categoryMap.get(t.categoryId!) || 'Sin Categoría';
        if (expenseData[categoryName]) { expenseData[categoryName] += t.amount; } 
        else { expenseData[categoryName] = t.amount; }
    });
    const labels = Object.keys(expenseData);
    const data = Object.values(expenseData);
    return {
        labels,
        datasets: [{ label: 'Gastos por Categoría', data, backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'] }],
    };
};
const processLineChartData = (transactions: Transaction[]) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - i);
        return d.toLocaleDateString('es-SV', { day: 'numeric', month: 'short' });
    }).reverse();
    const dailyData: { [key: string]: { income: number, expense: number } } = {};
    last7Days.forEach(day => { dailyData[day] = { income: 0, expense: 0 }; });
    transactions.forEach(t => {
        const transactionDate = t.createdAt?.toDate().toLocaleDateString('es-SV', { day: 'numeric', month: 'short' });
        if (dailyData[transactionDate]) {
            if (t.type === 'income') { dailyData[transactionDate].income += t.amount; } 
            else { dailyData[transactionDate].expense += t.amount; }
        }
    });
    return {
        labels: last7Days,
        datasets: [
            { label: 'Ingresos', data: last7Days.map(day => dailyData[day].income), borderColor: '#28a745', backgroundColor: 'rgba(40, 167, 69, 0.2)', fill: true, tension: 0.2 },
            { label: 'Gastos', data: last7Days.map(day => dailyData[day].expense), borderColor: '#dc3545', backgroundColor: 'rgba(220, 53, 69, 0.2)', fill: true, tension: 0.2 },
        ],
    };
};
export const DashboardCharts = () => {
    const { transactions, loading: transactionsLoading } = useTransactions();
    const { categories, loading: categoriesLoading } = useCategories();
    if (transactionsLoading || categoriesLoading) { return <p>Cargando gráficas...</p>; }
    const pieChartData = processPieChartData(transactions, categories);
    const lineChartData = processLineChartData(transactions);
    const hasExpenseData = pieChartData.labels.length > 0;
    const hasLineData = lineChartData.datasets.some(ds => ds.data.some(d => d > 0));
    if (!hasExpenseData && !hasLineData) { return <p style={{textAlign: 'center', margin: '2rem 0', color: '#888'}}>Registra movimientos para ver tus gráficas.</p>; }
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', margin: '2rem 0' }}>
            {hasLineData && (
                <div>
                    <h3 style={{textAlign: 'center', marginBottom: '1rem'}}>Flujo de Caja (Últimos 7 Días)</h3>
                    <Line data={lineChartData} />
                </div>
            )}
            {hasExpenseData && (
                <div>
                    <h3 style={{textAlign: 'center', marginBottom: '1rem'}}>Distribución de Gastos</h3>
                    <div style={{ maxWidth: '350px', margin: 'auto' }}><Pie data={pieChartData} /></div>
                </div>
            )}
        </div>
    );
};