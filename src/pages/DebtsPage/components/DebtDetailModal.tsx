// src/pages/DebtsPage/components/DebtDetailModal.tsx
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { type Debt, addPaymentToDebt, deleteDebt } from '../../../services/firestoreService'; // 1. Importar deleteDebt
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete'; // Importar ícono

interface DebtDetailModalProps {
  debt: Debt | null;
  onClose: () => void;
}

export const DebtDetailModal = ({ debt, onClose }: DebtDetailModalProps) => {
  const { currentUser } = useAuth();
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!debt) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    if (!currentUser || !amount) return;

    setIsLoading(true);
    const result = await addPaymentToDebt(currentUser.uid, debt.id, amount);
    setIsLoading(false);

    if (result.success) {
      setPaymentAmount('');
    }
  };
  
  // 2. Lógica para eliminar la deuda
  const handleDelete = async () => {
    if (!currentUser || !debt) return;

    const isConfirmed = window.confirm(`¿Estás seguro de que quieres eliminar la deuda con ${debt.personName}? Esta acción no se puede deshacer.`);

    if (isConfirmed) {
      setIsLoading(true);
      await deleteDebt(currentUser.uid, debt.id);
      setIsLoading(false);
      onClose(); // Cerrar el modal después de eliminar
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" gutterBottom>{debt.personName}</Typography>
        {/* 3. Botón para eliminar */}
        <Button 
          variant="outlined" 
          color="error" 
          startIcon={<DeleteIcon />}
          onClick={handleDelete}
          disabled={isLoading}
        >
          Eliminar
        </Button>
      </Box>
      
      <Typography variant="body1"><strong>Concepto:</strong> {debt.concept}</Typography>
      <Typography variant="body1"><strong>Monto Original:</strong> ${debt.initialAmount.toFixed(2)}</Typography>
      <Typography variant="h6" color="error" sx={{ my: 2 }}>
        <strong>Saldo Pendiente: ${debt.currentBalance.toFixed(2)}</strong>
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Monto del Abono ($)"
          type="number"
          value={paymentAmount}
          onChange={e => setPaymentAmount(e.target.value)}
          required
          size="small"
        />
        <Button type="submit" variant="contained" disabled={isLoading}>
          {isLoading ? 'Registrando...' : 'Registrar Abono'}
        </Button>
      </Box>
      
      <Button onClick={onClose} sx={{ mt: 3 }}>
        Cerrar
      </Button>
    </Box>
  );
};