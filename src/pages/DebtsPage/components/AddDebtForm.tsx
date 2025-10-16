// src/pages/DebtsPage/components/AddDebtForm.tsx
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { addDebt, type Debt } from '../../../services/firestoreService'; // 1. Importar el tipo 'Debt'
import { Timestamp } from 'firebase/firestore';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Typography from '@mui/material/Typography';

interface AddDebtFormProps {
  onClose: () => void;
}

export const AddDebtForm = ({ onClose }: AddDebtFormProps) => {
  const { currentUser } = useAuth();
  const [personName, setPersonName] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [concept, setConcept] = useState('');
  const [type, setType] = useState<'receivable' | 'payable'>('receivable');
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !personName || !initialAmount) {
      alert("Por favor, completa los campos obligatorios.");
      return;
    }

    setIsLoading(true);

    // 2. Creamos un objeto con el tipo correcto, eliminando 'as any'
    const debtData: Omit<Debt, 'id' | 'createdAt' | 'uid' | 'currentBalance'> = {
      type,
      personName,
      initialAmount: parseFloat(initialAmount),
      concept,
      dueDate: dueDate ? Timestamp.fromDate(new Date(dueDate)) : undefined,
    };

    const result = await addDebt(currentUser.uid, debtData);
    setIsLoading(false);

    if (result.success) {
      onClose();
    } else {
      alert("Hubo un error al guardar la deuda.");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5" component="h2">Añadir Nueva Deuda</Typography>
      
      <FormControl>
        <FormLabel>Tipo de Deuda</FormLabel>
        <RadioGroup row value={type} onChange={(e) => setType(e.target.value as typeof type)}>
          <FormControlLabel value="receivable" control={<Radio />} label="Me Debe (Cliente)" />
          <FormControlLabel value="payable" control={<Radio />} label="Yo Debo (Proveedor)" />
        </RadioGroup>
      </FormControl>

      <TextField label="Nombre de la Persona o Empresa" value={personName} onChange={(e) => setPersonName(e.target.value)} required fullWidth />
      <TextField label="Monto Inicial ($)" type="number" value={initialAmount} onChange={(e) => setInitialAmount(e.target.value)} required fullWidth />
      <TextField label="Concepto (Ej: Mercadería, Préstamo)" value={concept} onChange={(e) => setConcept(e.target.value)} required fullWidth />
      
      <TextField
        label="Fecha de Vencimiento (Opcional)"
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        fullWidth
        InputLabelProps={{ shrink: true }}
      />
      
      <Button type="submit" variant="contained" disabled={isLoading} sx={{ mt: 2 }}>
        {isLoading ? 'Guardando...' : 'Guardar Deuda'}
      </Button>
    </Box>
  );
};