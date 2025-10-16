// src/pages/HomePage/components/EditTransactionForm.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useCategories } from '../../../hooks/useCategories';
import { type Transaction, updateTransaction, deleteTransaction } from '../../../services/firestoreService';
import { Timestamp } from 'firebase/firestore';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import DeleteIcon from '@mui/icons-material/Delete';

interface EditTransactionFormProps {
  transaction: Transaction;
  onClose: () => void;
}

export const EditTransactionForm = ({ transaction, onClose }: EditTransactionFormProps) => {
  const { currentUser } = useAuth();
  const { categories } = useCategories();

  const [amount, setAmount] = useState('');
  const [concept, setConcept] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAmount(transaction.amount.toString());
    setConcept(transaction.concept);
    setCategoryId(transaction.categoryId || '');
    // Formatear la fecha para el input type="date"
    const transactionDate = transaction.createdAt.toDate();
    setDate(transactionDate.toISOString().split('T')[0]);
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsLoading(true);
    const updatedData = {
      amount: parseFloat(amount),
      concept: concept.trim(),
      categoryId: categoryId,
      createdAt: Timestamp.fromDate(new Date(date)),
    };

    const result = await updateTransaction(currentUser.uid, transaction.id, updatedData);
    setIsLoading(false);

    if (result.success) {
      onClose();
    } else {
      alert("Hubo un error al actualizar.");
    }
  };

  const handleDelete = async () => {
    if (!currentUser) return;
    const isConfirmed = window.confirm(`¿Seguro que quieres eliminar esta transacción?`);
    if (isConfirmed) {
      setIsLoading(true);
      await deleteTransaction(currentUser.uid, transaction.id);
      setIsLoading(false);
      onClose();
    }
  };

  const availableCategories = categories.filter(c => c.type === transaction.type);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Editar Movimiento</Typography>
        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDelete} disabled={isLoading}>
          Eliminar
        </Button>
      </Box>
      <TextField label="Fecha" type="date" value={date} onChange={e => setDate(e.target.value)} InputLabelProps={{ shrink: true }} required />
      <TextField label="Monto ($)" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
      <FormControl fullWidth>
        <InputLabel>Categoría</InputLabel>
        <Select value={categoryId} label="Categoría" onChange={e => setCategoryId(e.target.value)} required>
          {availableCategories.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
        </Select>
      </FormControl>
      <TextField label="Concepto o nota" value={concept} onChange={e => setConcept(e.target.value)} />
      <Button type="submit" variant="contained" disabled={isLoading} sx={{ mt: 1 }}>
        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </Box>
  );
};