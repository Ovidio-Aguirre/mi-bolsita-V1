// src/pages/SettingsPage/components/EditCategoryForm.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { type Category, updateCategory, deleteCategory } from '../../../services/firestoreService';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';

interface EditCategoryFormProps {
  category: Category;
  onClose: () => void;
}

export const EditCategoryForm = ({ category, onClose }: EditCategoryFormProps) => {
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setName(category.name);
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || name.trim() === '') return;

    setIsLoading(true);
    const result = await updateCategory(currentUser.uid, category.id, name.trim());
    setIsLoading(false);

    if (result.success) {
      onClose();
    } else {
      alert("Hubo un error al actualizar la categoría.");
    }
  };

  const handleDelete = async () => {
    if (!currentUser) return;
    const isConfirmed = window.confirm(`¿Seguro que quieres eliminar la categoría "${category.name}"?`);
    if (isConfirmed) {
      setIsLoading(true);
      await deleteCategory(currentUser.uid, category.id);
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Editar Categoría</Typography>
        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDelete} disabled={isLoading}>
          Eliminar
        </Button>
      </Box>
      <TextField label="Nombre de la categoría" value={name} onChange={e => setName(e.target.value)} required />
      <Button type="submit" variant="contained" disabled={isLoading}>
        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </Box>
  );
};